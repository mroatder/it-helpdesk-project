const { poolPromise, sql } = require('./db');
async function run() {
    const pool = await poolPromise;
    const res = await pool.request().query("SELECT * FROM department_managers WHERE department_name = 'QA2'");
    console.log('department_managers QA2:', res.recordset);
    
    const res2 = await pool.request().query("SELECT * FROM users WHERE full_name LIKE '%ito%'");
    console.log('users ito:', res2.recordset);
    process.exit();
}
run();
