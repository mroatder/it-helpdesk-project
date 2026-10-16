module.exports = {
  apps: [
    {
      name: 'it-service-app',          // ชื่อ Process ใน PM2 (ตรงกับที่รันอยู่บนเซิร์ฟเวอร์)
      script: 'server.js',           // ไฟล์หลัก
      cwd: __dirname,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001                    // Port ตาม .env ของโปรเจกต์
      }
    }
  ]
}
