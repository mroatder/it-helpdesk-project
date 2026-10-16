const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
require('dotenv').config();

// ============================================================
// 🔑 API Key Middleware (สำหรับ Power BI / External Tools)
// ใช้แทน JWT เพราะ Power BI ไม่สามารถ Refresh JWT ได้
// วิธีเรียก: GET /api/reports/tickets?api_key=YOUR_KEY
// ============================================================
const REPORT_API_KEY = process.env.REPORT_API_KEY || 'changeme-set-in-env';

const apiKeyAuth = (req, res, next) => {
    const key = req.query.api_key || req.headers['x-api-key'];
    if (!key || key !== REPORT_API_KEY) {
        return res.status(401).json({ success: false, message: 'Invalid or missing API Key.' });
    }
    next();
};

router.use(apiKeyAuth);

// ============================================================
// 📋 1. GET /api/reports/tickets
// Raw Ticket Data ทั้งหมด (JOIN ครบ)
// Power BI ใช้ตารางนี้เป็นหลัก
// ============================================================
router.get('/tickets', async (req, res) => {
    try {
        const pool = await poolPromise;

        // รองรับ Filter วันที่จาก Power BI: ?date_from=2025-01-01&date_to=2025-12-31
        const { date_from, date_to } = req.query;
        let dateFilter = '';
        const request = pool.request();

        if (date_from) {
            dateFilter += ' AND t.created_at >= @date_from';
            request.input('date_from', sql.DateTime, new Date(date_from));
        }
        if (date_to) {
            dateFilter += ' AND t.created_at <= @date_to';
            request.input('date_to', sql.DateTime, new Date(date_to + 'T23:59:59'));
        }

        const result = await request.query(`
            SELECT
                -- === Ticket Core ===
                t.ticket_id,
                t.ticket_no,
                t.subject,
                t.description,
                t.status,
                t.current_step,
                t.priority,
                t.user_urgency,
                t.ticket_type,
                t.created_at,
                t.resolved_at,
                t.closed_at,
                t.due_date,

                -- === Requester ===
                req.user_id         AS requester_id,
                req.full_name       AS requester_name,
                req.email           AS requester_email,
                req.department      AS requester_department,
                req.title           AS requester_title,

                -- === Technician ===
                tech.user_id        AS technician_id,
                tech.full_name      AS technician_name,
                tech.email          AS technician_email,

                -- === Category ===
                mc.cat_id           AS category_id,
                mc.category_name    AS main_category,
                sc.sub_id           AS sub_category_id,
                sc.sub_name         AS sub_category,
                sc.sla_hours        AS sla_hours,

                -- === Feedback ===
                fb.rating           AS feedback_rating,
                fb.comment          AS feedback_comment,
                fb.created_at       AS feedback_at,

                -- === Response Time (ชั่วโมง) ===
                -- เวลาตั้งแต่สร้างตั๋วจนถึง Action แรก (ไม่นับ Auto-create)
                (
                    SELECT MIN(created_at)
                    FROM ticket_logs
                    WHERE ticket_id = t.ticket_id AND action != 'CREATED'
                ) AS first_response_at,
                DATEDIFF(MINUTE,
                    t.created_at,
                    (SELECT MIN(created_at) FROM ticket_logs WHERE ticket_id = t.ticket_id AND action != 'CREATED')
                ) AS first_response_minutes,

                -- === Resolution Time (ชั่วโมง) ===
                CASE
                    WHEN t.resolved_at IS NOT NULL
                    THEN DATEDIFF(MINUTE, t.created_at, t.resolved_at)
                    ELSE NULL
                END AS resolution_minutes,

                -- === SLA Status ===
                CASE
                    WHEN sc.sla_hours IS NOT NULL AND t.resolved_at IS NOT NULL
                        AND DATEDIFF(HOUR, t.created_at, t.resolved_at) > sc.sla_hours
                    THEN 'BREACHED'
                    WHEN sc.sla_hours IS NOT NULL AND t.resolved_at IS NOT NULL
                    THEN 'MET'
                    ELSE 'N/A'
                END AS sla_status,

                -- === Flags ===
                ISNULL(t.is_deleted, 0) AS is_deleted

            FROM tickets t
            LEFT JOIN users req   ON t.requester_id   = req.user_id
            LEFT JOIN users tech  ON t.technician_id  = tech.user_id
            LEFT JOIN sub_categories sc ON t.category_id = sc.sub_id
            LEFT JOIN categories mc    ON sc.cat_id = mc.cat_id
                                      OR (sc.sub_id IS NULL AND t.category_id = mc.cat_id)
            LEFT JOIN ticket_feedback fb ON t.ticket_id = fb.ticket_id

            WHERE (t.is_deleted = 0 OR t.is_deleted IS NULL)
            ${dateFilter}
            ORDER BY t.created_at DESC
        `);

        res.json({
            success: true,
            total: result.recordset.length,
            generated_at: new Date().toISOString(),
            data: result.recordset
        });
    } catch (err) {
        console.error('Reports API /tickets Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================================
// 📋 2. GET /api/reports/ticket-logs
// ประวัติทุก Action ของทุกตั๋ว
// ใช้วิเคราะห์ Workflow, Timeline, Bottleneck
// ============================================================
router.get('/ticket-logs', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { date_from, date_to } = req.query;
        let dateFilter = '';
        const request = pool.request();

        if (date_from) {
            dateFilter += ' AND l.created_at >= @date_from';
            request.input('date_from', sql.DateTime, new Date(date_from));
        }
        if (date_to) {
            dateFilter += ' AND l.created_at <= @date_to';
            request.input('date_to', sql.DateTime, new Date(date_to + 'T23:59:59'));
        }

        const result = await request.query(`
            SELECT
                l.ticket_id,
                t.ticket_no,
                t.status           AS ticket_current_status,
                l.action,
                l.message,
                l.created_at       AS action_at,
                u.full_name        AS actor_name,
                u.role             AS actor_role,
                u.department       AS actor_department
            FROM ticket_logs l
            JOIN tickets t       ON l.ticket_id = t.ticket_id
            LEFT JOIN users u    ON l.actor_id  = u.user_id
            WHERE (t.is_deleted = 0 OR t.is_deleted IS NULL)
            ${dateFilter}
            ORDER BY l.created_at DESC
        `);

        res.json({
            success: true,
            total: result.recordset.length,
            generated_at: new Date().toISOString(),
            data: result.recordset
        });
    } catch (err) {
        console.error('Reports API /ticket-logs Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================================
// 📋 3. GET /api/reports/approvals
// ข้อมูล Approval ทั้งหมด
// ใช้วิเคราะห์ Approval Rate, Rejection Rate, เวลารออนุมัติ
// ============================================================
router.get('/approvals', async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                ta.approval_id,
                ta.ticket_id,
                t.ticket_no,
                t.subject           AS ticket_subject,
                t.created_at        AS ticket_created_at,

                -- Approver
                approver.user_id    AS approver_id,
                approver.full_name  AS approver_name,
                approver.title      AS approver_title,
                approver.department AS approver_department,
                approver.level_rank AS approver_rank,

                -- Requester
                req.full_name       AS requester_name,
                req.department      AS requester_department,

                -- Approval Info
                ta.approval_order,
                ta.status           AS approval_status,
                ta.comment          AS approval_comment,
                ta.created_at       AS requested_at,
                ta.approved_at,

                -- เวลารอการอนุมัติ (นาที)
                CASE
                    WHEN ta.approved_at IS NOT NULL
                    THEN DATEDIFF(MINUTE, ta.created_at, ta.approved_at)
                    ELSE NULL
                END AS waiting_minutes

            FROM ticket_approvals ta
            JOIN tickets t           ON ta.ticket_id   = t.ticket_id
            JOIN users approver      ON ta.approver_id = approver.user_id
            LEFT JOIN users req      ON t.requester_id = req.user_id
            WHERE (t.is_deleted = 0 OR t.is_deleted IS NULL)
            ORDER BY ta.ticket_id, ta.approval_order
        `);

        res.json({
            success: true,
            total: result.recordset.length,
            generated_at: new Date().toISOString(),
            data: result.recordset
        });
    } catch (err) {
        console.error('Reports API /approvals Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================================
// 📋 4. GET /api/reports/assets
// ทรัพย์สินคอมพิวเตอร์ทั้งหมด + RAM + Disk
// ============================================================
router.get('/assets', async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                c.computer_id,
                c.serial_number,
                c.hostname,
                c.manufacturer,
                c.model,
                c.cpu_model,
                c.os_version,
                c.total_ram_gb,
                c.gpu_summary,
                c.office_version,
                c.ip_address,
                c.ip_lan,
                c.ip_wifi,
                c.mac_ethernet,
                c.mac_wifi,
                c.department,
                c.owner_name,
                c.location,
                c.fixed_asset,
                c.start_use_date,
                c.last_updated,
                c.map_floor,

                -- UPS
                u.model_name        AS ups_model,
                u.battery_spec      AS ups_battery_spec,
                u.start_use_date    AS ups_start_date,

                -- Disk (รวมเป็น string)
                (
                    SELECT STRING_AGG(model + ' (' + CAST(size_gb AS VARCHAR) + 'GB)', ', ')
                    FROM computer_disks
                    WHERE computer_serial = c.serial_number
                      AND size_gb > 10
                      AND model NOT LIKE '%USB%'
                ) AS disk_summary

            FROM computers c
            LEFT JOIN ups u ON c.computer_id = u.current_computer_id
            WHERE c.is_deleted = 0 OR c.is_deleted IS NULL
            ORDER BY c.department, c.owner_name
        `);

        res.json({
            success: true,
            total: result.recordset.length,
            generated_at: new Date().toISOString(),
            data: result.recordset
        });
    } catch (err) {
        console.error('Reports API /assets Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================================
// 📋 5. GET /api/reports/stock
// อะไหล่คงคลัง
// ============================================================
router.get('/stock', async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                part_id,
                part_name,
                qty_on_hand,
                min_stock,
                -- วิเคราะห์สถานะ Stock
                CASE
                    WHEN qty_on_hand = 0       THEN 'OUT_OF_STOCK'
                    WHEN qty_on_hand <= min_stock THEN 'LOW_STOCK'
                    ELSE 'OK'
                END AS stock_status,
                (qty_on_hand - min_stock) AS surplus_qty
            FROM spare_parts
            ORDER BY part_name
        `);

        res.json({
            success: true,
            total: result.recordset.length,
            generated_at: new Date().toISOString(),
            data: result.recordset
        });
    } catch (err) {
        console.error('Reports API /stock Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================================
// 📋 6. GET /api/reports/users
// รายชื่อ Users ทั้งหมด (สำหรับ Dimension Table ใน Power BI)
// ============================================================
router.get('/users', async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                user_id,
                username,
                full_name,
                email,
                department,
                title,
                role,
                level_rank,
                is_active,
                created_at,
                last_login
            FROM users
            ORDER BY department, full_name
        `);

        res.json({
            success: true,
            total: result.recordset.length,
            generated_at: new Date().toISOString(),
            data: result.recordset
        });
    } catch (err) {
        console.error('Reports API /users Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
