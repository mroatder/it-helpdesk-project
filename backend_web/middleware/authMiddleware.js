// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // 🔴 ต้องเพิ่มบรรทัดนี้ ไม่งั้น process.env.JWT_SECRET จะเป็น undefined

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); 

    if (!token) {
        return res.status(401).json({ message: 'Authorization required.' });
    }

    try {
        // 🔴 ลบ 'your_super_secret_key' ออก เพื่อให้มั่นใจว่าใช้ Key เดียวกันกับตอน Login
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = decoded; 
        next();
    } catch (err) {
        console.error("JWT Auth Error:", err.name); // เพิ่มไว้ดูใน Terminal

        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({ code: 'TOKEN_EXPIRED', message: 'Session Expired. Please log in again.' });
        }
        // Token ผิดปกติ (ไม่ใช่แค่หมดอายุ)
        res.status(403).json({ code: 'TOKEN_INVALID', message: 'Invalid token.' }); 
    }
};

module.exports = verifyToken;