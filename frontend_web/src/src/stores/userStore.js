import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useModalStore } from './modalStore';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import apiClient from '@/services/apiClient';

const isBrowser = typeof window !== 'undefined';

// === 1. กำหนดค่า IDLE TIMEOUT (20 นาที) ===
const IDLE_TIMEOUT = 20 * 60 * 1000;

const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

export const useUserStore = defineStore('user', () => {

    const { t } = useI18n();

    const currentUser = ref(null);
    const authToken = ref(null);
    let lastRefreshTime = 0;
    let isRefreshingToken = false; // 🔒 ป้องกันการยิง Refresh ซ้ำซ้อน
    let idleTimer = null; // ย้ายมาประกาศใน store scope

    // 🎯 GETTERS (ต้องประกาศก่อน Actions ที่เรียกใช้)
    const userProfile = computed(() => currentUser.value);
    const isLoggedIn = computed(() => !!currentUser.value && !!authToken.value);
    const getAuthToken = computed(() => authToken.value);

    // === 3. ACTIONS (หลัก) ===

    // Action จัดการการ Logout, Alert และ Redirect (คงเดิม)
    const logoutAndRedirect = async (isTimeout = false) => {
        stopIdleTimer();
        if (isBrowser) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_full_name');
        }
        currentUser.value = null;
        authToken.value = null;

        if (isTimeout) {
            console.log("Session Timeout or 401 Detected. Displaying alert.");
            const modal = useModalStore();
            await modal.alert(
                t('alert_messages.session_expired_message'),
                t('alert_messages.session_expired_title'),
                'session_expired'
            );
            router.push({ name: 'login' });
        } else {
            router.push({ name: 'login' });
        }
    };

    // 🟢 resetTimer แบบ Synchronous เพื่อความแม่นยำของเวลา
    const resetTimer = (fromActivity = false, eventName = 'API') => {
        if (!isBrowser || !isLoggedIn.value) return;

        // 🛑 ป้องกันการรัน Timer ในหน้า Login
        if (router.currentRoute.value?.name === 'login') {
            if (idleTimer) stopIdleTimer();
            return;
        }

        // 1. เคลียร์ Timer ทันทีที่มีกิจกรรม
        if (idleTimer) clearTimeout(idleTimer);

        // 2. เริ่มนับถอยหลังใหม่
        idleTimer = setTimeout(() => {
            console.warn(`[Timer] Session timed out after 20 minutes of inactivity.`);
            logoutAndRedirect(true);
        }, IDLE_TIMEOUT);

        // 3. ตรวจสอบและต่ออายุ Token กับ Server (ทำเบื้องหลัง)
        checkServerSession();
    };

    // ตัวกลางขยับเมาส์/กดคีย์
    const handleUserActivity = (e) => {
        resetTimer(true, e.type);
    };

    // 🔵 ฟังก์ชันแยกสำหรับสะกิด Server
    const checkServerSession = async () => {
        if (!isLoggedIn.value || isRefreshingToken) return;

        const now = Date.now();
        // ส่งต่ออายุ Token ทุกๆ 5 นาที
        if (now - lastRefreshTime > 5 * 60 * 1000) {
            isRefreshingToken = true;
            lastRefreshTime = now;

            try {
                console.log("Attempting to extend server session...");
                const res = await apiClient.get('/auth/refresh-token', {
                    headers: { Authorization: `Bearer ${authToken.value}` }
                });

                if (res.data.success) {
                    authToken.value = res.data.token;
                    localStorage.setItem('authToken', res.data.token);
                    console.log("✅ Server Session Extended Successfully.");
                }
            } catch (err) {
                console.error("❌ Failed to extend server session:", err);
            } finally {
                isRefreshingToken = false;
            }
        }
    };

    const stopIdleTimer = () => {
        if (!isBrowser) return;
        if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = null;
        }
        activityEvents.forEach(event => {
            window.removeEventListener(event, handleUserActivity, { capture: true });
        });
        window.__idle_timer_installed = false;
        console.log("[Timer] Idle timer stopped.");
    };

    const startIdleTimer = () => {
        if (!isBrowser || !currentUser.value || !authToken.value) return;

        if (!window.__idle_timer_installed) {
            activityEvents.forEach(event => {
                // ใช้ capture: true เพื่อให้ดักจับได้ชัวร์ที่สุด
                window.addEventListener(event, handleUserActivity, { capture: true });
            });
            window.__idle_timer_installed = true;
        }

        resetTimer(false, 'INITIALIZE');
        console.log("[Timer] 🚀 Idle timer started for 20 minutes.");
    };

    const setUser = (userData, token) => {
        if (isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('authToken', token);
        }
        currentUser.value = userData;
        authToken.value = token;
        startIdleTimer();
    };

    const loadUserFromStorage = () => {
        if (isBrowser) {
            const storedUser = localStorage.getItem('currentUser');
            const storedToken = localStorage.getItem('authToken');
            if (storedUser && storedToken) {
                try {
                    currentUser.value = JSON.parse(storedUser);
                    authToken.value = storedToken;
                } catch (e) {
                    console.error("Failed to parse user data/token from localStorage", e);
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('authToken');
                    currentUser.value = null;
                    authToken.value = null;
                }
            }
        }
    };

    loadUserFromStorage();
    if (currentUser.value && authToken.value) {
        startIdleTimer();
    }

    const clearUser = (isTimeout = false) => {
        if (isTimeout) {
            console.log("Interceptor detected 401. Forcing API call to trigger logout sequence...");
            apiClient.get('/api/auth/verify').catch(() => { });
            return;
        } else {
            logoutAndRedirect(false);
        }
    };

    // 4. (ย้ายไปประกาศข้างบนแล้ว)

    return {
        currentUser, authToken, setUser, clearUser, logoutAndRedirect,
        userProfile, isLoggedIn, loadUserFromStorage, getAuthToken,
        startIdleTimer, stopIdleTimer, resetTimer
    };
});