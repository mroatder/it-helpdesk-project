const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const ActiveDirectory = require('activedirectory2');
const { sendNotification } = require('../services/mailService.js');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ตั้งค่า Multer สำหรับเก็บไฟล์แนบใน Tickets
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // จาก backend_web/routes ถอยไป 2 ขั้นเพื่อไปถึง root folder
        const dir = path.join(__dirname, '..', '..', 'uploads', 'tickets');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'ATT-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB Limit
});

const adminOnly = (req, res, next) => {
    const userRole = (req.user && req.user.role) ? req.user.role.toUpperCase() : '';
    if (userRole === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access Denied: Admin Only' });
    }
};

router.use(authMiddleware);

// ฟังก์ชันช่วยเรียก Notification แบบ Non-blocking (โค้ดเดิม)
const triggerNotification = (eventName, ticketId, specificRecipientEmail = null) => {
    if (typeof sendNotification !== 'function') {
        console.error('🚨 FATAL ERROR: sendNotification is not correctly imported!');
        return;
    }

    sendNotification(eventName, ticketId, specificRecipientEmail)
        .catch(err => console.error(`🚨 Async Notification Error (${eventName}):`, err.message));
};

// Helper: ลำดับความสำคัญหัวหน้า (โค้ดเดิม)
// ✅ แก้ไข: รับค่า level_rank มาใช้จัดลำดับ
function getManagerApprovalPriority(rank) {
    if (rank === null || rank === undefined) return 99;
    return parseInt(rank);
}

// =========================================================
// 🟢 GENERAL LISTS & APPROVAL QUEUES
// =========================================================

// GET: Approvals Pending (FIX: เพิ่ม DISTINCT)
router.get('/approvals/pending/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const loggedInUserId = Number(req.user.user_id || req.user.id);

        // 🛡️ ป้องกัน Bypass: ดูได้เฉพาะของตัวเอง หรือเป็น ADMIN
        if (Number(userId) !== loggedInUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT DISTINCT 
                    t.ticket_id, t.ticket_no, t.subject, t.priority, t.user_urgency,
                    req.full_name AS requester_name,
                    req.department AS requester_dept,
                    ta.created_at AS requested_at
                FROM ticket_approvals ta
                JOIN tickets t ON ta.ticket_id = t.ticket_id
                LEFT JOIN users req ON t.requester_id = req.user_id
                WHERE ta.approver_id = @userId AND ta.status = 'PENDING'
                ORDER BY ta.created_at ASC
            `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching pending approvals' });
    }
});

// GET: Approvals History (FIX: เพิ่ม DISTINCT)
router.get('/approvals/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const loggedInUserId = Number(req.user.user_id || req.user.id);

        // 🛡️ ป้องกัน Bypass: ดูได้เฉพาะของตัวเอง หรือเป็น ADMIN
        if (Number(userId) !== loggedInUserId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT DISTINCT
                    t.ticket_id, t.ticket_no, t.subject,
                    req.full_name AS requester_name,
                    ta.status AS approval_status,
                    ta.approved_at
                FROM ticket_approvals ta
                JOIN tickets t ON ta.ticket_id = t.ticket_id
                LEFT JOIN users req ON t.requester_id = req.user_id
                WHERE ta.approver_id = @userId AND ta.status != 'PENDING' AND ta.status != 'BLOCKED'
                ORDER BY ta.approved_at DESC
            `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching approval history' });
    }
});

// GET: All Tickets
router.get('/all', adminOnly, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT
                t.*,
                u.full_name AS requester_name,
                u.department AS requester_dept,
                tech.full_name AS technician_name,
                COALESCE(sc.sub_name, mc.category_name, 'N/A') AS category_name,
                mc.category_name AS main_category_name
            FROM tickets t
            LEFT JOIN users u ON t.requester_id = u.user_id
            LEFT JOIN users tech ON t.technician_id = tech.user_id
            LEFT JOIN sub_categories sc ON t.category_id = sc.sub_id
            LEFT JOIN categories mc ON mc.cat_id = ISNULL(sc.cat_id, t.category_id)
            WHERE (t.is_deleted = 0 OR t.is_deleted IS NULL)
            ORDER BY t.created_at DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error fetching tickets' });
    }
});

