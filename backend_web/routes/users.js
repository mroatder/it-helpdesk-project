const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const ActiveDirectory = require('activedirectory2');
require('dotenv').config();

// ==========================================
// 🔌 AD Configuration (คงเดิม)
// ==========================================
const getAdAdminUser = () => {
    const user = process.env.AD_ADMIN_USER;
    const domain = process.env.AD_DOMAIN;
    if (!user) return 'admin@yourdomain.com';
    if (user.includes('\\') || user.includes('@')) return user;
    if (domain) return `${domain}\\${user}`;
    return user;
};

const adConfig = {
    url: process.env.AD_URL,
    baseDN: process.env.AD_BASE_DN,
    username: getAdAdminUser(),
    password: process.env.AD_ADMIN_PASSWORD,
    connectTimeout: 10000,
    operationTimeout: 10000,
    referrals: { enabled: false, exclude: [] }
};

const authMiddleware = require('../middleware/authMiddleware');

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access Denied: Admin Only' });
    }
};

router.use(authMiddleware);

function getVal(obj, key) {
    if (!obj) return null;
    const found = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
    return found ? obj[found] : null;
}

function parseDN(dn) {
    const result = { department: '' };
    if (!dn) return result;
    const parts = dn.split(',');
    let ouCount = 0;
    for (let part of parts) {
        part = part.trim();
        if (part.toUpperCase().startsWith('OU=')) {
            const value = part.substring(3);
            if (ouCount === 0) result.department = value;
            ouCount++;
        }
    }
    return result;
}

// ==========================================
// 📂 API Endpoints
// ==========================================

router.get(['/', '/list'], adminOnly, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                u.user_id AS id, u.user_id, u.username, u.email, u.full_name, 
                u.role, u.department, u.title, u.is_active, u.created_at, u.level_rank,
                -- ดึงจากตารางแยกเท่านั้น ไม่ดึงจาก u.manager_id แล้ว
                (
                    SELECT STRING_AGG(CAST(mgr_id AS VARCHAR), ',')
                    FROM (
                        SELECT manager_id AS mgr_id FROM user_managers WHERE user_id = u.user_id
                        UNION
                        SELECT manager_id AS mgr_id FROM department_managers WHERE department_name = u.department
                    ) AS combined_mgrs
                ) AS manager_id
            FROM users u
            ORDER BY u.user_id ASC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ success: false, message: 'Check SQL Console for Column Error' });
    }
});

