const nodemailer = require('nodemailer'); 
const { poolPromise, sql } = require('../db'); 
const crypto = require('crypto');

// ✅ Import Template
const { 
    itNewTicketTemplate, 
    managerApprovalTemplate, 
    userStatusUpdateTemplate 
} = require('../utils/emailTemplates'); 

const PASSWORD_FLAG = 'USE_EXISTING_PASS'; 

// ==============================================================
// 🔐 DECRYPTION HELPER
// ==============================================================
const ENCRYPTION_KEY = process.env.APP_SECRET || '12345678901234567890123456789012'; 

const decryptPassword = (text) => {
    if (!text) return '';
    const regex = /^ENCRYPTED_PASS_PLACEHOLDER\((.*)\)$/; 
    const match = text.match(regex);
    if (match && match[1]) return match[1];

    try {
        let textParts = text.split(':');
        if (textParts.length < 2) return text; 
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption Error:', error);
        return text;
    }
};

// ==============================================================
// Service Logic
// ==============================================================

const getSettings = async () => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`SELECT setting_key, setting_value FROM app_settings`);
        const settings = result.recordset.reduce((acc, row) => {
            const key = row.setting_key ? row.setting_key.trim() : '';
            acc[key] = row.setting_value;
            return acc;
        }, {});
        
        if (settings.smtpPass && settings.smtpPass !== PASSWORD_FLAG) {
            settings.smtpPass = decryptPassword(settings.smtpPass);
        }
        return settings;
    } catch (err) {
        console.error('Mail Service: Failed to fetch settings:', err);
        return {};
    }
};

const getTicketDetails = async (ticketId) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, ticketId)
            .query(`
                SELECT 
                    t.ticket_id, t.ticket_no, t.subject, t.description, t.status, t.current_step,
                    req.full_name AS requester_name,
                    req.email AS requester_email,
                    req.department AS requester_dept,
                    tech.full_name AS technician_name,
                    tech.email AS technician_email
                FROM tickets t
                LEFT JOIN users req ON t.requester_id = req.user_id
                LEFT JOIN users tech ON t.technician_id = tech.user_id
                WHERE t.ticket_id = @id
            `);
        return result.recordset[0];
    } catch (err) {
        console.error('Mail Service: Failed to fetch ticket details:', err);
        return null;
    }
};

const mapTemplateData = (details, settings, eventName) => {
    if (!details) return null;
    
    const baseUrl = settings.appBaseUrl || process.env.APP_FRONTEND_URL || 'http://itsupport.local';
    let targetPath = '/app/user-home'; 

    if (eventName === 'MANAGER_APPROVAL') {
        targetPath = '/app/approvals/pending'; 
    } else if (eventName === 'IT_NEW_TICKET' || eventName === 'IT_TICKET_APPROVED') {
        targetPath = '/app/admin/tickets'; 
    } else {
        targetPath = `/app/my-tickets/${details.ticket_id}`; 
    }

    const link = `${baseUrl}${targetPath}`;
    const technicianName = details.technician_name || 'ทีมงาน IT Support';

    let templateStatus = details.status;
    if (details.status === 'NEW' && details.current_step === 'APPROVED') {
        templateStatus = 'APPROVED'; 
    }

    return {
        TICKET_NO: details.ticket_no || 'N/A',
        SUBJECT: details.subject || 'N/A',
        STATUS: templateStatus,
        REQUESTER: details.requester_name || 'N/A',
        TECHNICIAN: technicianName,
        DEPARTMENT: details.requester_dept || 'N/A',
        DESCRIPTION: details.description || 'N/A',
        LINK: link 
    };
};

