const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');
const { pingAllAssets } = require('../services/pingService');

// 📸 ตั้งค่า Multer สำหรับ Asset Images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/asset-map');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'ASSET-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

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

// ---------------------------------------------------------
// 🟢 ส่วนที่ 1: สำหรับ Script (ไม่ต้องใช้ Token)
// ---------------------------------------------------------
router.post('/update', async (req, res) => {
    const {
        serial_number, hostname, manufacturer, model,
        cpu_model, mainboard_brand, mainboard_model, os_version,
        gpu_summary, ram_list, disk_list,
        mac_ethernet, mac_wifi, ip_address,
        ip_lan, ip_wifi,
        office_version,
        windows_key //
    } = req.body;

    if (!serial_number) return res.status(400).send('Serial Number is required');

    const clean_os = os_version ? os_version.replace(/Microsoft\s*/gi, '').trim() : 'Unknown';
    const total_ram_gb = ram_list && Array.isArray(ram_list)
        ? ram_list.reduce((sum, ram) => sum + (Number(ram.capacity_gb) || 0), 0)
        : 0;

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);
            request.input('sn', sql.NVarChar, serial_number);
            request.input('host', sql.NVarChar, hostname);
            request.input('manuf', sql.NVarChar, manufacturer);
            request.input('mod', sql.NVarChar, model);
            request.input('cpu', sql.NVarChar, cpu_model);
            request.input('mb_brand', sql.NVarChar, mainboard_brand);
            request.input('mb_mod', sql.NVarChar, mainboard_model);
            request.input('os', sql.NVarChar, clean_os);
            request.input('gpu', sql.NVarChar, gpu_summary);
            request.input('ram_total', sql.Int, total_ram_gb);
            request.input('mac_e', sql.VarChar, mac_ethernet || '');
            request.input('mac_w', sql.VarChar, mac_wifi || '');
            request.input('ip_act', sql.VarChar, ip_address || '');
            request.input('ip_l', sql.VarChar, ip_lan || '');
            request.input('ip_w', sql.VarChar, ip_wifi || '');
            request.input('off_v', sql.NVarChar, office_version || '');
            request.input('win_key', sql.NVarChar, windows_key ? windows_key.toString() : 'No Key Found');

            const check = await request.query(`SELECT TOP 1 1 FROM computers WHERE serial_number = @sn`);

            if (check.recordset.length > 0) {
                await request.query(`
                    UPDATE computers SET 
                        hostname = @host, manufacturer = @manuf, model = @mod,
                        cpu_model = @cpu, mainboard_brand = @mb_brand,
                        mainboard_model = @mb_mod, os_version = @os,
                        gpu_summary = @gpu, total_ram_gb = @ram_total,
                        mac_ethernet = @mac_e, mac_wifi = @mac_w, 
                        ip_address = @ip_act,
                        ip_lan = CASE WHEN @ip_l <> '' THEN @ip_l ELSE ip_lan END,
                        ip_wifi = CASE WHEN @ip_w <> '' THEN @ip_w ELSE ip_wifi END,
                        office_version = @off_v,
                        windows_key = @win_key,
                        last_updated = GETDATE()
                    WHERE serial_number = @sn
                `);
            } else {
                await request.query(`
                    INSERT INTO computers (
                        serial_number, hostname, manufacturer, model, cpu_model, 
                        mainboard_brand, mainboard_model, os_version, gpu_summary, 
                        total_ram_gb, mac_ethernet, mac_wifi, ip_address, ip_lan, ip_wifi, office_version, windows_key
                    )
                    VALUES (
                        @sn, @host, @manuf, @mod, @cpu, @mb_brand, @mb_mod, @os, @gpu, 
                        @ram_total, @mac_e, @mac_w, @ip_act, @ip_l, @ip_w, @off_v, @win_key
                    )
                `);
            }

            await request.query(`DELETE FROM computer_rams WHERE computer_serial = @sn`);
            if (ram_list && ram_list.length > 0) {
                for (const ram of ram_list) {
                    const rReq = new sql.Request(transaction);
                    rReq.input('sn', sql.NVarChar, serial_number);
                    rReq.input('bank', sql.VarChar, ram.bank_label);
                    rReq.input('cap', sql.Int, ram.capacity_gb);
                    rReq.input('spd', sql.Int, ram.speed_mhz);
                    rReq.input('manu', sql.NVarChar, ram.manufacturer);
                    rReq.input('part', sql.VarChar, ram.part_number);
                    rReq.input('type', sql.VarChar, ram.memory_type);
                    await rReq.query(`INSERT INTO computer_rams (computer_serial, bank_label, capacity_gb, speed_mhz, manufacturer, part_number, memory_type)
                                     VALUES (@sn, @bank, @cap, @spd, @manu, @part, @type)`);
                }
            }

            await request.query(`DELETE FROM computer_disks WHERE computer_serial = @sn`);
            if (disk_list && disk_list.length > 0) {
                for (const disk of disk_list) {
                    const dReq = new sql.Request(transaction);
                    dReq.input('sn', sql.NVarChar, serial_number);
                    dReq.input('mod', sql.NVarChar, disk.model);
                    dReq.input('size', sql.Int, disk.size_gb);
                    dReq.input('intf', sql.VarChar, disk.interface_type);
                    await dReq.query(`INSERT INTO computer_disks (computer_serial, model, size_gb, interface_type)
                                     VALUES (@sn, @mod, @size, @intf)`);
                }
            }

            await transaction.commit();
            res.json({ success: true });
        } catch (err) { await transaction.rollback(); throw err; }
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ---------------------------------------------------------
// 🔴 ส่วนที่ 2: ฟังก์ชันที่ต้องใช้ Token (บังคับ adminOnly)
// ---------------------------------------------------------
router.use(authMiddleware);

