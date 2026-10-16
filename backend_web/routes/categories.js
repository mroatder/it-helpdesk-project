const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access Denied: Admin Only' });
    }
};

router.use(authMiddleware);

// 🟢 1. API ดึงข้อมูลทั้งหมด (แยก Main และ Sub)
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;

        // ใช้ Promise.all เพื่อรัน Query พร้อมกันทั้ง 2 คำสั่ง (Performance Optimization)
        const [mainQuery, subQuery] = await Promise.all([
            // Query 1: หมวดหมู่หลัก (Main)
            pool.request().query(`
                SELECT cat_id, category_name as name, is_active 
                FROM categories 
                WHERE is_active = 1
                ORDER BY category_name ASC
            `),
            // Query 2: หมวดหมู่ย่อย (Sub)
            pool.request().query(`
                SELECT sub_id, cat_id, sub_name as name, sla_hours, is_active 
                FROM sub_categories 
                WHERE is_active = 1
                ORDER BY sub_name ASC
            `)
        ]);

        res.json({
            success: true,
            data: {
                mainCategories: mainQuery.recordset,
                subCategories: subQuery.recordset
            }
        });

    } catch (err) {
        console.error('SQL Error:', err);
        res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
});

// 🔵 2. API เพิ่มข้อมูลใหม่ (รองรับทั้งแม่และลูก)
router.post('/create', adminOnly, async (req, res) => {
    // parentId ในที่นี้คือ cat_id ของแม่ (ถ้าส่งมาแปลว่าเป็นหมวดหมู่ย่อย)
    const { name, parentId, sla } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อหมวดหมู่' });

    try {
        const pool = await poolPromise;

        if (parentId) {
            // === กรณีเพิ่มหมวดหมู่ย่อย (Sub Category) ===

            // Step 1: เช็คชื่อซ้ำใน sub_categories ภายใต้ cat_id เดียวกัน
            const checkDuplicate = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('catId', sql.Int, parentId)
                .query(`
                    SELECT TOP 1 1 FROM sub_categories 
                    WHERE sub_name = @name AND cat_id = @catId AND is_active = 1
                `);

            if (checkDuplicate.recordset.length > 0) {
                return res.status(400).json({ success: false, message: 'ชื่อหมวดหมู่ย่อยนี้มีอยู่แล้วในหมวดหลักนี้' });
            }

            // Step 2: บันทึกลง sub_categories
            await pool.request()
                .input('name', sql.NVarChar, name)
                .input('catId', sql.Int, parentId)
                .input('sla', sql.Int, sla || 24) // Default SLA 24 ถ้าไม่ส่งมา
                .query(`
                    INSERT INTO sub_categories (cat_id, sub_name, sla_hours, is_active)
                    VALUES (@catId, @name, @sla, 1)
                `);

        } else {
            // === กรณีเพิ่มหมวดหมู่หลัก (Main Category) ===

            // Step 1: เช็คชื่อซ้ำใน categories
            const checkDuplicate = await pool.request()
                .input('name', sql.NVarChar, name)
                .query(`
                    SELECT TOP 1 1 FROM categories 
                    WHERE category_name = @name AND is_active = 1
                `);

            if (checkDuplicate.recordset.length > 0) {
                return res.status(400).json({ success: false, message: 'ชื่อหมวดหมู่หลักนี้มีอยู่แล้ว' });
            }

            // Step 2: บันทึกลง categories
            await pool.request()
                .input('name', sql.NVarChar, name)
                .query(`
                    INSERT INTO categories (category_name, is_active)
                    VALUES (@name, 1)
                `);
        }

        res.json({ success: true, message: 'บันทึกข้อมูลสำเร็จ' });

    } catch (err) {
        console.error('Insert Error:', err);
        res.status(500).json({ success: false, message: 'Database Error: ' + err.message });
    }
});

// 🔴 3. API ลบข้อมูล (Soft Delete)
router.post('/delete', adminOnly, async (req, res) => {
    // ต้องรับ type มาด้วยว่าลบ MAIN หรือ SUB เพราะ ID อาจซ้ำกันได้ระหว่าง 2 ตาราง
    const { id, type } = req.body;

    if (!id || !type) return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน (ระบุ ID และ Type)' });

    try {
        const pool = await poolPromise;

        if (type === 'MAIN') {
            // กรณีลบหมวดหมู่หลัก: ต้องเช็คก่อนว่ามีลูกไหม
            const checkChildren = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT TOP 1 1 FROM sub_categories WHERE cat_id = @id AND is_active = 1');

            if (checkChildren.recordset.length > 0) {
                return res.status(400).json({ success: false, message: 'ไม่สามารถลบได้: กรุณาลบหมวดหมู่ย่อยภายในหมวดนี้ออกให้หมดก่อน' });
            }

            // Soft Delete ตาราง categories
            await pool.request()
                .input('id', sql.Int, id)
                .query('UPDATE categories SET is_active = 0 WHERE cat_id = @id');

        } else if (type === 'SUB') {
            // กรณีลบหมวดหมู่ย่อย: Soft Delete ตาราง sub_categories ได้เลย
            await pool.request()
                .input('id', sql.Int, id)
                .query('UPDATE sub_categories SET is_active = 0 WHERE sub_id = @id');
        } else {
            return res.status(400).json({ success: false, message: 'Type ไม่ถูกต้อง (ต้องเป็น MAIN หรือ SUB)' });
        }

        res.json({ success: true, message: 'ลบข้อมูลสำเร็จ' });

    } catch (err) {
        console.error('Delete Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;