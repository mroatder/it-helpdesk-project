require('dotenv').config();
const express = require('express');
const cors = require('cors');
const verifyToken = require('./middleware/authMiddleware');

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');
const inventoryRoutes = require('./routes/inventory');
const stockRoutes = require('./routes/stock');
const settingRoutes = require('./routes/settings');
const kbRoutes = require('./routes/knowledgeBase');
const reportRoutes = require('./routes/reports');
const cctvRoutes = require('./routes/cctv');
const path = require('path');
const { startAutoCloseJob } = require('./services/jobService');
const { startPingJob } = require('./services/pingService');

const routeMap = require('./route_map');

const app = express();

// ✅ [FIXED] ดึง Port จาก .env ถ้าไม่มีให้ใช้ 3001 (เพื่อไม่ให้ชนกับ Port 3000 เดิม)
const PORT = process.env.PORT || 3001;

// ✅ [FIXED] ตั้งค่า CORS ให้รองรับทั้งเครื่อง Dev และเครื่อง Server จริง
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000'
];

if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()));
}
if (process.env.APP_FRONTEND_URL) {
    allowedOrigins.push(process.env.APP_FRONTEND_URL.trim());
}

console.log('--- Allowed CORS Origins ---');
console.log(allowedOrigins);
console.log('---------------------------');

app.use(cors({
    origin: function (origin, callback) {
        // อนุญาตถ้า origin อยู่ในรายการ หรือไม่มี origin (เช่นการเรียกโดยตรง/Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS Blocked for origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Static Files (Serving Uploads)
// ดึงไฟล์จาก E:\it-helpdesk-project\uploads
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));
app.use('/api/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', verifyToken, ticketRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/categories', verifyToken, categoryRoutes);
app.use('/api/dashboard', verifyToken, dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/stock', verifyToken, stockRoutes);
app.use('/api/settings', verifyToken, settingRoutes);
app.use('/api/kb', verifyToken, kbRoutes);
app.use('/api/reports', reportRoutes); // ✅ Power BI API (API Key Auth — ไม่ใช้ JWT)
app.use('/api/cctv', verifyToken, cctvRoutes);

app.get('/', (req, res) => {
    res.send('IT Helpdesk API is Running on Port ' + PORT);
});

app.get('/api/docs', (req, res) => {
    res.json({
        service: 'IT Helpdesk API',
        version: '1.0',
        availableRoutes: routeMap
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    // ✅ เริ่มต้น Background Job สำหรับ Auto Close ตั๋ว
    startAutoCloseJob();
    // ✅ เริ่มต้นระบบ Active Ping เช็คสถานะเครื่องลูกทุก 30 นาที
    startPingJob();
});
