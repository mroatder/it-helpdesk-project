const { poolPromise, sql } = require('../db');

/**
 * ฟังก์ชันสำหรับตรวจสอบและปิดตั๋วอัตโนมัติ (Auto Close)
 * หากตั๋วอยู่ในสถานะ RESOLVED นานกว่า 5 วัน (120 ชั่วโมง)
 */
async function processAutoClose() {
    const startTime = new Date().toLocaleString('th-TH');
    console.log(`[${startTime}] --- 🛡️ Running Auto Close Job Check ---`);
    try {
        const pool = await poolPromise;
        if (!pool) {
            console.error('   ❌ Database pool not initialized! Skipping job.');
            return;
        }

        // 1. หาตั๋วที่ RESOLVED เกิน 5 วัน และยังไม่ได้ถูก CLOSED
        // ใช้ UPPER เพื่อป้องกันปัญหา Case Sensitivity
        // ใช้ ISNULL สำหรับ is_deleted เพื่อความแม่นยำ
        const findQuery = `
            SELECT ticket_id, ticket_no, requester_id, status, resolved_at, created_at, is_deleted
            FROM tickets 
            WHERE UPPER(RTRIM(LTRIM(status))) = 'RESOLVED' 
            AND (
                resolved_at < DATEADD(DAY, -5, GETDATE())
                OR (resolved_at IS NULL AND created_at < DATEADD(DAY, -5, GETDATE()))
            )
            AND ISNULL(is_deleted, 0) = 0
        `;

        const results = await pool.request().query(findQuery);
        const ticketsToClose = results.recordset;

        if (ticketsToClose.length === 0) {
            console.log('   ✅ No tickets meet auto-closing criteria today.');
            // ลองเช็คเล่นๆ ว่ามี RESOLVED ตกค้างแต่ติด is_deleted หรือเปล่า (เพื่อ Debug)
            const debugResult = await pool.request().query("SELECT COUNT(*) as count FROM tickets WHERE UPPER(status) = 'RESOLVED' AND is_deleted = 1");
            if (debugResult.recordset[0].count > 0) {
                console.log(`   ℹ️ Note: Found ${debugResult.recordset[0].count} RESOLVED tickets but they are marked as DELETED (is_deleted=1).`);
            }
            return;
        }

        console.log(`   🚀 Found ${ticketsToClose.length} tickets to auto-close.`);

        for (const ticket of ticketsToClose) {
            console.log(`      ⏳ Processing Ticket: ${ticket.ticket_no} (ID: ${ticket.ticket_id})`);
            
            const transaction = new sql.Transaction(pool);
            try {
                await transaction.begin();

                // 2. อัปเดตสถานะเป็น CLOSED และบันทึก closed_at
                await transaction.request()
                    .input('ticketId', sql.Int, ticket.ticket_id)
                    .query(`
                        UPDATE tickets 
                        SET status = 'CLOSED', 
                            current_step = 'CLOSED', 
                            closed_at = GETDATE() 
                        WHERE ticket_id = @ticketId
                    `);

                // 3. บันทึกประวัติ (Log)
                const logMessage = 'ระบบทำการปิดงานอัตโนมัติ เนื่องจากไม่มีการดําเนินการประเมินผลภายใน 5 วันหลังจากแก้ไขเสร็จสิ้น';
                await transaction.request()
                    .input('ticketId', sql.Int, ticket.ticket_id)
                    .input('message', sql.NVarChar, logMessage)
                    .query(`
                        INSERT INTO ticket_logs (ticket_id, action, message, created_at, actor_id) 
                        VALUES (@ticketId, 'CLOSED', @message, GETDATE(), NULL)
                    `);

                // 4. บันทึก Feedback (ถ้าไม่มี requester_id ให้ข้ามขั้นตอนนี้หรือใส่ค่า Default)
                if (ticket.requester_id) {
                    try {
                        await transaction.request()
                            .input('ticketId', sql.Int, ticket.ticket_id)
                            .input('userId', sql.Int, ticket.requester_id)
                            .input('comment', sql.NVarChar, 'Auto-closed by System (No manual feedback)')
                            .query(`
                                INSERT INTO ticket_feedback (ticket_id, user_id, rating, comment, created_at)
                                VALUES (@ticketId, @userId, 5, @comment, GETDATE())
                            `);
                    } catch (fbErr) {
                        console.warn(`      ⚠️ Warning: Failed to insert feedback for ticket ${ticket.ticket_no}. Continuing anyway. Error: ${fbErr.message}`);
                    }
                } else {
                    console.warn(`      ⚠️ Warning: Ticket ${ticket.ticket_no} has no requester_id. Skipping feedback insertion.`);
                }

                await transaction.commit();
                console.log(`      ✅ Auto-closed Successfully: ${ticket.ticket_no}`);
            } catch (err) {
                if (transaction) await transaction.rollback();
                console.error(`      ❌ Transaction Failed for ${ticket.ticket_no}:`, err.message);
            }
        }
        console.log(`--- ✅ Finished Auto Close Job Process [${new Date().toLocaleString('th-TH')}] ---`);

    } catch (err) {
        console.error('--- ❌ Fatal Auto Close Job Error ---', err);
    }
}


/**
 * เริ่มต้นทำงานแบบ Background Job ทุกๆ 1 ชั่วโมง
 */
function startAutoCloseJob() {
    // รันครั้งแรกทันทีที่เปิดเครื่อง
    processAutoClose();

    // ตั้งเวลารันทุก 1 ชั่วโมง (3600000 ms)
    setInterval(processAutoClose, 3600000);
}

module.exports = { startAutoCloseJob };
