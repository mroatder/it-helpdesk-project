const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const nodemailer = require('nodemailer'); 
// NOTE: ควรติดตั้งและใช้ไลบรารีเข้ารหัสที่ปลอดภัย (เช่น crypto-js หรือ bcrypt)

// Flag ที่ Frontend ใช้ส่งกลับมาแทนรหัสผ่านเมื่อผู้ใช้ไม่ได้แก้ไข
const PASSWORD_FLAG = 'USE_EXISTING_PASS'; 

// ==============================================================
// 🚨 IMPORTANT: IMPLEMENT ENCRYPTION/DECRYPTION FUNCTIONS HERE
// (ใช้โค้ดจริงที่ปลอดภัยในการใช้งานจริง)
// ==============================================================
// 
// 🔒 ฟังก์ชันเข้ารหัส (ใช้ก่อนบันทึกค่า smtpPass ลง DB)
const encryptPassword = (password) => {
    if (!password) return '';
    return `ENCRYPTED_PASS_PLACEHOLDER(${password})`; 
};

// 🔓 ฟังก์ชันถอดรหัส (ใช้ก่อนส่งรหัสผ่านให้ Nodemailer)
const decryptPassword = (encryptedPass) => {
    // ✅ FIX: ใช้ Regular Expression เพื่อดึงค่ารหัสผ่านที่อยู่ภายในวงเล็บ 
    const regex = /^ENCRYPTED_PASS_PLACEHOLDER\((.*)\)$/; 
    const match = encryptedPass.match(regex);
    
    if (match && match[1]) {
        return match[1];
    }
    
    return encryptedPass; 
};
// ==============================================================
// 🚨 END ENCRYPTION/DECRYPTION IMPLEMENTATION
// ==============================================================


// ✅ GET: /api/settings (ดึงการตั้งค่าทั้งหมด)
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`SELECT setting_key, setting_value FROM app_settings`);
        
        const settings = result.recordset.reduce((acc, row) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});

        // ✅ SECURITY FIX: ถ้ามีรหัสผ่านใน DB ให้ส่ง Flag แทนรหัสผ่านจริง
        const currentPass = settings.smtpPass;
        if (currentPass && currentPass.length > 0 && currentPass !== PASSWORD_FLAG) {
            settings.smtpPass = PASSWORD_FLAG;
        } else if (!currentPass) {
            settings.smtpPass = '';
        }

        res.json({ success: true, data: settings });
    } catch (err) {
        console.error('❌ FETCH SETTINGS ERROR (DB):', err); // ⬅️ เพิ่ม Log เพื่อตรวจสอบ DB Error
        res.status(500).json({ success: false, message: 'Error fetching settings: Database connection failed or table missing' });
    }
});


// ✅ POST: /api/settings/save (บันทึกการตั้งค่า)
router.post('/save', async (req, res) => {
    const settings = req.body;
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        for (const [key, value] of Object.entries(settings)) {
            
            // ✅ 1. จัดการรหัสผ่าน: ถ้าเป็น Flag ให้ข้ามการอัปเดต
            if (key === 'smtpPass' && value === PASSWORD_FLAG) {
                continue; 
            }
            
            let finalValue = value; 
            if (key === 'smtpPass' && value && value !== PASSWORD_FLAG) {
                // 🔒 เข้ารหัสรหัสผ่านใหม่ก่อนบันทึก
                finalValue = encryptPassword(value); 
            }
            
            // ใช้ MERGE INTO app_settings
            await transaction.request()
                .input('key', sql.NVarChar, key)
                .input('value', sql.NVarChar, finalValue)
                .query(`
                    MERGE INTO app_settings AS Target
                    USING (VALUES (@key, @value)) AS Source (setting_key, setting_value)
                    ON Target.setting_key = Source.setting_key
                    WHEN MATCHED THEN
                        UPDATE SET Target.setting_value = Source.setting_value, Target.updated_at = GETDATE()
                    WHEN NOT MATCHED BY TARGET THEN
                        INSERT (setting_key, setting_value) VALUES (setting_key, setting_value);
                `);
        }
        
        await transaction.commit();
        res.json({ success: true, message: 'บันทึกการตั้งค่าสำเร็จ' });

    } catch (err) {
        if (transaction) transaction.rollback();
        console.error('Save Settings Error:', err);
        res.status(500).json({ success: false, message: 'ไม่สามารถบันทึกการตั้งค่าได้' });
    }
});


