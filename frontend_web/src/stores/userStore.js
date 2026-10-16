import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useModalStore } from './modalStore';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import apiClient from '@/services/apiClient';
import { useTheme } from '@/composables/useTheme';

const isBrowser = typeof window !== 'undefined';

// === 1. กำหนดค่า IDLE TIMEOUT (20 นาที) ===
const IDLE_TIMEOUT = 20 * 60 * 1000;

const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

export const useUserStore = defineStore('user', () => {

    const { t } = useI18n();

    const currentUser = ref(null);
    const authToken = ref(null);
    let lastRefreshTime = 0;
    let isRefreshingToken = false;
    let idleTimer = null;
    let lastActivitySync = 0;
    let isShowingTimeoutModal = false; // 🔒 ป้องกันการเปิด Modal ซ้ำซ้อน

    // 🎯 GETTERS (ต้องประกาศก่อน Actions ที่เรียกใช้)
    const userProfile = computed(() => currentUser.value);
    const isLoggedIn = computed(() => !!currentUser.value && !!authToken.value);
    const getAuthToken = computed(() => authToken.value);

    // === 3. ACTIONS (หลัก) ===

    // Action จัดการการ Logout, Alert และ Redirect (คงเดิม)
    const logoutAndRedirect = async (isTimeout = false) => {
        stopIdleTimer();

        // 1. เคลียร์ LocalStorage ทันทีเพื่อให้ Tab อื่นๆ รู้ตัว
        if (isBrowser) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_full_name');
            // localStorage.removeItem('theme'); // Don't clear theme, stay with user preference
        }

        if (isTimeout && isBrowser) {
            if (isShowingTimeoutModal) return;
            isShowingTimeoutModal = true;

            const modal = useModalStore();
            // 🔔 แสดง Modal และรอให้ User กดตกลง
            await modal.alert(
                t('alert_messages.session_expired_message'),
                t('alert_messages.session_expired_title'),
                'session_expired'
            );

            isShowingTimeoutModal = false;
        }

        // 2. เคลียร์ State และ Redirect (ทำหลังกด Modal หรือถ้าไม่ใช่ Timeout)
        currentUser.value = null;
        authToken.value = null;
        router.push('/');
    };

    // 🟢 resetTimer: อัปเดตเวลาล่าสุดที่มีความเคลื่อนไหว
    const resetTimer = (fromActivity = false, eventName = 'API') => {
        if (!isBrowser || !isLoggedIn.value) return;

        // 🛑 ป้องกันการรัน Timer ในหน้า Login
        if (router.currentRoute.value?.name === 'login') {
            stopIdleTimer();
            return;
        }

        const now = Date.now();

        // 1. บันทึกเวลาลง LocalStorage เพื่อให้ทุก Tab เห็นตรงกัน
        // (และ Throttling การเขียนลง Storage ทุก 2 วินาทีเพื่อ Performance)
        if (fromActivity) {
            if (now - lastActivitySync > 2000) {
                localStorage.setItem('last_activity', now.toString());
                lastActivitySync = now;
            }
        } else {
            // กรณีเป็น API หรือ Initial
            localStorage.setItem('last_activity', now.toString());
            lastActivitySync = now;
        }

        // 2. ตรวจสอบและต่ออายุ Token กับ Server (ทำเบื้องหลัง)
        checkServerSession();
    };

    // 🔴 ฟังก์ชันตรวจสอบความเคลื่อนไหว (Run ทุก 15 วินาที)
    const runInactivityCheck = () => {
        if (!isBrowser || !isLoggedIn.value) return;

        const lastActivity = parseInt(localStorage.getItem('last_activity') || '0');
        const token = localStorage.getItem('authToken');
        const now = Date.now();

        // 1. ถ้า Token หายไป (แปลว่าอีก Tabs สั่ง Logout ไปแล้ว) ให้เราออกด้วย
        if (!token) {
            console.warn("[Session] Auth token missing in localStorage. Logging out...");
            logoutAndRedirect(false);
            return;
        }

        // 2. ถ้าเวลาว่างงาน เกิน 20 นาที (IDLE_TIMEOUT)
        if (lastActivity > 0 && (now - lastActivity) >= IDLE_TIMEOUT) {
            console.warn(`[Session] Timeout detected: Inactive for ${Math.round((now - lastActivity) / 1000)}s`);
            logoutAndRedirect(true);
        }
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
                // console.log("Attempting to extend server session...");
                const res = await apiClient.get('/auth/refresh-token', {
                    headers: { Authorization: `Bearer ${authToken.value}` }
                });

                if (res.data.success) {
                    authToken.value = res.data.token;
                    localStorage.setItem('authToken', res.data.token);
                    // console.log("✅ Server Session Extended Successfully.");
                }
            } catch (err) {
                console.error("❌ Failed to extend server session:", err);
            } finally {
                isRefreshingToken = false;
            }
        }
    };

    const handleStorageEvent = (event) => {
        if (event.key === 'authToken' && !event.newValue && isLoggedIn.value) {
            // Detected logout from another tab
            logoutAndRedirect(true);
        }
    };

    const stopIdleTimer = () => {
        if (!isBrowser) return;
        if (idleTimer) {
            clearInterval(idleTimer);
            idleTimer = null;
        }
        activityEvents.forEach(event => {
            window.removeEventListener(event, handleUserActivity, { capture: true });
        });
        window.removeEventListener('storage', handleStorageEvent);
        window.__idle_timer_installed = false;
    };

    const startIdleTimer = () => {
        if (!isBrowser || !currentUser.value || !authToken.value) return;

        if (!window.__idle_timer_installed) {
            activityEvents.forEach(event => {
                window.addEventListener(event, handleUserActivity, { capture: true });
            });
            window.addEventListener('storage', handleStorageEvent);
            window.__idle_timer_installed = true;
        }

        // ใช้ Interval แทน Timeout เพื่อความแม่นยำ (กัน Browser Sleep)
        if (idleTimer) clearInterval(idleTimer);
        idleTimer = setInterval(runInactivityCheck, 15000); // เช็คทุก 15 วินาที

        resetTimer(false, 'INITIALIZE');
    };

    const setUser = (userData, token) => {
        if (isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('authToken', token);
        }
        currentUser.value = userData;
        authToken.value = token;

        // 🔆 โหลด Theme ส่วนตัวของ User คนนี้ทันทีที่ Login
        const { initTheme } = useTheme();
        initTheme(userData.username);

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
            // console.log("Interceptor detected 401. Forcing API call to trigger logout sequence...");
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