// ✅ POST: อัปเดต User รายคน (ส่วนนี้ดีอยู่แล้ว แต่เพิ่มการตรวจสอบ Error ให้ละเอียดขึ้น)
router.post('/update', adminOnly, async (req, res) => {
    const { user_id, role, manager_id, is_active, level_rank } = req.body;

    if (!user_id) return res.status(400).json({ success: false, message: 'Missing user_id' });

    let transaction;
    try {
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // อัปเดตข้อมูล Rank และข้อมูลพื้นฐาน
        await transaction.request()
            .input('uid', sql.Int, user_id)
            .input('role', sql.NVarChar, role)
            .input('active', sql.Bit, is_active)
            .input('rank', sql.Int, level_rank !== undefined ? level_rank : 99)
            .query(`
                UPDATE users 
                SET role = @role, 
                    is_active = @active, 
                    level_rank = @rank 
                WHERE user_id = @uid
            `);

        // จัดการ Managers (Delete/Insert)
        await transaction.request()
            .input('uid', sql.Int, user_id)
            .query(`DELETE FROM user_managers WHERE user_id = @uid`);

        if (manager_id) {
            const rawIds = Array.isArray(manager_id) ? manager_id : String(manager_id).split(',');
            const uniqueIds = [...new Set(rawIds.map(id => parseInt(String(id).trim())).filter(id => !isNaN(id)))];

            for (const mId of uniqueIds) {
                const insReq = new sql.Request(transaction);
                insReq.input('uid', sql.Int, user_id);
                insReq.input('mid', sql.Int, mId);
                await insReq.query(`INSERT INTO user_managers (user_id, manager_id) VALUES (@uid, @mid)`);
            }
        }

        await transaction.commit();
        res.json({ success: true, message: 'Updated user successfully' });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("Update User Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ POST: กำหนด Manager ประจำแผนก (เพื่อให้พนักงานใหม่ได้ Manager ครบทุกคน)
router.post('/department-manager', adminOnly, async (req, res) => {
    const { department_name, manager_id } = req.body;
    if (!department_name) return res.status(400).json({ success: false, message: 'Missing department name' });

    let transaction;
    try {
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        await transaction.request()
            .input('dept', sql.NVarChar, department_name)
            .query(`DELETE FROM department_managers WHERE department_name = @dept`);

        if (manager_id) {
            const rawIds = Array.isArray(manager_id) ? manager_id : String(manager_id).split(',');
            const uniqueIds = [...new Set(rawIds.map(id => parseInt(String(id).trim())).filter(id => !isNaN(id)))];

            for (const mId of uniqueIds) {
                const insReq = new sql.Request(transaction);
                insReq.input('dept', sql.NVarChar, department_name).input('mid', sql.Int, mId);
                await insReq.query(`INSERT INTO department_managers (department_name, manager_id) VALUES (@dept, @mid)`);
            }
        }

        await transaction.commit();
        res.json({ success: true, message: 'Department mapped successfully' });
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ POST: Bulk Update Managers (ใช้ท่าลบแล้วเขียนใหม่เช่นกัน)
router.post('/bulk-update-managers', adminOnly, async (req, res) => {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates) || updates.length === 0) return res.status(400).json({ success: false, message: 'Invalid payload' });

    let transaction;
    try {
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        for (const item of updates) {
            await transaction.request().input('uid', sql.Int, item.user_id).query(`DELETE FROM user_managers WHERE user_id = @uid`);
            if (item.manager_id) {
                const rawIds = Array.isArray(item.manager_id) ? item.manager_id : String(item.manager_id).split(',');
                const uniqueIds = [...new Set(rawIds.map(id => parseInt(String(id).trim())).filter(id => !isNaN(id)))];
                for (const mgrId of uniqueIds) {
                    const itemReq = new sql.Request(transaction);
                    itemReq.input('uid', sql.Int, item.user_id).input('mid', sql.Int, mgrId);
                    await itemReq.query(`INSERT INTO user_managers (user_id, manager_id) VALUES (@uid, @mid)`);
                }
            }
        }
        await transaction.commit();
        res.json({ success: true, message: 'Bulk update success' });
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- ส่วน AD Sync และ Profile อื่นๆ คงเดิม ---
router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const loggedInUserId = Number(req.user.user_id || req.user.id);

        // 🛡️ ป้องกัน Bypass: ดูได้เฉพาะของตัวเอง หรือเป็น ADMIN
        if (Number(userId) !== loggedInUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        const pool = await poolPromise;
        const result = await pool.request().input('user_id', sql.Int, userId).query(`SELECT * FROM users WHERE user_id = @user_id`);
        if (!result.recordset[0]) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user: result.recordset[0] });
    } catch (err) { res.status(500).json({ success: false, message: 'DB Error' }); }
});

router.get('/search', async (req, res) => {
    try {
        const q = req.query.q;
        if (!q || q.length < 2) return res.json({ success: true, data: [] });
        const pool = await poolPromise;
        const result = await pool.request().input('q', sql.NVarChar, `%${q}%`)
            .query(`SELECT user_id AS id, full_name, email, username, department, role, level_rank FROM users WHERE full_name LIKE @q OR username LIKE @q OR department LIKE @q ORDER BY full_name`);
        res.json({ success: true, data: result.recordset });
    } catch (err) { res.status(500).json({ success: false, message: 'Search Error' }); }
});

router.get('/technicians', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`SELECT user_id, full_name FROM users WHERE department LIKE '%IT%' AND is_active = 1`);
        res.json({ success: true, data: result.recordset });
    } catch (err) { res.status(500).json({ success: false, message: 'Error' }); }
});

router.get('/managers', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`SELECT user_id, full_name, title, email FROM users WHERE (title LIKE '%Manager%' OR role LIKE '%MANAGER%') AND is_active = 1 ORDER BY full_name ASC`);
        res.json({ success: true, data: result.recordset });
    } catch (err) { res.status(500).json({ success: false, message: 'Error fetching managers' }); }
});

