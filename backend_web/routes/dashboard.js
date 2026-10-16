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
router.use(adminOnly);

// GET: /api/dashboard/overview
router.get('/overview', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { month, year, period } = req.query;

        let dateFilterT = "";
        let dateFilterNormal = "";
        let isMonthlyView = false;

        // 🎯 กำหนดเงื่อนไข Soft Delete เป็นมาตรฐาน
        const softDeleteT = "AND (t.is_deleted = 0 OR t.is_deleted IS NULL)";
        const softDeleteNormal = "WHERE (is_deleted = 0 OR is_deleted IS NULL)";

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // 🎯 1. จัดการเงื่อนไข Filter
        if (period === '6_months') {
            let targetYear = year || currentYear;
            let selectedMonth = month ? parseInt(month.split('-')[1]) : currentMonth;
            let startMonth = selectedMonth <= 6 ? '01' : '07';
            let endMonth = selectedMonth <= 6 ? '06' : '12';
            let endDay = selectedMonth <= 6 ? '30' : '31';

            const startDay = `'${targetYear}-${startMonth}-01 00:00:00'`;
            const endDayFull = `'${targetYear}-${endMonth}-${endDay} 23:59:59'`;

            dateFilterT = `AND t.created_at BETWEEN ${startDay} AND ${endDayFull} ${softDeleteT}`;
            dateFilterNormal = `${softDeleteNormal} AND created_at BETWEEN ${startDay} AND ${endDayFull}`;
        }
        else if (period === '1_year') {
            let targetYear = year || currentYear;
            dateFilterT = `AND YEAR(t.created_at) = ${targetYear} ${softDeleteT}`;
            dateFilterNormal = `${softDeleteNormal} AND YEAR(created_at) = ${targetYear}`;
        }
        else if (month && month !== '') {
            const [y, m] = month.split('-');
            const targetY = parseInt(y);
            const targetM = parseInt(m);
            dateFilterT = `AND YEAR(t.created_at) = ${targetY} AND MONTH(t.created_at) = ${targetM} ${softDeleteT}`;
            dateFilterNormal = `${softDeleteNormal} AND YEAR(created_at) = ${targetY} AND MONTH(created_at) = ${targetM}`;
            isMonthlyView = true;
        }
        else {
            dateFilterT = `AND YEAR(t.created_at) = ${currentYear} AND MONTH(t.created_at) = ${currentMonth} ${softDeleteT}`;
            dateFilterNormal = `${softDeleteNormal} AND YEAR(created_at) = ${currentYear} AND MONTH(created_at) = ${currentMonth}`;
        }

        // 🎯 2. SQL Logic สำหรับคำนวณ Net Response Hours (หักวันหยุด + หยุดนับเมื่อ Ack/Resolved)
        const responseCalcSQL = `
            (
                DATEDIFF(HOUR, t.created_at, ISNULL(resp_logs.first_response_at, ISNULL(t.resolved_at, GETDATE()))) - 
                (ISNULL((SELECT COUNT(*) FROM holidays WHERE holiday_date BETWEEN CAST(t.created_at AS DATE) AND CAST(ISNULL(ISNULL(resp_logs.first_response_at, t.resolved_at), GETDATE()) AS DATE)), 0) * 24)
            )
        `;

        // 🎯 3. OUTER APPLY เพื่อหา Log แรกที่ไม่ใช่การสร้างงาน (นับรวม Acknowledge)
        const firstResponseApply = `
            OUTER APPLY (
                SELECT MIN(created_at) as first_response_at 
                FROM ticket_logs 
                WHERE ticket_id = t.ticket_id 
                AND action != 'CREATED' 
            ) resp_logs
        `;

        // --- 1. KPI Stats ---
        const statsQueryStr = `
            SELECT 
                SUM(CASE WHEN status IN ('OPEN', 'PENDING', 'NEW', 'WAITING APPROVE', 'WAITING_APPROVE') THEN 1 ELSE 0 END) as waiting,
                SUM(CASE WHEN status IN ('INSTALLING', 'IN PROGRESS', 'ASSIGNED', 'APPROVED') THEN 1 ELSE 0 END) as doing,
                SUM(CASE WHEN status IN ('RESOLVED', 'CLOSED', 'COMPLETED', 'REJECTED') THEN 1 ELSE 0 END) as done,
                (SELECT COUNT(*) FROM computers WHERE is_deleted = 0 OR is_deleted IS NULL) as assets
            FROM tickets t
            WHERE 1=1 ${dateFilterT}
        `;
        const statsRequest = await pool.request().query(statsQueryStr);
        const stats = statsRequest.recordset[0] || { waiting: 0, doing: 0, done: 0, assets: 0 };

        // --- 2. Recent Tickets ---
        const recentRequest = await pool.request().query(`
            SELECT TOP 5 t.ticket_id as id, t.ticket_no, t.subject, t.status, t.priority, t.created_at,
            ISNULL(u.full_name, u.username) as requester_name
            FROM tickets t LEFT JOIN users u ON t.requester_id = u.user_id
            WHERE 1=1 ${dateFilterT} ORDER BY t.created_at DESC
        `);

        // --- 3. Charts Data ---
        const trendDateFormat = isMonthlyView ? 'yyyy-MM-dd' : 'yyyy-MM';

        const priorityQuery = await pool.request().query(`SELECT priority, COUNT(*) as count FROM tickets ${dateFilterNormal} GROUP BY priority`);
        const trendQuery = await pool.request().query(`
            SELECT FORMAT(created_at, '${trendDateFormat}') as date, COUNT(*) as count
            FROM tickets ${dateFilterNormal}
            GROUP BY FORMAT(created_at, '${trendDateFormat}') ORDER BY date ASC
        `);
        const statusQuery = await pool.request().query(`SELECT status, COUNT(*) as count FROM tickets ${dateFilterNormal} GROUP BY status`);
        const subjectBreakdownQuery = await pool.request().query(`
            SELECT TOP 10 subject, ticket_type, COUNT(*) as count
            FROM tickets ${dateFilterNormal}
            GROUP BY subject, ticket_type ORDER BY COUNT(*) DESC
        `);
        const typeTrendQuery = await pool.request().query(`
            SELECT FORMAT(created_at, 'yyyy-MM') as date, ticket_type, COUNT(*) as count
            FROM tickets ${dateFilterNormal}
            GROUP BY FORMAT(created_at, 'yyyy-MM'), ticket_type ORDER BY date ASC
        `);

        // 3.6 Response Time Breakdown (including average hours)
        const resolutionQuery = await pool.request().query(`
            SELECT 
                SUM(CASE WHEN NetResponseHours > 48 THEN 1 ELSE 0 END) as over48h,
                SUM(CASE WHEN NetResponseHours <= 48 THEN 1 ELSE 0 END) as under48h,
                ROUND(AVG(NetResponseHours), 2) as avgHours,
                ROUND(MAX(NetResponseHours), 2) as maxHours,
                ROUND(MIN(NetResponseHours), 2) as minHours
            FROM (
                SELECT 
                    t.ticket_id,
                    ${responseCalcSQL} as NetResponseHours
                FROM tickets t
                ${firstResponseApply}
                WHERE 1=1 ${dateFilterT}
            ) as TicketResponseDuration
        `);

        // 3.7 Top 5 Departments
        const deptTicketsQuery = await pool.request().query(`
            SELECT TOP 5 
                ISNULL(u.department, 'N/A') as department, 
                COUNT(*) as count
            FROM tickets t
            LEFT JOIN users u ON t.requester_id = u.user_id
            WHERE 1=1 ${dateFilterT}
            GROUP BY u.department
            ORDER BY count DESC
        `);

        // 3.8 List of tickets with response time > 48 hours
        const over48ListQuery = await pool.request().query(`
            SELECT
                t.ticket_id, t.ticket_no, t.subject, t.created_at,
                ISNULL(u.full_name, u.username) as requester_name,
                ${responseCalcSQL} as NetResponseHours
            FROM tickets t
            LEFT JOIN users u ON t.requester_id = u.user_id
            ${firstResponseApply}
            WHERE 1=1 ${dateFilterT}
            AND ${responseCalcSQL} > 48
            ORDER BY NetResponseHours DESC
        `);

        res.json({
            success: true,
            data: {
                stats,
                charts: {
                    priority: priorityQuery.recordset,
                    trend: trendQuery.recordset,
                    status: statusQuery.recordset,
                    subjectBreakdown: subjectBreakdownQuery.recordset,
                    ticketType: typeTrendQuery.recordset,
                    resolution: resolutionQuery.recordset[0] || { over48h: 0, under48h: 0 },
                    deptTickets: deptTicketsQuery.recordset,
                    resolutionListOver48: over48ListQuery.recordset
                },
                recentTickets: recentRequest.recordset
            }
        });

    } catch (err) {
        console.error('Dashboard Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET: /api/dashboard/drilldown
router.get('/drilldown', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { month, year, period, chartType, chartValue, chartLabel } = req.query;

        let dateFilterT = "";
        let isMonthlyView = false;

        // 🎯 เงื่อนไข Soft Delete เป็นมาตรฐาน
        const softDeleteT = "AND (t.is_deleted = 0 OR t.is_deleted IS NULL)";

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // 🎯 1. จัดการเงื่อนไข Filter ตามเวลา
        if (period === '6_months') {
            let targetYear = year || currentYear;
            let selectedMonth = month ? parseInt(month.split('-')[1]) : currentMonth;
            let startMonth = selectedMonth <= 6 ? '01' : '07';
            let endMonth = selectedMonth <= 6 ? '06' : '12';
            let endDay = selectedMonth <= 6 ? '30' : '31';

            const startDay = `'${targetYear}-${startMonth}-01 00:00:00'`;
            const endDayFull = `'${targetYear}-${endMonth}-${endDay} 23:59:59'`;

            dateFilterT = `AND t.created_at BETWEEN ${startDay} AND ${endDayFull}`;
        }
        else if (period === '1_year') {
            let targetYear = year || currentYear;
            dateFilterT = `AND YEAR(t.created_at) = ${targetYear}`;
        }
        else if (month && month !== '') {
            const [y, m] = month.split('-');
            const targetY = parseInt(y);
            const targetM = parseInt(m);
            dateFilterT = `AND YEAR(t.created_at) = ${targetY} AND MONTH(t.created_at) = ${targetM}`;
            isMonthlyView = true;
        }
        else {
            dateFilterT = `AND YEAR(t.created_at) = ${currentYear} AND MONTH(t.created_at) = ${currentMonth}`;
        }

        const trendDateFormat = isMonthlyView ? 'yyyy-MM-dd' : 'yyyy-MM';

        // 🎯 2. สคริปต์คำนวณ Resolution Time (ใช้ตอนชี้ไปที่กราฟเวลาการตอบสนอง)
        const firstResponseLogQuery = `
            (SELECT MIN(created_at) FROM ticket_logs WHERE ticket_id = t.ticket_id AND action != 'CREATED')
        `;
        const responseCalcSQL = `
            (
                DATEDIFF(HOUR, t.created_at, ISNULL(${firstResponseLogQuery}, ISNULL(t.resolved_at, GETDATE()))) - 
                (ISNULL((SELECT COUNT(*) FROM holidays WHERE holiday_date BETWEEN CAST(t.created_at AS DATE) AND CAST(ISNULL(ISNULL(${firstResponseLogQuery}, t.resolved_at), GETDATE()) AS DATE)), 0) * 24)
            )
        `;

        // 🎯 3. จัดการเงื่อนไขการกรอง (Drilldown) ทับซ้อน
        let drilldownFilter = "";
        const request = pool.request();

        if (chartType === 'priority') {
            drilldownFilter = `AND t.priority = @chartValue`;
            request.input('chartValue', sql.NVarChar, chartValue);
        } else if (chartType === 'status') {
            drilldownFilter = `AND t.status = @chartValue`;
            request.input('chartValue', sql.NVarChar, chartValue);
        } else if (chartType === 'subject') {
            drilldownFilter = `AND t.subject = @chartValue`;
            request.input('chartValue', sql.NVarChar, chartValue);
        } else if (chartType === 'ticketType') {
            drilldownFilter = `AND t.ticket_type = @chartValue`;
            request.input('chartValue', sql.NVarChar, chartValue);

            // 🎯 กราฟ Ticket Type แสดงผลเป็นรายเดือนเสมอ ดังนั้นการ Drilldown ต้องเทียบเป็นรายเดือน (yyyy-MM)
            if (chartLabel) {
                drilldownFilter += ` AND FORMAT(t.created_at, 'yyyy-MM') = @chartLabel`;
                request.input('chartLabel', sql.NVarChar, chartLabel);
            }
        } else if (chartType === 'department') {
            drilldownFilter = `AND ISNULL(u.department, 'N/A') = @chartValue`;
            request.input('chartValue', sql.NVarChar, chartValue);
        } else if (chartType === 'trend') {
            drilldownFilter = `AND FORMAT(t.created_at, '${trendDateFormat}') = @chartValue`;
            request.input('chartValue', sql.NVarChar, chartValue);
        } else if (chartType === 'resolution') {
            if (chartValue === 'under48h') {
                drilldownFilter = `AND ${responseCalcSQL} <= 48`;
            } else if (chartValue === 'over48h') {
                drilldownFilter = `AND ${responseCalcSQL} > 48`;
            }
        }

        const queryStr = `
            SELECT t.ticket_id, t.ticket_no, t.subject, t.status, t.priority, t.created_at, 
                   t.ticket_type, ISNULL(u.department, 'N/A') as department,
                   ISNULL(u.full_name, u.username) as requester_name
            FROM tickets t
            LEFT JOIN users u ON t.requester_id = u.user_id
            WHERE 1=1 ${softDeleteT} ${dateFilterT} ${drilldownFilter}
            ORDER BY t.created_at DESC
        `;

        const drilldownData = await request.query(queryStr);

        res.json({
            success: true,
            data: drilldownData.recordset
        });

    } catch (err) {
        console.error('Dashboard Drilldown Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;