// GET: My Tickets (FIX: เพิ่ม DISTINCT)
router.get('/my-tickets/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const loggedInUserId = String(req.user.user_id || req.user.id || '');
        const userRole = (req.user.role || '').toUpperCase();

        if (String(userId) !== loggedInUserId && userRole !== 'ADMIN') {
            return res.status(403).json({ success: false, message: `Access Denied` });
        }
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .query(`
                SELECT
                    t.ticket_id,
                    t.ticket_no,
                    t.subject,
                    t.status,
                    t.priority,
                    t.created_at,
                    t.current_step,
                    tech.full_name AS technician_name,
                    COALESCE(sc.sub_name, mc.category_name, 'N/A') AS category_name
                FROM tickets t
                LEFT JOIN users tech ON t.technician_id = tech.user_id
                LEFT JOIN sub_categories sc ON t.category_id = sc.sub_id
                LEFT JOIN categories mc ON (sc.cat_id = mc.cat_id OR t.category_id = mc.cat_id)
                WHERE t.requester_id = @user_id
                AND (t.is_deleted = 0 OR t.is_deleted IS NULL)
                ORDER BY t.created_at DESC
            `);

        // Formatter: ตัดคำ Main - Sub (โค้ดเดิม)
        const formattedTickets = result.recordset.map(ticket => {
            let cleanSubject = ticket.subject;
            if (cleanSubject && cleanSubject.includes(' - ')) {
                const parts = cleanSubject.split(' - ');
                cleanSubject = parts[parts.length - 1];
            }
            return { ...ticket, subject: cleanSubject };
        });

        res.json({ success: true, data: formattedTickets });
    } catch (err) {
        console.error('Error fetching my tickets:', err);
        res.status(500).json({ success: false, message: 'Error fetching tickets' });
    }
});

// =========================================================
// 🟢 DYNAMIC TICKET HANDLERS (โค้ดเดิม)
// =========================================================

