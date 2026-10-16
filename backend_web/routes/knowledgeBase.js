const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access Denied: Admin Only' });
    }
};

router.use(authMiddleware);

// --- 📂 ส่วนจัดการการอัปโหลดไฟล์ (Upload Configuration) ---
// ตรวจสอบให้แน่ใจว่า path นี้ถูกต้องเมื่อรันบนเซิร์ฟเวอร์จริง
const uploadDir = path.join(__dirname, '../../uploads/kb');

// สร้างโฟลเดอร์ถ้ายังไม่มี
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // ตั้งชื่อไฟล์ใหม่ป้องกันชื่อซ้ำ
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'kb-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 30 * 1024 * 1024 }, // จำกัด 30MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น!'));
    }
});

// --- 🚀 API Routes ---

// ✅ 1. Endpoint สำหรับอัปโหลดรูปภาพ
router.post('/upload', adminOnly, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'กรุณาเลือกไฟล์รูปภาพ' });
        }
        // คืนค่า URL ที่จะเก็บใน DB (ต้องสัมพันธ์กับ app.use('/uploads', ...) ใน server.js)
        const imageUrl = `/uploads/kb/${req.file.filename}`;
        res.json({ success: true, imageUrl: imageUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ 2. GET: ดึงข้อมูลทั้งหมด
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const pool = await poolPromise;
        let query = 'SELECT * FROM knowledge_base';

        if (category && category !== 'ALL') {
            query += ` WHERE category_id = @category`;
        }

        query += ' ORDER BY created_at DESC';

        const request = pool.request();
        if (category && category !== 'ALL') request.input('category', sql.NVarChar, category);

        const result = await request.query(query);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ 3. POST: สร้างบทความใหม่
router.post('/', adminOnly, async (req, res) => {
    try {
        const { title, short_desc, content, category_id, image_url } = req.body;

        // 🎯 ดึง ID ของคนสร้างจาก Token (ถ้าหน้าบ้านไม่ได้ส่งมา)
        const created_by = req.body.created_by || (req.user ? req.user.id : null);

        const pool = await poolPromise;

        await pool.request()
            .input('title', sql.NVarChar, title)
            .input('short_desc', sql.NVarChar, short_desc)
            .input('content', sql.NVarChar, content)
            .input('category_id', sql.NVarChar, category_id)
            .input('created_by', sql.Int, created_by)
            .input('image_url', sql.NVarChar, image_url || null)
            .query(`
                INSERT INTO knowledge_base (title, short_desc, content, category_id, created_by, image_url, created_at, updated_at)
                VALUES (@title, @short_desc, @content, @category_id, @created_by, @image_url, GETDATE(), GETDATE())
            `);

        res.json({ success: true, message: 'Created successfully' });
    } catch (err) {
        console.error("Database Insert Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ 4. PUT: แก้ไขบทความ
router.put('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, short_desc, content, category_id, image_url } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, title)
            .input('short_desc', sql.NVarChar, short_desc)
            .input('content', sql.NVarChar, content)
            .input('category_id', sql.NVarChar, category_id)
            .input('image_url', sql.NVarChar, image_url || null)
            .query(`
                UPDATE knowledge_base 
                SET title=@title, short_desc=@short_desc, content=@content, category_id=@category_id, image_url=@image_url, updated_at=GETDATE()
                WHERE id = @id
            `);

        res.json({ success: true, message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ 5. DELETE: ลบบทความ
router.delete('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request().input('id', sql.Int, id).query('DELETE FROM knowledge_base WHERE id = @id');
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;