// ---------------------------------------------------------
// 🗺️ POST /api/inventory/ping-all
// สั่งให้ Server ไล่ Ping ทุกเครื่องทันที (Admin only)
// ---------------------------------------------------------
router.post('/ping-all', adminOnly, async (req, res) => {
    try {
        const stats = await pingAllAssets();
        res.json({ success: true, message: 'Ping completed', stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---------------------------------------------------------
// 🗺️ GET /api/inventory/map?floor=B1-1
// ดึง asset ทั้งหมดที่มีพิกัดบน map (สำหรับหน้า Asset Map)
// พร้อมคำนวณสถานะ (Real-time Status) และ EOL
// ---------------------------------------------------------
router.get('/map', adminOnly, async (req, res) => {
    try {
        const { floor } = req.query;
        const pool = await poolPromise;
        const request = pool.request();

        let query = `
            SELECT 
                c.computer_id, c.hostname, c.owner_name, c.department,
                c.ip_address, c.ip_lan, c.ip_wifi, c.fixed_asset,
                c.map_floor, c.map_x, c.map_y, c.map_rotate,
                c.map_place, c.map_image, c.last_updated, c.start_use_date,
                -- 🔴 ปิดไว้ก่อนจนกว่าจะรัน SQL เพิ่มคอลัมน์ computer_id ในตาราง tickets
                0 as pending_tickets
            FROM computers c
            WHERE c.map_floor IS NOT NULL
              AND (c.is_deleted = 0 OR c.is_deleted IS NULL)
        `;

        if (floor) {
            request.input('floor', sql.NVarChar, floor);
            query += ` AND c.map_floor = @floor`;
        }

        query += ` ORDER BY c.map_floor, c.map_x`;

        const result = await request.query(query);

        // --- 🧠 คำนวณสถานะเพิ่มเติมก่อนส่งกลับ ---
        const data = result.recordset.map(asset => {
            let status = 'BLUE'; // ปกติ

            // 1. เช็คตั๋วค้าง (สีแดง)
            if (asset.pending_tickets > 0) {
                status = 'RED';
            }
            // 2. เช็ค Offline เกิน 35 นาที (สีเหลือง)
            else if (asset.last_updated) {
                const lastSeen = new Date(asset.last_updated);
                const diffMinutes = (new Date() - lastSeen) / 1000 / 60;
                if (diffMinutes > 35) {
                    status = 'YELLOW';
                }
            }

            // 3. เช็คอายุการใช้งาน (EOL) - เกิน 5 ปี
            let is_near_eol = false;
            if (asset.start_use_date) {
                const startDate = new Date(asset.start_use_date);
                const ageYears = (new Date() - startDate) / 1000 / 60 / 60 / 24 / 365;
                if (ageYears >= 5) {
                    is_near_eol = true;
                }
            }

            return {
                ...asset,
                status,
                is_near_eol
            };
        });

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---------------------------------------------------------
// 🗺️ PUT /api/inventory/:id/map
// อัปเดตพิกัด map ของ asset (Admin only)
// ---------------------------------------------------------
router.put('/:id/map', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { map_floor, map_x, map_y, map_rotate, map_place, map_image } = req.body;

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('floor', sql.NVarChar, map_floor || null)
            .input('x', sql.Float, map_x ?? null)
            .input('y', sql.Float, map_y ?? null)
            .input('rotate', sql.Int, map_rotate ?? null)
            .input('place', sql.NVarChar, map_place || null)
            .input('image', sql.NVarChar, map_image || null)
            .query(`
                UPDATE computers SET
                    map_floor  = @floor,
                    map_x      = @x,
                    map_y      = @y,
                    map_rotate = @rotate,
                    map_place  = @place,
                    map_image  = @image
                WHERE computer_id = @id
            `);

        res.json({ success: true, message: 'Map position updated.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/', adminOnly, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                c.computer_id, c.serial_number, c.hostname, c.ip_address, c.ip_lan, c.ip_wifi, 
                c.os_version, c.start_use_date, 
                (SELECT ISNULL(SUM(capacity_gb), 0) FROM computer_rams WHERE computer_serial = c.serial_number) as total_ram_gb,
                (SELECT STRING_AGG(model, ', ') FROM computer_disks WHERE computer_serial = c.serial_number AND size_gb > 10 AND model NOT LIKE '%USB%' AND model NOT LIKE '%Generic%') as primary_disk_type,
                c.last_updated, c.department, c.owner_name, c.fixed_asset, c.is_leased,
                u.model_name as ups_model, u.start_use_date as ups_start_date
            FROM computers c
            LEFT JOIN ups u ON c.computer_id = u.current_computer_id
            WHERE c.is_deleted = 0 OR c.is_deleted IS NULL  -- 🎯 ดึงเฉพาะที่ยังไม่ลบ
            ORDER BY c.last_updated DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        // 1. ดึงข้อมูลคอมพิวเตอร์ + ตรวจสอบชื่อคอลัมน์ UPS ID ให้ดี 
        const computerResult = await pool.request().input('id', sql.Int, id).query(`
            SELECT c.*, u.ups_id, u.model_name as ups_model, u.battery_spec as ups_battery_spec, u.start_use_date as ups_start_date 
            FROM computers c 
            LEFT JOIN ups u ON c.computer_id = u.current_computer_id 
            WHERE c.computer_id = @id AND (c.is_deleted = 0 OR c.is_deleted IS NULL) -- 🎯 เช็คว่าไม่ถูกลบ
        `);

        if (computerResult.recordset.length === 0) return res.status(404).json({ success: false, message: 'Asset not found or has been deleted.' });
        const computer = computerResult.recordset[0];

        let rams = [], disks = [], software = [], ups_logs = [];

        // 2. ดึง RAM / Disk (เหมือนเดิม)
        try {
            const ramRes = await pool.request().input('serial', sql.NVarChar, computer.serial_number).query(`
                SELECT memory_type, manufacturer, speed_mhz, part_number, SUM(capacity_gb) as capacity_gb 
                FROM computer_rams WHERE computer_serial = @serial 
                GROUP BY memory_type, manufacturer, speed_mhz, part_number
            `);
            rams = ramRes.recordset;

            const diskRes = await pool.request().input('serial', sql.NVarChar, computer.serial_number).query(`
                SELECT * FROM computer_disks WHERE computer_serial = @serial
            `);
            disks = diskRes.recordset;
        } catch (e) { console.error("RAM/Disk Error:", e.message); }

        // 3. ดึง Software (เหมือนเดิม)
        try {
            const softwareRes = await pool.request().input('serial', sql.NVarChar, computer.serial_number).query(`
                SELECT display_name, display_version, publisher, install_date 
                FROM computer_software WHERE computer_serial = @serial ORDER BY display_name
            `);
            software = softwareRes.recordset;
        } catch (swErr) { software = []; }

        // 4. 🎯 ดึง UPS Log แบบปลอดภัย (ถ้าตารางไม่มี หรือ Query พัง จะไม่ทำให้ API พังทั้งหน้า)
        if (computer.ups_id) {
            try {
                const logRes = await pool.request().input('upsId', sql.Int, computer.ups_id).query(`
                    SELECT * FROM ups_maintenance_logs 
                    WHERE ups_id = @upsId 
                    ORDER BY action_date DESC
                `);
                ups_logs = logRes.recordset;
            } catch (logErr) {
                console.warn("⚠️ Warning: ups_maintenance_logs table error:", logErr.message);
                ups_logs = []; // ให้เป็นอาเรย์ว่าง ข้อมูลหน้าหลักจะได้ยังแสดงผลได้
            }
        }

        // ส่งข้อมูลกลับไปครบทุกอย่าง
        res.json({
            success: true,
            data: { ...computer, rams, disks, software, ups_logs }
        });

    } catch (err) {
        console.error('Fatal API Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 🎯 เพิ่ม Route ใหม่: DELETE (Soft Delete)
router.delete('/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .query(`
                UPDATE computers 
                SET is_deleted = 1, 
                    deleted_at = GETDATE() 
                WHERE computer_id = @id
            `);

        res.json({ success: true, message: 'Asset moved to recycle bin (Soft Deleted).' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// ✅ PUT: จัดการ Asset Assignment + บันทึก Log (แก้ไขชื่อตารางเป็น ups_maintenance_logs)
router.put('/:id/assign', adminOnly, async (req, res) => {
    const { id } = req.params;
    const {
        owner_name, department, location, fixed_asset, start_use_date, is_leased,
        ups_model, ups_battery_spec, ups_start_date,
        ups_history
    } = req.body;

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        // --- ตั้งค่า Inputs ---
        request.input('id', sql.Int, id);
        request.input('owner', sql.NVarChar, owner_name || '');
        request.input('dept', sql.NVarChar, department || '');
        request.input('loc', sql.NVarChar, location || '');
        request.input('fixed', sql.NVarChar, fixed_asset || '');
        request.input('pc_start', sql.Date, start_use_date || null);
        request.input('leased', sql.Bit, is_leased ? 1 : 0);
        request.input('u_mod', sql.NVarChar, ups_model || '');
        request.input('u_batt', sql.NVarChar, ups_battery_spec || '');
        request.input('u_start', sql.Date, ups_start_date || null);
        request.input('u_history', sql.NVarChar, ups_history || '');

        // 1. อัปเดตข้อมูล Computers
        await request.query(`
            UPDATE computers SET owner_name = @owner, department = @dept, 
            location = @loc, fixed_asset = @fixed, start_use_date = @pc_start,
            is_leased = @leased
            WHERE computer_id = @id
        `);

        // 2. จัดการข้อมูล UPS
        const upsCheck = await request.query(`SELECT ups_id FROM ups WHERE current_computer_id = @id`);
        let targetUpsId = upsCheck.recordset.length > 0 ? upsCheck.recordset[0].ups_id : null;

        if (ups_model) {
            if (targetUpsId) {
                request.input('target_id', sql.Int, targetUpsId);
                await request.query(`
                    UPDATE ups SET model_name = @u_mod, battery_spec = @u_batt, 
                    start_use_date = @u_start, updated_at = GETDATE() 
                    WHERE ups_id = @target_id
                `);
            } else {
                const insertRes = await request.query(`
                    INSERT INTO ups (model_name, battery_spec, start_use_date, current_computer_id)
                    OUTPUT INSERTED.ups_id
                    VALUES (@u_mod, @u_batt, @u_start, @id)
                `);
                targetUpsId = insertRes.recordset[0].ups_id;
                request.input('target_id', sql.Int, targetUpsId);
            }

            // 🎯 3. บันทึก Log (แก้ไขชื่อตารางเป็น ups_maintenance_logs และเพิ่มคอลัมน์ cost)
            if (ups_history && ups_history.trim() !== '') {
                await request.query(`
                    INSERT INTO ups_maintenance_logs (ups_id, action_date, details, cost, performed_by)
                    VALUES (@target_id, GETDATE(), @u_history, 0, 'Admin')
                `);
            }
        } else if (targetUpsId) {
            request.input('target_id', sql.Int, targetUpsId);
            await request.query(`UPDATE ups SET current_computer_id = NULL WHERE ups_id = @target_id`);
        }

        await transaction.commit();
        res.json({ success: true, message: 'Asset assigned and log recorded successfully' });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("🚨 SQL Error:", err.message);
        res.status(500).json({ success: false, message: "Database Error: " + err.message });
    }
});


// 📸 POST: อัปเดตพิกัด/รูปภาพการครอบครอง (Asset Possession Image)
router.post('/:id/upload-image', adminOnly, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ success: false, message: 'No image file uploaded' });
        const filePath = `/uploads/asset-map/${req.file.filename}`;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('path', sql.NVarChar, filePath)
            .query('UPDATE computers SET map_image = @path WHERE computer_id = @id');
        res.json({ success: true, message: 'Image uploaded successfully', filePath: filePath });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