// GET: Approval Chain (🛡️ เพิ่ม Security)
router.get('/:id/approval-chain', async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInUserId = String(req.user.user_id || req.user.id || '');
        const userRole = (req.user.role || '').toUpperCase();
        const pool = await poolPromise;

        // เช็คสิทธิ์เบื้องต้น (เจ้าของ, ช่าง, Admin, หรืออยู่ใน list ผู้อนุมัติ)
        const ticketCheck = await pool.request().input('tid', sql.Int, id).query(`SELECT requester_id, technician_id FROM tickets WHERE ticket_id = @tid`);
        if (ticketCheck.recordset.length === 0) return res.status(404).json({ success: false, message: 'Not found' });

        const ticket = ticketCheck.recordset[0];
        const isRelated = String(ticket.requester_id) === loggedInUserId || String(ticket.technician_id) === loggedInUserId || userRole === 'ADMIN';

        const approvalCheck = await pool.request().input('tid', sql.Int, id).input('uid', sql.Int, loggedInUserId).query(`SELECT 1 FROM ticket_approvals WHERE ticket_id = @tid AND approver_id = @uid`);

        if (!isRelated && approvalCheck.recordset.length === 0) {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT ta.*, u.full_name AS approver_name, u.title AS approver_title FROM ticket_approvals ta LEFT JOIN users u ON ta.approver_id = u.user_id WHERE ta.ticket_id = @id ORDER BY ta.approval_order ASC`);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error' });
    }
});

// GET: Approval Info (🛡️ เพิ่ม Security)
router.get('/:id/approval', async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const loggedInUserId = Number(req.user.user_id || req.user.id || 0);
        const userRole = (req.user.role || '').toUpperCase();
        const pool = await poolPromise;

        // ผู้อนุมัติเท่านั้นที่ควรเรียกหน้านี้ได้เพื่อ Approve งาน
        const result = await pool.request().input('id', sql.Int, ticketId).query(`SELECT TOP 1 ta.*, u_approver.full_name AS approver_name, u_requester.full_name AS requester_name, t.requester_id FROM ticket_approvals ta LEFT JOIN users u_approver ON ta.approver_id = u_approver.user_id LEFT JOIN tickets t ON ta.ticket_id = t.ticket_id LEFT JOIN users u_requester ON t.requester_id = u_requester.user_id WHERE ta.ticket_id = @id AND ta.status = 'PENDING' ORDER BY ta.approval_order ASC`);

        if (result.recordset[0]) {
            const approverId = Number(result.recordset[0].approver_id);
            const requesterId = Number(result.recordset[0].requester_id);

            if (approverId !== loggedInUserId && requesterId !== loggedInUserId && userRole !== 'ADMIN') {
                return res.status(403).json({ success: false, message: 'Access Denied' });
            }
        } else {
            // ถ้าไม่เจอ PENDING approval → เช็คว่าเป็นผู้อนุมัติในตั๋วนี้หรือเปล่า (อาจ approve ไปแล้ว)
            const isRelatedApprover = await pool.request()
                .input('tid', sql.Int, ticketId)
                .input('uid', sql.Int, loggedInUserId)
                .query(`SELECT 1 FROM ticket_approvals WHERE ticket_id = @tid AND approver_id = @uid`);

            if (isRelatedApprover.recordset.length === 0 && userRole !== 'ADMIN') {
                return res.status(403).json({ success: false, message: 'Access Denied' });
            }
        }

        res.json({ success: true, data: result.recordset[0] || null });
    } catch (err) { res.status(500).json({ success: false, message: 'Error' }); }
});

// ✅ GET: Logs (เพิ่มสิทธิ์ให้คนอนุมัติเห็น Timeline ด้วย)
router.get('/:id/logs', async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const loggedInUserId = Number(req.user.user_id || req.user.id || 0);
        const userRole = (req.user.role || '').toUpperCase();

        const pool = await poolPromise;

        // 🔍 เช็คสิทธิ์การเป็นผู้อนุมัติ
        const approvalCheck = await pool.request()
            .input('tid', sql.Int, ticketId)
            .input('uid', sql.Int, loggedInUserId)
            .query(`SELECT 1 FROM ticket_approvals WHERE ticket_id = @tid AND approver_id = @uid`);

        const isApprover = approvalCheck.recordset.length > 0;

        const ticketCheck = await pool.request()
            .input('tid', sql.Int, ticketId)
            .query(`SELECT requester_id, technician_id, is_deleted FROM tickets WHERE ticket_id = @tid`);

        if (ticketCheck.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const ticket = ticketCheck.recordset[0];

        // ถ้าถูกลบแล้ว เฉพาะแอดมินที่ดูได้
        if (ticket.is_deleted && userRole !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        const isOwner = Number(ticket.requester_id) === loggedInUserId;
        const isTechnician = ticket.technician_id ? Number(ticket.technician_id) === loggedInUserId : false;
        const isAdmin = userRole === 'ADMIN';

        // ✅ อนุญาตให้ผ่านถ้าเป็นเจ้าของ, ช่าง, แอดมิน หรือ ผู้อนุมัติ
        if (!isOwner && !isTechnician && !isAdmin && !isApprover) {
            return res.status(403).json({ success: false, message: 'Access Denied' });
        }

        const result = await pool.request()
            .input('id', sql.Int, ticketId)
            .query(`
                SELECT l.*, u.full_name AS actor_name, u.role AS actor_role 
                FROM ticket_logs l 
                LEFT JOIN users u ON l.actor_id = u.user_id 
                WHERE l.ticket_id = @id 
                ORDER BY l.created_at DESC
            `);

        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 🛑 FIX 1: POST: Logs (ปรับ Logic การเปลี่ยน Status ตาม Workflow ใหม่)
router.post('/:id/logs', async (req, res) => {
    try {
        const { id } = req.params;
        // ✅ รับค่าเพิ่ม: technician_id, category_id จาก Frontend body
        const { action, message, actor_id, technician_id, category_id } = req.body;
        const pool = await poolPromise;

        // --- 🔍 ตรวจสอบสถานะปัจจุบันของตั๋วก่อนทำรายการ ---
        const currentTicket = await pool.request()
            .input('tid', sql.Int, id)
            .query(`SELECT status FROM tickets WHERE ticket_id = @tid`);
        const currentStatus = currentTicket.recordset[0]?.status;

        // --- 🔍 ป้องกันการคลิกซ้ำ (Deduplication) ---
        const duplicateCheck = await pool.request()
            .input('ticket_id', sql.Int, id)
            .input('actor_id', sql.Int, actor_id)
            .input('action', sql.NVarChar, action)
            .query(`
                SELECT TOP 1 1 
                FROM ticket_logs 
                WHERE ticket_id = @ticket_id 
                  AND actor_id = @actor_id 
                  AND action = @action 
                  AND DATEDIFF(SECOND, created_at, GETDATE()) < 5
            `);

        if (duplicateCheck.recordset.length > 0) {
            return res.json({ success: true, message: 'Duplicate request ignored.' });
        }

        // 1. บันทึก Log
        await pool.request()
            .input('ticket_id', sql.Int, id)
            .input('actor_id', sql.Int, actor_id)
            .input('action', sql.NVarChar, action)
            .input('message', sql.NVarChar, message)
            .query(`INSERT INTO ticket_logs (ticket_id, actor_id, action, message, created_at) 
                    VALUES (@ticket_id, @actor_id, @action, @message, GETDATE())`);

        let newStatus = null;
        let eventName = null;

        switch (action) {
            case 'ACKNOWLEDGED':
                newStatus = 'PENDING';
                eventName = 'USER_UPDATED'; // ✅ เคส 1, 2, 3: แจ้ง PENDING
                break;

            case 'PURCHASING':
                newStatus = 'IN PROGRESS';
                eventName = 'USER_UPDATED'; // ✅ เคส 1, 2: แจ้ง IN PROGRESS ครั้งแรก
                break;

            case 'RECEIVED':
                newStatus = 'IN PROGRESS';
                eventName = null; // ❌ เคส 1, 2: ไม่ต้องแจ้งเมล (เงียบ)
                break;

            case 'INSTALLING':
            case 'FIXING':
                newStatus = 'IN PROGRESS';
                // ✅ Logic พิเศษ: ส่งเมลเฉพาะกรณีที่สถานะเดิม "ยังไม่ใช่" IN PROGRESS 
                // (ใช้สำหรับเคส 3 หรือเคสซ่อมปกติ) หากผ่าน Purchasing มาแล้วเมลจะไม่ส่งซ้ำ
                if (currentStatus !== 'IN PROGRESS') {
                    eventName = 'USER_UPDATED';
                } else {
                    eventName = null;
                }
                break;

            case 'REQ_APPROVAL':
                newStatus = 'PENDING';
                break;

            case 'RESOLVED':
                newStatus = 'RESOLVED';
                eventName = 'USER_RESOLVED'; // ✅ เคส 1, 2, 3: แจ้ง RESOLVED
                break;

            case 'REOPEN':
                newStatus = 'PENDING';
                eventName = 'USER_UPDATED';
                break;

            case 'ASSIGNED':
                newStatus = null;
                break;
        }

        // 2. สร้างชุดคำสั่ง Update แบบ Dynamic
        let updateFields = [`current_step = @action`];
        const request = pool.request()
            .input('ticket_id', sql.Int, id)
            .input('action', sql.NVarChar, action);

        // จัดการ Status และเวลาที่แก้ไขเสร็จ
        if (newStatus) {
            updateFields.push(`status = @newStatus`);
            request.input('newStatus', sql.NVarChar, newStatus);
            if (newStatus === 'RESOLVED') {
                updateFields.push(`resolved_at = GETDATE()`);
            }
        }

        // ✅ อัปเดต ผู้ดูแล (Technician) ถ้ามีการส่งค่ามา
        if (technician_id !== undefined && technician_id !== null) {
            updateFields.push(`technician_id = @tech_id`);
            request.input('tech_id', sql.Int, technician_id);
        }

        // ✅ อัปเดต ประเภทปัญหา (Category) ถ้ามีการส่งค่ามา
        if (category_id !== undefined && category_id !== null) {
            updateFields.push(`category_id = @cat_id`);
            request.input('cat_id', sql.Int, category_id);
        }

        // 3. รันคำสั่งอัปเดต Tickets
        const queryText = `UPDATE tickets SET ${updateFields.join(', ')} WHERE ticket_id = @ticket_id`;
        await request.query(queryText);

        if (eventName) triggerNotification(eventName, id);

        res.json({ success: true, message: 'Updated Ticket and Logs' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error' });
    }
});

// 🟢 POST: Ticket Feedback & Close Ticket
router.post('/:id/feedback', async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const { rating, comment, actor_id } = req.body;
        const pool = await poolPromise;

        // 🔍 หาสมัครงาน (Ticket) เพื่อเอา requester_id มาเป็น User ID สำรอง
        const ticketResult = await pool.request()
            .input('ticket_id', sql.Int, id)
            .query('SELECT requester_id FROM tickets WHERE ticket_id = @ticket_id');

        if (ticketResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const userId = actor_id || ticketResult.recordset[0].requester_id;

        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // 1. บันทึกข้อมูล Feedback ลงตารางใหม่
        await transaction.request()
            .input('ticket_id', sql.Int, id)
            .input('user_id', sql.Int, userId)
            .input('rating', sql.Int, rating)
            .input('comment', sql.NVarChar, comment || null)
            .query(`INSERT INTO ticket_feedback (ticket_id, user_id, rating, comment, created_at)
                    VALUES (@ticket_id, @user_id, @rating, @comment, GETDATE())`);

        // 2. อัปเดตตั๋วเป็น CLOSED และบันทึกวันที่ปิดงาน
        await transaction.request()
            .input('ticket_id', sql.Int, id)
            .query(`UPDATE tickets SET status = 'CLOSED', current_step = 'CLOSED', closed_at = GETDATE() WHERE ticket_id = @ticket_id`);

        // 3. บันทึก Log การปิดงาน
        await transaction.request()
            .input('ticket_id', sql.Int, id)
            .input('actor_id', sql.Int, actor_id)
            .input('action', sql.NVarChar, 'CLOSED')
            .input('message', sql.NVarChar, `พนักงานยืนยันปิดงานและให้คะแนนประเมิน: ${rating} ดาว`)
            .query(`INSERT INTO ticket_logs (ticket_id, actor_id, action, message, created_at) 
                    VALUES (@ticket_id, @actor_id, @action, @message, GETDATE())`);

        await transaction.commit();
        res.json({ success: true, message: 'บันทึกคำประเมินและปิดงานเรียบร้อย' });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('--- FEEDBACK API ERROR ---');
        console.error('Ticket ID:', req.params.id);
        console.error('Body:', req.body);
        console.error('Error Details:', err);
        console.error('---------------------------');
        res.status(500).json({ success: false, message: 'Error processing feedback', error: err.message });
    }
});

// ✅ POST: Create Ticket (Fixed Version: WAITING APPROVE + Correct GETDATE + File Uploads)
router.post('/create', upload.array('attachments', 5), async (req, res) => {
    let transaction;
    try {
        const {
            subject, description, categoryId, subCategoryId, priority, user_urgency,
            requesterId, approverIdStr, ticket_type
        } = req.body;

        if (!description || !requesterId) {
            return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
        }

        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // 1. Gen Ticket No
        const date = new Date();
        const thaiYear = (date.getFullYear() + 543).toString().slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const prefix = `TB${thaiYear}${month}`;

        const lastTicket = await transaction.request()
            .input('prefix', sql.NVarChar, prefix + '%')
            .query(`SELECT TOP 1 ticket_no FROM tickets (XLOCK) WHERE ticket_no LIKE @prefix ORDER BY ticket_no DESC`);

        let nextSequence = 1;
        if (lastTicket.recordset.length > 0) {
            const lastNo = lastTicket.recordset[0].ticket_no;
            const lastSeqStr = lastNo.substring(6);
            const nextSequenceInt = parseInt(lastSeqStr) + 1;
            if (!isNaN(nextSequenceInt)) nextSequence = nextSequenceInt;
        }

        const runningNo = ('000' + nextSequence).slice(-3);
        const ticketNo = `${prefix}${runningNo}`;

        // 🟢 FIX: เปลี่ยนจาก PENDING เป็น WAITING APPROVE ตามที่ตกลงกันไว้
        const requiresApproval = approverIdStr && approverIdStr.trim() !== '';
        const initialStatus = requiresApproval ? 'WAITING APPROVE' : 'NEW';
        const initialStep = requiresApproval ? 'WAITING APPROVE' : 'OPEN';

        const finalCategoryId = subCategoryId ? subCategoryId : categoryId;

        // ดึงชื่อ Subject จาก DB (โค้ดเดิม)
        let dbSubject = subject;
        if (subCategoryId) {
            const subRes = await transaction.request()
                .input('subId', sql.Int, subCategoryId)
                .query('SELECT sub_name FROM sub_categories WHERE sub_id = @subId');
            if (subRes.recordset.length > 0) dbSubject = subRes.recordset[0].sub_name;
        } else if (categoryId) {
            const catRes = await transaction.request()
                .input('catId', sql.Int, categoryId)
                .query('SELECT category_name FROM categories WHERE cat_id = @catId');
            if (catRes.recordset.length > 0) dbSubject = catRes.recordset[0].category_name;
        }

        // 2. Insert Ticket (Fixed: GETDATE ตัวสะกดถูกต้อง)
        const ticketResult = await transaction.request()
            .input('ticket_no', sql.NVarChar, ticketNo)
            .input('requester_id', sql.Int, requesterId)
            .input('category_id', sql.Int, finalCategoryId || null)
            .input('subject', sql.NVarChar, dbSubject)
            .input('description', sql.NVarChar, description)
            .input('priority', sql.NVarChar, priority || '')
            .input('user_urgency', sql.NVarChar, user_urgency || 'NORMAL')
            .input('status', sql.NVarChar, initialStatus)
            .input('current_step', sql.NVarChar, initialStep)
            .input('ticket_type', sql.NVarChar, ticket_type || '')
            .query(`
                INSERT INTO tickets 
                (ticket_no, requester_id, category_id, subject, description, priority, user_urgency, status, current_step, ticket_type, created_at)
                OUTPUT INSERTED.ticket_id 
                VALUES 
                (@ticket_no, @requester_id, @category_id, @subject, @description, @priority, @user_urgency, @status, @current_step, @ticket_type, GETDATE())
            `);

        const newTicketId = ticketResult.recordset[0].ticket_id;

        // 3. Approval Chain Logic (ปรับปรุงให้ใช้ level_rank)
        if (requiresApproval) {
            const managerIds = approverIdStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

            // 🎯 แก้ Query: ดึง level_rank มาด้วย
            const managersDataResult = await transaction.request()
                .query(`SELECT user_id, title, email, level_rank FROM users WHERE user_id IN (${managerIds.join(',')})`);

            const managersData = managersDataResult.recordset;

            // 🎯 แก้ Logic การ Sort: เรียงจาก Rank มาก (ตำแหน่งน้อย) ไปหา Rank น้อย (ตำแหน่งสูง)
            const sortedManagers = managersData.sort((a, b) => {
                const priorityA = getManagerApprovalPriority(a.level_rank);
                const priorityB = getManagerApprovalPriority(b.level_rank);
                return priorityB - priorityA; // ผลลัพธ์: 4 -> 3 -> 1
            });

            let approvalOrder = 1;
            let firstApproverEmail = null;

            for (const mgr of sortedManagers) {
                const status = (approvalOrder === 1) ? 'PENDING' : 'BLOCKED';
                await transaction.request()
                    .input('ticket_id', sql.Int, newTicketId)
                    .input('approver_id', sql.Int, mgr.user_id)
                    .input('status', sql.NVarChar, status)
                    .input('order', sql.Int, approvalOrder)
                    .query(`INSERT INTO ticket_approvals (ticket_id, approver_id, status, approval_order, created_at) 
                            VALUES (@ticket_id, @approver_id, @status, @order, GETDATE())`);

                if (approvalOrder === 1) firstApproverEmail = mgr.email;
                approvalOrder++;
            }

            if (firstApproverEmail) triggerNotification('MANAGER_APPROVAL', newTicketId, firstApproverEmail);

            await transaction.request()
                .input('ticket_id', sql.Int, newTicketId)
                .input('actor_id', sql.Int, requesterId)
                .input('action', sql.NVarChar, 'REQ_APPROVAL')
                .input('message', sql.NVarChar, 'สร้างใบงานและรออนุมัติ (WAITING APPROVE)')
                .query(`INSERT INTO ticket_logs (ticket_id, actor_id, action, message, created_at) VALUES (@ticket_id, @actor_id, @action, @message, GETDATE())`);

        } else {
            triggerNotification('USER_CREATED', newTicketId);
            triggerNotification('IT_NEW_TICKET', newTicketId);
        }

        // 4. บันทึกข้อมูลไฟล์แนบ (ถ้ามี)
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // 🟢 FIX: แก้ปัญหาชื่อไฟล์ภาษาไทยเพี้ยน (Encoding)
                const originalNameUtf8 = Buffer.from(file.originalname, 'latin1').toString('utf8');

                // เก็บ path แบบสัมพัทธ์เพื่อให้ฝั่ง Web เรียกใช้ผ่าน /uploads/tickets/...
                const relativePath = `/tickets/${file.filename}`;
                await transaction.request()
                    .input('ticket_id', sql.Int, newTicketId)
                    .input('file_name', sql.NVarChar, originalNameUtf8)
                    .input('file_path', sql.NVarChar, relativePath)
                    .input('file_type', sql.NVarChar, file.mimetype)
                    .input('file_size', sql.BigInt, file.size)
                    .query(`INSERT INTO ticket_attachments (ticket_id, file_name, file_path, file_type, file_size)
                            VALUES (@ticket_id, @file_name, @file_path, @file_type, @file_size)`);
            }
        }

        await transaction.commit();
        res.json({ success: true, message: 'สร้างใบงานสำเร็จ', ticketNo, ticketId: newTicketId });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error(err);
        res.status(500).json({ success: false, message: 'Database Error', error: err.message });
    }
});

// POST: Approve (แก้ไขจุดที่ทำให้ Error 500)
router.post('/:id/approve', async (req, res) => {
    let transaction;
    try {
        const { id } = req.params;
        const { status, actor_id, comment } = req.body;
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // 1. อัปเดตสถานะในตาราง ticket_approvals พร้อมบันทึก comment (ถ้ามี)

        await transaction.request()
            .input('ticket_id', sql.Int, id)
            .input('status', sql.NVarChar, status)
            .input('actor_id', sql.Int, actor_id)
            .input('comment', sql.NVarChar, comment || null)
            .query(`UPDATE ticket_approvals SET status = @status, approved_at = GETDATE(), comment = @comment
                    WHERE ticket_id = @ticket_id AND status IN ('PENDING', 'APPROVED') AND approver_id = @actor_id`);

        let logMsg = status === 'APPROVED' ? 'อนุมัติคำร้องเรียบร้อยแล้ว' : 'ปฏิเสธคำร้องขอ';
        if (comment) {
            logMsg += ` (หมายเหตุ: ${comment})`;
        }

        // บันทึก Log
        await transaction.request()
            .input('ticket_id', sql.Int, id)
            .input('actor_id', sql.Int, actor_id)
            .input('action', sql.NVarChar, status)
            .input('message', sql.NVarChar, logMsg)
            .query(`INSERT INTO ticket_logs (ticket_id, actor_id, action, message, created_at) 
                    VALUES (@ticket_id, @actor_id, @action, @message, GETDATE())`);

        // 🛑 กรณีถูกปฏิเสธ (REJECTED)
        if (status === 'REJECTED') {
            await transaction.request()
                .input('ticket_id', sql.Int, id) // ✅ แก้เป็น ticket_id ให้ตรงกับ @ticket_id
                .query(`UPDATE tickets SET status = 'REJECTED', current_step = 'REJECTED' WHERE ticket_id = @ticket_id`);

            await transaction.commit();
            // เช็คว่ามีฟังก์ชันนี้จริงไหมก่อนเรียกใช้ เพื่อไม่ให้ 500
            if (typeof triggerNotification === 'function') triggerNotification('USER_UPDATED', id);
            return res.json({ success: true, message: 'บันทึกผลการพิจารณาเรียบร้อย (คำร้องถูกปฏิเสธ)' });
        }

        // 2. ตรวจสอบลำดับการอนุมัติถัดไป
        const currentOrderResult = await transaction.request()
            .input('ticket_id', sql.Int, id)
            .input('actor_id', sql.Int, actor_id)
            .query(`SELECT approval_order FROM ticket_approvals WHERE ticket_id = @ticket_id AND approver_id = @actor_id`);

        const currentOrder = currentOrderResult.recordset[0]?.approval_order;

        if (currentOrder === undefined) {
            throw new Error('Approval order not found for this user');
        }

        const nextApproverResult = await transaction.request()
            .input('ticket_id', sql.Int, id)
            .input('current_order', sql.Int, currentOrder)
            .query(`SELECT TOP 1 um.approver_id, u.email 
                    FROM ticket_approvals um 
                    JOIN users u ON um.approver_id = u.user_id 
                    WHERE um.ticket_id = @ticket_id AND um.approval_order > @current_order AND um.status = 'BLOCKED' 
                    ORDER BY um.approval_order ASC`);

        const nextApprover = nextApproverResult.recordset[0];

        if (nextApprover) {
            // 🟢 มีคนถัดไป
            await transaction.request()
                .input('ticket_id', sql.Int, id)
                .input('next_approver_id', sql.Int, nextApprover.approver_id)
                .query(`UPDATE ticket_approvals SET status = 'PENDING' WHERE ticket_id = @ticket_id AND approver_id = @next_approver_id`);

            if (nextApprover.email && typeof triggerNotification === 'function') {
                triggerNotification('MANAGER_APPROVAL', id, nextApprover.email);
            }

            await transaction.request()
                .input('ticket_id', sql.Int, id)
                .query(`UPDATE tickets SET status = 'WAITING APPROVE', current_step = 'WAITING APPROVE' WHERE ticket_id = @ticket_id`);

        } else {
            // 🏁 คนสุดท้ายแล้ว
            await transaction.request()
                .input('ticket_id', sql.Int, id)
                .query(`UPDATE tickets SET status = 'NEW', current_step = 'OPEN' WHERE ticket_id = @ticket_id`);

            if (typeof triggerNotification === 'function') {
                triggerNotification('USER_CREATED', id);
                triggerNotification('IT_NEW_TICKET', id);
            }
        }

        await transaction.commit();
        res.json({ success: true, message: 'บันทึกผลการพิจารณาเรียบร้อย' });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("Approve Error:", err);
        res.status(500).json({ success: false, message: 'Database Error', error: err.message });
    }
});

// ✅ GET: Detail (🛡️ Strengthening Security)
router.get('/:id', async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) return res.status(400).json({ success: false, message: 'Invalid ID' });

        const loggedInUserId = Number(req.user.user_id || req.user.id || 0);
        const userRole = (req.user.role || '').toUpperCase();

        const pool = await poolPromise;

        // 1. Fetch ticket to check ownership/roles
        const result = await pool.request()
            .input('id', sql.Int, ticketId)
            .query(`
                SELECT 
                    t.ticket_id, t.ticket_no, t.ticket_type, t.subject, t.description, t.status, t.current_step,
                    t.priority, t.user_urgency, t.created_at, t.due_date,
                    t.technician_id, t.requester_id, t.is_deleted,
                    req.full_name AS requester_name,
                    req.email AS requester_email,
                    req.department AS requester_dept,
                    req.level_rank AS requester_rank,
                    tech.full_name AS technician_name,
                    COALESCE(sc.sub_name, mc.category_name, 'N/A') AS category_name,
                    mc.category_name AS main_category_name
                FROM tickets t
                LEFT JOIN users req ON t.requester_id = req.user_id
                LEFT JOIN users tech ON t.technician_id = tech.user_id
                LEFT JOIN sub_categories sc ON t.category_id = sc.sub_id
                LEFT JOIN categories mc ON (sc.cat_id = mc.cat_id OR t.category_id = mc.cat_id)
                WHERE t.ticket_id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const ticket = result.recordset[0];

        // 🛡️ Security Checks
        const isOwner = Number(ticket.requester_id) === loggedInUserId;
        const isTechnician = ticket.technician_id ? Number(ticket.technician_id) === loggedInUserId : false;
        const isAdmin = userRole === 'ADMIN';

        // 🔍 Check if user is an approver for this ticket
        const approvalCheck = await pool.request()
            .input('tid', sql.Int, ticketId)
            .input('uid', sql.Int, loggedInUserId)
            .query(`SELECT 1 FROM ticket_approvals WHERE ticket_id = @tid AND approver_id = @uid`);

        const isApprover = approvalCheck.recordset.length > 0;

        // ✅ Block if not authorized
        if (!isOwner && !isTechnician && !isAdmin && !isApprover) {
            return res.status(403).json({ success: false, message: 'Access Denied: Restricted access.' });
        }

        // 🛡️ Filter deleted tickets
        if (ticket.is_deleted && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Access Denied: Content moved to trash.' });
        }

        if (ticket.subject && ticket.subject.includes(' - ')) {
            const parts = ticket.subject.split(' - ');
            ticket.subject = parts[parts.length - 1];
        }

        // 📎 ดึงข้อมูลไฟล์แนบ
        const attachmentsResult = await pool.request()
            .input('tid', sql.Int, ticketId)
            .query(`SELECT * FROM ticket_attachments WHERE ticket_id = @tid`);

        ticket.attachments = attachmentsResult.recordset;

        res.json({ success: true, data: ticket });
    } catch (err) {
        console.error('Error fetching ticket detail:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ✅ แก้ไข Route Update ในไฟล์ ticket.js ให้รองรับ ticket_type และฟิลด์อื่นๆ
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // 🎯 รับค่าที่อาจส่งมาจากหน้าบ้าน
        const { status, priority, ticket_type } = req.body;

        if (!id) return res.status(400).json({ success: false, message: 'Ticket ID is missing' });

        const pool = await poolPromise;
        const request = pool.request();
        request.input('id', sql.Int, id);

        // 🧠 สร้าง Query แบบ Dynamic เพื่อเลือกอัปเดตเฉพาะฟิลด์ที่มีการส่งค่ามาจริงๆ
        let updateFields = [];

        if (status) {
            updateFields.push("status = @status");
            request.input('status', sql.NVarChar, status);

            // ⏰ บันทึก timestamp อัตโนมัติตามสถานะ
            if (status === 'RESOLVED') {
                updateFields.push("resolved_at = GETDATE()");
            } else if (status === 'CLOSED') {
                updateFields.push("closed_at = GETDATE()");
            }
        }
        if (priority) {
            updateFields.push("priority = @priority");
            request.input('priority', sql.NVarChar, priority);
        }
        if (ticket_type) {
            // ✅ เพิ่มการอัปเดตประเภทตั๋ว (INCIDENT / SUPPORT)
            updateFields.push("ticket_type = @ticket_type");
            request.input('ticket_type', sql.NVarChar, ticket_type);
        }

        // ถ้าไม่มีข้อมูลส่งมาเลยให้ตอบกลับไป
        if (updateFields.length === 0) {
            return res.json({ success: true, message: 'Nothing to update' });
        }

        const queryText = `UPDATE tickets SET ${updateFields.join(', ')} WHERE ticket_id = @id`;
        await request.query(queryText);

        // 📧 ส่ง Email แจ้ง User เมื่อสถานะเปลี่ยนเป็น RESOLVED
        if (status === 'USER_RESOLVED' || status === 'RESOLVED') {
            triggerNotification('USER_RESOLVED', parseInt(id));
        } else if (status === 'IN PROGRESS' || status === 'PENDING') {
            triggerNotification('USER_CREATED', parseInt(id));
        }

        res.json({ success: true, message: 'Ticket updated successfully' });
    } catch (err) {
        console.error('🔴 Update Route Error:', err.message);
        res.status(500).json({ success: false, message: 'DB Error', error: err.message });
    }
});


