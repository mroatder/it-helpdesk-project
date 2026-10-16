const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const ActiveDirectory = require('activedirectory2');
require('dotenv').config();
const jwt = require('jsonwebtoken'); 

// Base Config
const baseAdConfig = {
    url: process.env.AD_URL, 
    baseDN: process.env.AD_BASE_DN,
    connectTimeout: 10000,
    operationTimeout: 10000,
    referrals: { enabled: false, exclude: [] }
};

function parseDN(dn) {
    const result = { department: '', company: '' };
    if (!dn) return result;
    const parts = dn.split(',');
    let ouCount = 0;
    for (let part of parts) {
        part = part.trim();
        if (part.toUpperCase().startsWith('OU=')) {
            const value = part.substring(3);
            if (ouCount === 0) result.department = value;
            else if (ouCount === 1) result.company = value;
            ouCount++;
        }
    }
    return result;
}

function getVal(obj, key) {
    if (!obj) return null;
    const found = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
    return found ? obj[found] : null;
}

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, code: 'MISSING_CREDENTIALS' });
    }

    const fullUsername = `${process.env.AD_DOMAIN}\\${username}`;

    try {
        // 1. Login AD
        const userAdConfig = { ...baseAdConfig, username: fullUsername, password: password };
        const ad = new ActiveDirectory(userAdConfig);

        const authResult = await new Promise((resolve) => {
            ad.authenticate(fullUsername, password, (err, auth) => {
                if (err) { 
                    console.log('❌ Auth Failed:', err.message); 
                    resolve(false); 
                }
                resolve(auth);
            });
        });

        if (!authResult) {
            return res.status(403).json({ success: false, code: 'INVALID_AUTH' });
        }

        console.log(`✅ User ${username} Login Success. Searching for details...`);

        // 2. Find User Details
        const userDetail = await new Promise((resolve) => {
            const opts = { 
                includeMembership: false,
                attributes: ['dn', 'cn', 'mail', 'userPrincipalName', 'displayName', 'sAMAccountName', 'title', 'department', 'company']
            };
            ad.findUser(opts, username, (err, user) => {
                if (err) resolve(null);
                else resolve(user);
            });
        });

        // 3. Extract Data
        let email = '';
        let fullName = username;
        let title = '';       
        let rawDeptName = '';

        if (userDetail) {
            email = getVal(userDetail, 'mail') || getVal(userDetail, 'userPrincipalName') || '';
            fullName = getVal(userDetail, 'displayName') || username;
            title = getVal(userDetail, 'title') || ''; 

            const adDept = getVal(userDetail, 'department');
            if (adDept) {
                rawDeptName = adDept;
            } else if (userDetail.dn) {
                const dnInfo = parseDN(userDetail.dn);
                rawDeptName = dnInfo.department;
            }
        }

        // 4. 🎯 Sync ข้อมูลแผนก (ป้องกันชื่อซ้ำและช่องว่าง)
        const pool = await poolPromise;
        let deptId = null;
        let finalDeptName = rawDeptName ? rawDeptName.trim() : 'N/A';

        if (finalDeptName) {
            // ค้นหา dept_id โดยใช้ TRIM และการเปรียบเทียบที่ไม่สนใจ Case
            let deptRes = await pool.request()
                .input('name', sql.NVarChar, finalDeptName)
                .query('SELECT dept_id FROM departments WHERE UPPER(LTRIM(RTRIM(dept_name))) = UPPER(@name)');
            
            if (deptRes.recordset.length > 0) {
                deptId = deptRes.recordset[0].dept_id;
            } else {
                // ถ้าไม่เจอแผนก ให้สร้างใหม่ (ดักจับ Error ถ้าเกิดการชนกันของ Unique Constraint)
                try {
                    let insertDept = await pool.request()
                        .input('name', sql.NVarChar, finalDeptName)
                        .query('INSERT INTO departments (dept_name) OUTPUT INSERTED.dept_id VALUES (@name)');
                    deptId = insertDept.recordset[0].dept_id;
                } catch (dbErr) {
                    // หากชื่อซ้ำที่ระดับ DB (Race Condition) ให้ดึง ID อีกครั้ง
                    let retryRes = await pool.request()
                        .input('name', sql.NVarChar, finalDeptName)
                        .query('SELECT dept_id FROM departments WHERE dept_name = @name');
                    deptId = retryRes.recordset[0]?.dept_id;
                }
            }
        }

        // Determine Role
        let userRole = 'USER';
        const isITDept = finalDeptName.toUpperCase().includes('IT');
        const isSuperAdmin = username.toLowerCase() === 'administrator';
        if (isITDept || isSuperAdmin) userRole = 'ADMIN';

        // 5. Sync Users Table
        let dbUserResult = await pool.request().input('username', sql.NVarChar, username).query('SELECT * FROM users WHERE username = @username');
        let dbUser = dbUserResult.recordset[0];

        if (dbUser) {
            await pool.request()
                .input('username', sql.NVarChar, username)
                .input('email', sql.NVarChar, email)
                .input('full_name', sql.NVarChar, fullName)
                .input('title', sql.NVarChar, title)
                .input('dept_id', sql.Int, deptId)
                .input('department', sql.NVarChar, finalDeptName)
                .input('role', sql.NVarChar, userRole)
                .query(`UPDATE users SET 
                            email = @email, 
                            full_name = @full_name, 
                            title = @title, 
                            dept_id = @dept_id, 
                            department = @department, 
                            role = @role, 
                            last_login = GETDATE() 
                        WHERE username = @username`);
        } else {
            await pool.request()
                .input('username', sql.NVarChar, username)
                .input('full_name', sql.NVarChar, fullName)
                .input('email', sql.NVarChar, email)
                .input('title', sql.NVarChar, title)
                .input('dept_id', sql.Int, deptId)
                .input('department', sql.NVarChar, finalDeptName)
                .input('role', sql.NVarChar, userRole)
                .query(`INSERT INTO users (username, full_name, email, title, dept_id, department, role, is_active, created_at) 
                        VALUES (@username, @full_name, @email, @title, @dept_id, @department, @role, 1, GETDATE())`);
        }

        // ดึงข้อมูลล่าสุดหลังอัปเดต
        dbUserResult = await pool.request().input('username', sql.NVarChar, username).query('SELECT * FROM users WHERE username = @username');
        dbUser = dbUserResult.recordset[0];

        if (!dbUser.is_active) {
            return res.status(403).json({ success: false, code: 'ACCOUNT_DISABLED' });
        }

        // 6. Generate JWT
        const userPayload = { id: dbUser.user_id, username: dbUser.username, role: dbUser.role };
        const token = jwt.sign(userPayload, process.env.JWT_SECRET || 'your_fallback_secret', { expiresIn: '20m' });

        res.json({
            success: true,
            message: 'Login Successful',
            token: token,
            user: {
                id: dbUser.user_id,
                username: dbUser.username,
                fullName: dbUser.full_name,
                email: dbUser.email,
                title: dbUser.title,
                department: finalDeptName,
                role: dbUser.role,
                level_rank: dbUser.level_rank
            }
        });

    } catch (error) {
        console.error('System Error:', error);
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
});

router.get('/refresh-token', require('../middleware/authMiddleware'), async (req, res) => {
    try {
        const userPayload = { id: req.user.id, username: req.user.username, role: req.user.role };
        const newToken = jwt.sign(userPayload, process.env.JWT_SECRET || 'your_fallback_secret', { expiresIn: '20m' });
        res.json({ success: true, token: newToken });
    } catch (error) {
        res.status(500).json({ success: false, code: 'REFRESH_ERROR' });
    }
});

module.exports = router;