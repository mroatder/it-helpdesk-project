const { exec } = require('child_process');
const { poolPromise, sql } = require('../db');

/**
 * ฟังก์ชันสำหรับ Ping ไปยัง IP ที่ระบุ
 */
const pingHost = (ip) => {
    return new Promise((resolve) => {
        if (!ip) return resolve(false);
        // ใช้คำสั่ง ping ของ Windows (-n 1 คือส่ง 1 package, -w 1000 คือรอ 1 วินาที)
        exec(`ping -n 1 -w 1000 ${ip}`, (error, stdout, stderr) => {
            if (error) {
                resolve(false);
            } else {
                // ถ้าในผลลัพธ์มีคำว่า TTL แสดงว่าตอบกลับมา (Online)
                resolve(stdout.includes('TTL='));
            }
        });
    });
};

/**
 * ฟังก์ชันหลักในการไล่ Ping ทุกเครื่องในฐานข้อมูล
 */
const pingAllAssets = async () => {
    console.log(`[${new Date().toLocaleString()}] 🔍 Starting Active Ping for all assets...`);
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT computer_id, ip_address 
            FROM computers 
            WHERE ip_address IS NOT NULL AND ip_address != ''
              AND (is_deleted = 0 OR is_deleted IS NULL)
        `);

        const assets = result.recordset;
        let onlineCount = 0;

        // วนลูป Ping ทีละเครื่อง (เพื่อไม่ให้กิน CPU มากเกินไป)
        for (const asset of assets) {
            const isAlive = await pingHost(asset.ip_address);
            if (isAlive) {
                onlineCount++;
                // ถ้า Ping เจอ ให้มาอัปเดต last_updated ในฐานข้อมูล
                await pool.request()
                    .input('id', sql.Int, asset.computer_id)
                    .query('UPDATE computers SET last_updated = GETDATE() WHERE computer_id = @id');
            }
        }

        console.log(`[${new Date().toLocaleString()}] ✅ Ping Completed. Online: ${onlineCount}/${assets.length}`);
        return { total: assets.length, online: onlineCount };
    } catch (err) {
        console.error('❌ Ping All Assets Error:', err.message);
        throw err;
    }
};

/**
 * ตั้งเวลาทำงานอัตโนมัติทุกๆ 30 นาที
 */
const startPingJob = () => {
    // รันครั้งแรกทันทีที่เปิดเซิร์ฟเวอร์
    pingAllAssets();

    // ตั้ง Interval 30 นาที (30 * 60 * 1000 ms)
    setInterval(pingAllAssets, 30 * 60 * 1000);
};

module.exports = {
    pingHost,
    pingAllAssets,
    startPingJob
};