// ✅ เพิ่ม Route สำหรับ Soft Delete
router.put('/soft-delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        // อัปเดต Column is_deleted เป็น 1 (ต้องรัน SQL เพิ่ม Column นี้ก่อนนะครับ)
        await pool.request()
            .input('tid', sql.Int, id)
            .query(`
                UPDATE tickets 
                SET is_deleted = 1 
                WHERE ticket_id = @tid
            `);

        res.json({ success: true, message: 'Ticket moved to trash' });
    } catch (err) {
        console.error('🔴 Backend Soft Delete Error:', err.message);
        res.status(500).json({ success: false, message: 'Database Error' });
    }
});

// ⭐ POST /:id/feedback — User ส่งคะแนนประเมิน แล้วปิดเคส (CLOSED)
router.post('/:id/feedback', async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, actor_id } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. ตรวจสอบว่า Ticket มีอยู่และสถานะเป็น RESOLVED
            const check = await transaction.request()
                .input('ticketId', sql.Int, id)
                .query(`SELECT ticket_id, status, requester_id FROM tickets WHERE ticket_id = @ticketId`);

            if (check.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }

            // ถ้าเคยให้คะแนนแล้ว (CLOSED) ก็อนุญาตให้ผ่านได้
            const ticket = check.recordset[0];

            // 2. Insert Feedback
            await transaction.request()
                .input('ticketId', sql.Int, id)
                .input('userId', sql.Int, actor_id || ticket.requester_id)
                .input('rating', sql.Int, rating)
                .input('comment', sql.NVarChar, comment || '')
                .query(`
                    INSERT INTO ticket_feedback (ticket_id, user_id, rating, comment, created_at)
                    VALUES (@ticketId, @userId, @rating, @comment, GETDATE())
                `);

            // 3. อัปเดตสถานะเป็น CLOSED
            await transaction.request()
                .input('ticketId', sql.Int, id)
                .query(`UPDATE tickets SET status = 'CLOSED', closed_at = GETDATE() WHERE ticket_id = @ticketId`);

            // 4. บันทึก Log
            await transaction.request()
                .input('ticketId', sql.Int, id)
                .input('actorId', sql.Int, actor_id || ticket.requester_id)
                .input('rating', sql.Int, rating)
                .query(`
                    INSERT INTO ticket_logs (ticket_id, action, message, created_at, actor_id)
                    VALUES (@ticketId, 'CLOSED', N'ผู้แจ้งทำการประเมินผลการแก้ไข (${rating} ดาว) และปิดงานเรียบร้อยแล้ว', GETDATE(), @actorId)
                `);

            await transaction.commit();

            res.json({ success: true, message: 'Feedback submitted and ticket closed successfully' });

        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }

    } catch (err) {
        console.error('🔴 Feedback Route Error:', err.message);
        res.status(500).json({ success: false, message: 'Database Error', error: err.message });
    }
});

module.exports = router;
