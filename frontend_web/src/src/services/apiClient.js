// src/services/apiClient.js

import axios from 'axios';
import { useModalStore } from '@/stores/modalStore';
import { useUserStore } from '@/stores/userStore';
import router from '@/router';

// 1. สร้าง base Axios Instance
// ✅ แก้จากเดิมที่มีไอพีและพอร์ตซ้อน
const apiClient = axios.create({
    // ให้ใช้แค่ '/api' เพื่อให้ IIS รับหน้าที่ส่งต่อ (Proxy) ไปยัง Port 3001 เอง
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
// 2. ฟังก์ชันสำหรับตั้งค่า Interceptor
export function setupAxiosInterceptors(piniaInstance) {

    // ตัวแปรสำหรับป้องกันการเรียก Alert ซ้ำซ้อน
    let isAlertActive = false;
    // src/services/apiClient.js

    apiClient.interceptors.response.use(
        (response) => {
            // 🟢 ทุกครั้งที่มีการติดต่อ Server สำเร็จ และ User ล็อกอินอยู่
            // ให้ไปรีเซ็ตเวลาถอยหลัง (Idle Timer) ที่ฝั่ง Client ด้วย
            try {
                const userStore = useUserStore(); // ไม่ต้องใส่ piniaInstance เพราะเรียกหลัง App พร้อมแล้ว
                if (userStore.isLoggedIn) {
                    userStore.resetTimer(false); // รีเซ็ตเวลาในเครื่องเฉยๆ ไม่ต้องส่ง Refresh ไป Server อีกรอบ
                }
            } catch (e) {
                // ปล่อยผ่านถ้า Store ยังไม่พร้อม
            }

            return response;
        },
        async (error) => {
            const originalRequest = error.config;
            const status = error.response ? error.response.status : null;

            // ปกติ 400 คือข้อมูลผิดพลาด/ซ้ำ ไม่ควรไล่ผู้ใช้ออก
            if (status === 401) {

                if (originalRequest.url.includes('/auth/login')) {
                    return Promise.reject(error);
                }

                let userStore;
                try {
                    userStore = useUserStore(piniaInstance);
                } catch (e) {
                    return Promise.reject(error);
                }

                if (!userStore || !userStore.isLoggedIn) {
                    return Promise.reject(error);
                }

                if (isAlertActive) {
                    return Promise.reject(error);
                }

                isAlertActive = true;
                console.error("--- 401 UNAUTHORIZED. LOGGING OUT ---");

                try {
                    await userStore.logoutAndRedirect(true);
                } catch (e) {
                    console.error("Error during token expiry handling:", e);
                } finally {
                    isAlertActive = false;
                }

                if (error && error.response) {
                    error._isHandled = true;
                }

                // Return a pending promise that never resolves/rejects to prevent component-level catch blocks from displaying generic "load error" modals during logout redirection
                return new Promise(() => {});
            }

            // สำหรับ Error 400 หรืออื่นๆ ให้ปล่อยผ่านไปให้หน้าจอ (UI) จัดการ Alert เอง
            return Promise.reject(error);
        }
    );
}

// 3. Export client ตัวหลัก
export default apiClient;