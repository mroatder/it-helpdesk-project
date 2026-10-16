const sql = require('mssql');

require('dotenv').config();

// การตั้งค่าเชื่อมต่อ SQL Server
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',  // ตัวแปรจาก .env หรือ fallback เป็นเครื่อง dev
  database: process.env.DB_NAME || 'IT_Helpdesk',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',  // ปกติ false สำหรับ local dev
    trustServerCertificate: true,
    useUTC: false,
    requestTimeout: 30000,
  },
  port: parseInt(process.env.DB_PORT || 1433),
};

// สร้าง pool connection
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('MSSQL Connected Successfully');
    return pool;
  })
  .catch(err => {
    console.error('MSSQL Connection Failed:', err);
    process.exit(1);  // ถ้าไม่สามารถเชื่อมต่อได้ ให้หยุดโปรแกรม
  });

module.exports = {
  sql,
  poolPromise
};
