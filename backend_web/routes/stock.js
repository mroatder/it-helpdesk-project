const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = (req, res, next) => {
    const userRole = req.user && req.user.role ? req.user.role.toUpperCase() : '';
    if (userRole === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access Denied: Admin Only' });
    }
};

router.use(authMiddleware); // ต้อง Login ก่อน
router.use(adminOnly);      // ต้องเป็น Admin เท่านั้น

// 1. GET: ดึงรายการ Stock ทั้งหมด
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT * FROM spare_parts ORDER BY part_name ASC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. POST: เพิ่ม Stock ใหม่ (ตัด unit_cost ออก)
router.post('/add', async (req, res) => {
    const { part_name, qty_on_hand, min_stock } = req.body; // ลบ unit_cost

    if (!part_name) return res.status(400).send('Part Name is required');

    try {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('part_name', sql.NVarChar, part_name);
        request.input('qty', sql.Int, qty_on_hand || 0);
        request.input('min', sql.Int, min_stock || 0);

        await request.query(`
            INSERT INTO spare_parts (part_name, qty_on_hand, min_stock)
            VALUES (@part_name, @qty, @min)
        `);
        res.json({ success: true, message: 'Added successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. PUT: แก้ไข Stock (ตัด unit_cost ออก)
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { part_name, qty_on_hand, min_stock } = req.body; // ลบ unit_cost

    try {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('id', sql.Int, id);
        request.input('part_name', sql.NVarChar, part_name);
        request.input('qty', sql.Int, qty_on_hand || 0);
        request.input('min', sql.Int, min_stock || 0);

        await request.query(`
            UPDATE spare_parts 
            SET part_name = @part_name, 
                qty_on_hand = @qty, 
                min_stock = @min
            WHERE part_id = @id
        `);
        res.json({ success: true, message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. DELETE: ลบ Stock
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('id', sql.Int, id);

        await request.query(`DELETE FROM spare_parts WHERE part_id = @id`);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;