router.get('/assigned-managers/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = await poolPromise;
        const result = await pool.request().input('userId', sql.Int, userId).query(`
            SELECT DISTINCT m.user_id AS id, m.full_name, m.title, m.email, m.department
            FROM users m
            WHERE m.user_id IN (
                SELECT manager_id FROM user_managers WHERE user_id = @userId
                UNION
                SELECT dm.manager_id FROM department_managers dm JOIN users u ON u.department = dm.department_name WHERE u.user_id = @userId
            ) AND m.is_active = 1 ORDER BY m.full_name ASC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { res.status(500).json({ success: false, message: 'Failed to fetch assigned managers' }); }
});

router.get('/ad-search', adminOnly, async (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 3) return res.json({ success: true, data: [] });
    try {
        const ad = new ActiveDirectory(adConfig);
        const filter = `(&(objectClass=user)(|(sAMAccountName=${query}*)(displayName=*${query}*)(mail=${query}*)))`;
        ad.findUsers({ includeMembership: false, filter, attributes: ['cn', 'mail', 'userPrincipalName', 'displayName', 'sAMAccountName', 'title', 'department', 'dn'] }, (err, users) => {
            if (res.headersSent) return;
            if (err) return res.status(500).json({ success: false, message: 'AD Connection Failed: ' + err.message });
            if (!users) return res.json({ success: true, data: [] });
            const mapped = users.map(u => ({
                username: getVal(u, 'sAMAccountName'),
                full_name: getVal(u, 'displayName'),
                email: getVal(u, 'mail') || getVal(u, 'userPrincipalName'),
                title: getVal(u, 'title'),
                department: getVal(u, 'department') || parseDN(u.dn).department
            })).filter(u => u.username);
            res.json({ success: true, data: mapped });
        });
    } catch (error) { if (!res.headersSent) res.status(500).json({ success: false, message: error.message }); }
});

router.post('/import', adminOnly, async (req, res) => {
    const { username, full_name, email, title, department } = req.body;
    if (!username) return res.status(400).json({ success: false });
    try {
        const pool = await poolPromise;
        const check = await pool.request().input('username', sql.NVarChar, username).query('SELECT user_id FROM users WHERE username = @username');
        if (check.recordset.length > 0) return res.status(400).json({ success: false, message: 'User exists' });
        let role = 'USER';
        if (department && department.toUpperCase().includes('IT')) role = 'ADMIN';
        await pool.request().input('username', sql.NVarChar, username).input('full_name', sql.NVarChar, full_name).input('email', sql.NVarChar, email).input('title', sql.NVarChar, title).input('department', sql.NVarChar, department).input('role', sql.NVarChar, role)
            .query(`INSERT INTO users (username, full_name, email, title, department, role, is_active, created_at) VALUES (@username, @full_name, @email, @title, @department, @role, 1, GETDATE())`);
        res.json({ success: true, message: 'Imported' });
    } catch (err) { res.status(500).json({ success: false, message: 'Import failed' }); }
});

router.post('/sync-ad', adminOnly, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT user_id, username FROM users');
        const users = result.recordset;

        if (users.length === 0) return res.json({ success: true, message: 'No users to sync' });

        const ad = new ActiveDirectory(adConfig);
        const opts = {
            includeMembership: false,
            attributes: ['dn', 'cn', 'mail', 'userPrincipalName', 'displayName', 'sAMAccountName', 'title', 'department', 'company']
        };

        const promises = users.map(user => new Promise(resolve => {
            ad.findUser(opts, user.username, async (err, adUser) => {
                if (err || !adUser) return resolve(false);

                const email = getVal(adUser, 'mail') || getVal(adUser, 'userPrincipalName');
                const title = getVal(adUser, 'title');
                const rawDept = getVal(adUser, 'department');
                let departmentName = rawDept || (adUser.dn ? parseDN(adUser.dn).department : '');
                const fullName = getVal(adUser, 'displayName');

                try {
                    // 🎯 Logic การหาหรือสร้าง dept_id แบบป้องกันการซ้ำ
                    let deptId = null;
                    if (departmentName) {
                        const cleanDeptName = departmentName.trim(); // ตัดช่องว่าง หน้า-หลัง

                        // เช็คโดยไม่สนตัวพิมพ์เล็ก-ใหญ่ และตัดช่องว่าง
                        let deptRes = await pool.request()
                            .input('dname', sql.NVarChar, cleanDeptName)
                            .query('SELECT dept_id FROM departments WHERE UPPER(LTRIM(RTRIM(dept_name))) = UPPER(@dname)');

                        if (deptRes.recordset.length > 0) {
                            deptId = deptRes.recordset[0].dept_id;
                        } else {
                            try {
                                // ถ้ายังไม่มีจริงๆ ค่อยสร้าง
                                let insertDept = await pool.request()
                                    .input('dname', sql.NVarChar, cleanDeptName)
                                    .query('INSERT INTO departments (dept_name) OUTPUT INSERTED.dept_id VALUES (@dname)');
                                deptId = insertDept.recordset[0].dept_id;
                            } catch (dbErr) {
                                // กรณีเกิด Race Condition (ยิงเข้ามาพร้อมกัน) ให้ลองดึงอีกรอบ
                                let retryRes = await pool.request()
                                    .input('dname', sql.NVarChar, cleanDeptName)
                                    .query('SELECT dept_id FROM departments WHERE dept_name = @dname');
                                deptId = retryRes.recordset[0]?.dept_id;
                            }
                        }
                    }

                    // 2. 🎯 อัปเดตข้อมูล User พร้อมเชื่อมโยง dept_id
                    await pool.request()
                        .input('uid', sql.Int, user.user_id)
                        .input('email', sql.NVarChar, email)
                        .input('title', sql.NVarChar, title)
                        .input('dept_id', sql.Int, deptId)
                        .input('dept_name', sql.NVarChar, departmentName)
                        .input('name', sql.NVarChar, fullName)
                        .query(`
                            UPDATE users 
                            SET email = @email, 
                                title = @title, 
                                dept_id = @dept_id, 
                                department = @dept_name, 
                                full_name = @name 
                            WHERE user_id = @uid
                        `);
                    resolve(true);
                } catch (e) {
                    console.error(`Sync error for ${user.username}:`, e.message);
                    resolve(false);
                }
            });
        }));

        const syncResults = await Promise.all(promises);
        res.json({ success: true, message: `Sync สำเร็จ ${syncResults.filter(r => r).length} รายการ` });
    } catch (err) {
        console.error('Main Sync AD Error:', err);
        res.status(500).json({ success: false, message: 'Sync failed' });
    }
});

// ✅ ดึงรายชื่อ Manager Rank 3 และ 4 ทั้งหมด (สำหรับหน้าขอสิทธิ์เข้าถึง Folder)
router.get('/access-approvers', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                user_id AS id, 
                full_name, 
                email, 
                title, 
                department, 
                level_rank 
            FROM users 
            WHERE level_rank IN (1, 3, 4) AND is_active = 1
            ORDER BY level_rank DESC, full_name ASC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error fetching access approvers:', err.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;