const sendNotification = async (eventName, ticketId, specificRecipientEmail = null) => {
    const [settings, ticketDetails] = await Promise.all([getSettings(), getTicketDetails(ticketId)]);
    
    if (!settings.smtpHost || !ticketDetails || !settings.smtpUser || !settings.smtpPass) {
        console.warn(`Mail Service: Skipping notification for ${eventName}. SMTP setup incomplete.`);
        return;
    }
    
    const data = mapTemplateData(ticketDetails, settings, eventName);
    let finalHtml = '';
    let finalSubject = '';
    let recipientEmail = '';
    const orgName = settings.orgName || 'IT Service Desk';
    
    let itStaffEmail = settings.itNotificationEmail || settings.smtpUser;

    switch (eventName) {
        case 'IT_NEW_TICKET':
            finalHtml = itNewTicketTemplate(data, orgName);
            finalSubject = `[${orgName}] งานใหม่: ${data.TICKET_NO} - ${data.SUBJECT}`;
            recipientEmail = itStaffEmail; 
            break;

        case 'IT_TICKET_APPROVED':
            finalHtml = itNewTicketTemplate(data, orgName); 
            finalSubject = `[${orgName}] ✅ งานได้รับการอนุมัติแล้ว: ${data.TICKET_NO}`;
            recipientEmail = itStaffEmail; 
            break;

        case 'MANAGER_APPROVAL':
            // 🔥 ส่วนที่แก้ไข: ดึงชื่อผู้อนุมัติมาใส่ " San" ต่อท้าย
            let approverName = 'Approver';
            try {
                const pool = await poolPromise;
                const mgrRes = await pool.request()
                    .input('email', sql.NVarChar, specificRecipientEmail)
                    .query(`SELECT full_name FROM users WHERE email = @email`);
                if (mgrRes.recordset.length > 0) {
                    approverName = mgrRes.recordset[0].full_name;
                }
            } catch (err) {
                console.error('Error fetching manager name:', err);
            }
            
            data.APPROVER_NAME = `${approverName} San`; // ✅ เพิ่มตัวแปร APPROVER_NAME สำหรับ Template
            
            finalHtml = managerApprovalTemplate(data, orgName);
            finalSubject = `[${orgName}] คำขออนุมัติงาน: ${data.TICKET_NO}`;
            recipientEmail = specificRecipientEmail; 
            break;

        case 'USER_CREATED':
        case 'USER_UPDATED':
        case 'USER_RESOLVED':
            finalHtml = userStatusUpdateTemplate(data, orgName); 
            let statusLabel = data.STATUS;

            if (data.STATUS === 'IN PROGRESS') {
                statusLabel = 'กำลังดำเนินการ';
            } else if (data.STATUS === 'APPROVED') {
                statusLabel = 'อนุมัติแล้ว';
            } else if (data.STATUS === 'REJECTED') {
                statusLabel = 'ไม่ผ่านการอนุมัติ';
            } else if (data.STATUS === 'COMPLETED' || data.STATUS === 'RESOLVED') {
                statusLabel = 'ดำเนินการเสร็จสิ้น';
            }
            
            finalSubject = `[${orgName}] อัปเดตสถานะ (${statusLabel}) - ${data.TICKET_NO}`;
            recipientEmail = ticketDetails.requester_email;
            break;
            
        default:
            return;
    }
    
    if (!recipientEmail) return;
    
    try {
        const transporter = nodemailer.createTransport({
            host: settings.smtpHost,
            port: parseInt(settings.smtpPort),
            secure: parseInt(settings.smtpPort) === 465, 
            auth: {
                user: settings.smtpUser,
                pass: settings.smtpPass 
            },
            tls: { rejectUnauthorized: false }
        });
        
        const toField = typeof recipientEmail === 'string' && recipientEmail.includes(',')
            ? recipientEmail.split(',').map(email => email.trim())
            : recipientEmail;

        await transporter.sendMail({
            from: `"${settings.smtpFrom || orgName}" <${settings.smtpUser}>`,
            to: toField,
            subject: finalSubject,
            html: finalHtml,
            text: `Ticket: ${data.TICKET_NO}\nStatus: ${data.STATUS}\nLink: ${data.LINK}` 
        });

        console.log(`📧 Mail sent: ${eventName} to ${recipientEmail}`);
    } catch (error) {
        console.error(`❌ Mail Service Error [${eventName}]:`, error.message);
    }
};

module.exports = { sendNotification };