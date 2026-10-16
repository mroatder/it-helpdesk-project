const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pingHost } = require('../services/pingService');

// 📸 Multer setup for CCTV images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/cctv-map');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'CCTV-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB Limit
});

// Middleware: Admin check
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access Denied: Admin privileges required.'
        });
    }
};

// Auto Create Table helper
let isTableChecked = false;
const ensureTableExists = async () => {
    if (isTableChecked) return;
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cctv')
            BEGIN
                CREATE TABLE cctv (
                    cctv_id INT IDENTITY(1,1) PRIMARY KEY,
                    cctv_name NVARCHAR(100) NOT NULL,
                    cctv_code NVARCHAR(50) NULL,
                    ip_address VARCHAR(50) NULL,
                    model_name NVARCHAR(100) NULL,
                    location_detail NVARCHAR(255) NULL,
                    status NVARCHAR(50) DEFAULT 'ACTIVE',
                    map_floor NVARCHAR(50) NULL,
                    map_x FLOAT NULL,
                    map_y FLOAT NULL,
                    map_rotate INT DEFAULT 0,
                    map_place NVARCHAR(255) NULL,
                    map_image NVARCHAR(255) NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE(),
                    is_deleted BIT DEFAULT 0,
                    sort_order INT DEFAULT 0
                );
            END
            ELSE
            BEGIN
                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID('cctv') AND name = 'sort_order'
                )
                BEGIN
                    ALTER TABLE cctv ADD sort_order INT DEFAULT 0;
                END
            END
        `);
        isTableChecked = true;
    } catch (err) {
        console.error("🚨 Error checking/creating cctv table:", err.message);
    }
};

// Middleware to ensure table exists
router.use(async (req, res, next) => {
    await ensureTableExists();
    next();
});

// 🟢 GET /api/cctv - List all active CCTV devices
router.get('/', async (req, res) => {
    try {
        const { search, floor, status } = req.query;
        const pool = await poolPromise;
        let query = `
            SELECT cctv_id, cctv_name, cctv_code, ip_address, model_name, 
                   location_detail, status, map_floor, map_x, map_y, 
                   map_rotate, map_place, map_image, sort_order, created_at, updated_at
            FROM cctv
            WHERE is_deleted = 0
        `;

        const request = pool.request();
        if (search) {
            request.input('search', sql.NVarChar, `%${search}%`);
            query += ` AND (cctv_name LIKE @search OR cctv_code LIKE @search OR ip_address LIKE @search OR location_detail LIKE @search)`;
        }
        if (floor) {
            request.input('floor', sql.NVarChar, floor);
            query += ` AND map_floor = @floor`;
        }
        if (status) {
            request.input('status', sql.NVarChar, status);
            query += ` AND status = @status`;
        }

        query += ` ORDER BY sort_order ASC, cctv_id DESC`;

        const result = await request.query(query);
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("GET /api/cctv Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 🟢 GET /api/cctv/map - Get CCTV markers for specific map floor
router.get('/map', async (req, res) => {
    try {
        const { floor } = req.query;
        if (!floor) return res.status(400).json({ success: false, message: 'Floor parameter is required' });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('floor', sql.NVarChar, floor)
            .query(`
                SELECT cctv_id, cctv_name, cctv_code, ip_address, model_name, 
                       location_detail, status, map_floor, map_x, map_y, 
                       map_rotate, map_place, map_image, sort_order
                FROM cctv
                WHERE map_floor = @floor AND is_deleted = 0
                ORDER BY sort_order ASC, cctv_id DESC
            `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("GET /api/cctv/map Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 🟢 GET /api/cctv/:id - Get single CCTV detail
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT * FROM cctv WHERE cctv_id = @id AND is_deleted = 0
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'CCTV device not found' });
        }

        res.json({ success: true, data: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 🔴 POST /api/cctv - Add new CCTV (Admin Only)
router.post('/', adminOnly, async (req, res) => {
    try {
        const {
            cctv_name, cctv_code, ip_address, model_name,
            location_detail, status, map_floor, map_x, map_y,
            map_rotate, map_place
        } = req.body;

        if (!cctv_name) {
            return res.status(400).json({ success: false, message: 'Camera name (cctv_name) is required' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVarChar, cctv_name)
            .input('code', sql.NVarChar, cctv_code || '')
            .input('ip', sql.VarChar, ip_address || '')
            .input('model', sql.NVarChar, model_name || '')
            .input('loc', sql.NVarChar, location_detail || '')
            .input('status', sql.NVarChar, status || 'ACTIVE')
            .input('floor', sql.NVarChar, map_floor || null)
            .input('x', sql.Float, map_x !== undefined && map_x !== null ? parseFloat(map_x) : null)
            .input('y', sql.Float, map_y !== undefined && map_y !== null ? parseFloat(map_y) : null)
            .input('rotate', sql.Int, map_rotate || 0)
            .input('place', sql.NVarChar, map_place || '')
            .query(`
                INSERT INTO cctv (
                    cctv_name, cctv_code, ip_address, model_name,
                    location_detail, status, map_floor, map_x, map_y,
                    map_rotate, map_place
                )
                OUTPUT INSERTED.cctv_id
                VALUES (
                    @name, @code, @ip, @model,
                    @loc, @status, @floor, @x, @y,
                    @rotate, @place
                )
            `);

        res.json({
            success: true,
            message: 'CCTV created successfully',
            cctv_id: result.recordset[0].cctv_id
        });
    } catch (err) {
        console.error("POST /api/cctv Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 🔴 PUT /api/cctv/:id - Update CCTV details (Admin Only)
router.put('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            cctv_name, cctv_code, ip_address, model_name,
            location_detail, status, map_floor, map_x, map_y,
            map_rotate, map_place
        } = req.body;

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, cctv_name)
            .input('code', sql.NVarChar, cctv_code || '')
            .input('ip', sql.VarChar, ip_address || '')
            .input('model', sql.NVarChar, model_name || '')
            .input('loc', sql.NVarChar, location_detail || '')
            .input('status', sql.NVarChar, status || 'ACTIVE')
            .input('floor', sql.NVarChar, map_floor || null)
            .input('x', sql.Float, map_x !== undefined && map_x !== null ? parseFloat(map_x) : null)
            .input('y', sql.Float, map_y !== undefined && map_y !== null ? parseFloat(map_y) : null)
            .input('rotate', sql.Int, map_rotate || 0)
            .input('place', sql.NVarChar, map_place || '')
            .query(`
                UPDATE cctv SET
                    cctv_name = @name,
                    cctv_code = @code,
                    ip_address = @ip,
                    model_name = @model,
                    location_detail = @loc,
                    status = @status,
                    map_floor = @floor,
                    map_x = @x,
                    map_y = @y,
                    map_rotate = @rotate,
                    map_place = @place,
                    updated_at = GETDATE()
                WHERE cctv_id = @id
            `);

        res.json({ success: true, message: 'CCTV updated successfully' });
    } catch (err) {
        console.error("PUT /api/cctv/:id Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 🔴 PUT /api/cctv/:id/position - Update CCTV map placement position only (Admin Only)
router.put('/:id/position', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { map_floor, map_x, map_y, map_rotate, map_place } = req.body;

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('floor', sql.NVarChar, map_floor || null)
            .input('x', sql.Float, map_x !== undefined && map_x !== null ? parseFloat(map_x) : null)
            .input('y', sql.Float, map_y !== undefined && map_y !== null ? parseFloat(map_y) : null)
            .input('rotate', sql.Int, map_rotate || 0)
            .input('place', sql.NVarChar, map_place || '')
            .query(`
                UPDATE cctv SET
                    map_floor = @floor,
                    map_x = @x,
                    map_y = @y,
                    map_rotate = @rotate,
                    map_place = @place,
                    updated_at = GETDATE()
                WHERE cctv_id = @id
            `);

        res.json({ success: true, message: 'CCTV position updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 🔴 DELETE /api/cctv/:id - Soft Delete CCTV (Admin Only)
router.delete('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query(`UPDATE cctv SET is_deleted = 1, updated_at = GETDATE() WHERE cctv_id = @id`);

        res.json({ success: true, message: 'CCTV deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 📸 POST /api/cctv/:id/upload-image - Upload CCTV Photo (Admin Only)
router.post('/:id/upload-image', adminOnly, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ success: false, message: 'No image file uploaded' });

        const filePath = `/uploads/cctv-map/${req.file.filename}`;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('path', sql.NVarChar, filePath)
            .query('UPDATE cctv SET map_image = @path, updated_at = GETDATE() WHERE cctv_id = @id');

        res.json({ success: true, message: 'Image uploaded successfully', filePath });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// 🔍 POST /api/cctv/ping-check - Ping all specified CCTV IPs and return online/offline status
router.post('/ping-check', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.json({ success: true, results: {} });
        }

        const pool = await poolPromise;

        // ดึง ip_address ของกล้องที่ส่ง ids มา
        const idList = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
        const result = await pool.request().query(`
            SELECT cctv_id, ip_address
            FROM cctv
            WHERE cctv_id IN (${idList.join(',')})
              AND ip_address IS NOT NULL
              AND ip_address != ''
              AND is_deleted = 0
        `);

        const cameras = result.recordset;

        // Ping ทุกตัวพร้อมกัน (parallel)
        const pingResults = await Promise.all(
            cameras.map(async (cam) => {
                const online = await pingHost(cam.ip_address);
                return { id: cam.cctv_id, online };
            })
        );

        // สร้าง map cctv_id -> online (true/false)
        const resultsMap = {};
        // กล้องที่ไม่มี IP → undefined (ไม่รู้สถานะ)
        for (const cam of cameras) {
            const found = pingResults.find(r => r.id === cam.cctv_id);
            resultsMap[cam.cctv_id] = found ? found.online : false;
        }

        console.log(`[CCTV Ping] Checked ${cameras.length} cameras. Online: ${pingResults.filter(r => r.online).length}`);
        res.json({ success: true, results: resultsMap });
    } catch (err) {
        console.error('POST /api/cctv/ping-check Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 🔴 PUT /api/cctv/reorder - Reorder CCTV items (Admin Only)
router.put('/reorder', adminOnly, async (req, res) => {
    try {
        const { items } = req.body; // array of { cctv_id, sort_order }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid items array' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            for (const item of items) {
                const request = new sql.Request(transaction);
                await request
                    .input('id', sql.Int, item.cctv_id)
                    .input('order', sql.Int, item.sort_order)
                    .query(`UPDATE cctv SET sort_order = @order WHERE cctv_id = @id`);
            }
            await transaction.commit();
            res.json({ success: true, message: 'Reordered successfully' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error("PUT /api/cctv/reorder Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