// ✅ POST: /api/settings/test-smtp (ทดสอบการเชื่อมต่อ SMTP)
router.post('/test-smtp', async (req, res) => {
    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, orgName } = req.body;
    
    let finalSmtpPass = smtpPass;
    
    // ✅ 2. หากเป็น Flag ให้ดึงรหัสผ่านจริงจาก DB มาใช้
    if (smtpPass === PASSWORD_FLAG) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`SELECT setting_value FROM app_settings WHERE setting_key = 'smtpPass'`);
            
            const encryptedPass = result.recordset[0]?.setting_value;

            if (!encryptedPass || encryptedPass === PASSWORD_FLAG || encryptedPass === '') {
                return res.status(400).json({ success: false, message: 'ไม่พบรหัสผ่าน SMTP ในระบบ กรุณาบันทึกก่อนทดสอบ' });
            }
            
            // 🔓 ถอดรหัสรหัสผ่านที่บันทึกไว้
            finalSmtpPass = decryptPassword(encryptedPass);

        } catch (error) {
            console.error('Error retrieving DB password for test:', error);
            return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงรหัสผ่านจากฐานข้อมูล' });
        }
    }

    // 🛑 DEBUGGING: แสดงข้อมูลสำคัญก่อนส่งให้ Nodemailer
    console.log('--- DEBUG SMTP START ---');
    console.log(`Host: ${smtpHost}, Port: ${smtpPort}`);
    console.log(`User: ${smtpUser}`);
    console.log(`Password (Decrypted): ${finalSmtpPass}`); // * ตรวจสอบค่านี้ว่าตรงกับรหัสผ่านจริง 100% *
    console.log(`Secure Setting: ${smtpPort == 465}`);
    console.log('--- DEBUG SMTP END ---');

    const testRecipient = smtpUser; 

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort == 465, // ✅ FIX: แก้ไขเป็น 465 (มาตรฐาน SMTPS)
            auth: {
                user: smtpUser,
                pass: finalSmtpPass // ใช้รหัสผ่านที่ถูกถอดรหัสหรือกรอกใหม่
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transporter.verify(); // ตรวจสอบการเชื่อมต่อ
        
        // ส่งอีเมลทดสอบ
        await transporter.sendMail({
            from: `"${smtpFrom}" <${smtpUser}>`,
            to: testRecipient,
            subject: `[${orgName || 'IT Service'}] Test SMTP Connection Success`,
            text: 'This is a test email sent from the IT Service Desk application. The SMTP connection is working correctly.',
            html: '<b>การเชื่อมต่อ SMTP สำเร็จ</b>'
        });

        res.json({ success: true, message: 'เชื่อมต่อและส่งอีเมลทดสอบสำเร็จ' });
        
    } catch (error) {
        console.error('SMTP Test Error:', error);
        res.status(500).json({ success: false, message: `ไม่สามารถเชื่อมต่อ SMTP ได้: ${error.code || error.message}` });
    }
});

// ✅ GET: /api/settings/holidays (ดึงรายการวันหยุดทั้งหมด)
router.get('/holidays', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT FORMAT(holiday_date, 'yyyy-MM-dd') as holiday_date, description 
            FROM holidays 
            ORDER BY holiday_date DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Fetch Holidays Error:', err);
        res.status(500).json({ success: false, message: 'ไม่สามารถดึงข้อมูลวันหยุดได้' });
    }
});

// ✅ POST: /api/settings/holidays (เพิ่มหรือสลับวันหยุด - Toggle)
router.post('/holidays', async (req, res) => {
    const { holiday_date, description } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('holiday_date', sql.Date, holiday_date)
            .input('description', sql.NVarChar, description || 'วันหยุด')
            .query(`
                IF NOT EXISTS (SELECT 1 FROM holidays WHERE holiday_date = @holiday_date)
                BEGIN
                    INSERT INTO holidays (holiday_date, description) VALUES (@holiday_date, @description)
                END
            `);
        res.json({ success: true, message: 'บันทึกวันหยุดสำเร็จ' });
    } catch (err) {
        console.error('Save Holiday Error:', err);
        res.status(500).json({ success: false, message: 'ไม่สามารถบันทึกวันหยุดได้' });
    }
});

// ✅ PUT: /api/settings/holidays/:date (อัปเดตหมายเหตุวันหยุด)
router.put('/holidays/:date', async (req, res) => {
    const { date } = req.params;
    const { description } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('holiday_date', sql.Date, date)
            .input('description', sql.NVarChar, description)
            .query(`UPDATE holidays SET description = @description WHERE holiday_date = @holiday_date`);
        res.json({ success: true, message: 'แก้ไขหมายเหตุสำเร็จ' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'ไม่สามารถแก้ไขข้อมูลได้' });
    }
});

// ✅ DELETE: /api/settings/holidays/:date (ลบวันหยุด)
router.delete('/holidays/:date', async (req, res) => {
    const { date } = req.params;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('holiday_date', sql.Date, date)
            .query(`DELETE FROM holidays WHERE holiday_date = @holiday_date`);
        res.json({ success: true, message: 'ลบวันหยุดสำเร็จ' });
    } catch (err) {
        console.error('Delete Holiday Error:', err);
        res.status(500).json({ success: false, message: 'ไม่สามารถลบข้อมูลได้' });
    }
});

module.exports = router;