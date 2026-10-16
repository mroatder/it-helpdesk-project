import { ref } from 'vue';

const isDark = ref(false); // Default เป็น Light mode

export function useTheme() {
    const getThemeKey = (explicitUsername = null) => {
        if (explicitUsername) return `theme_${explicitUsername}`;

        // ลองเช็คจาก localStorage ที่บันทึกไว้ล่าสุด
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user && user.username) return `theme_${user.username}`;
            } catch (e) {
                console.error("Error parsing user for theme:", e);
            }
        }
        return 'theme'; // กรณีหน้า Login
    };

    const initTheme = (explicitUsername = null) => {
        const key = getThemeKey(explicitUsername);
        const savedTheme = localStorage.getItem(key);
        if (savedTheme) {
            isDark.value = savedTheme === 'dark';
        } else {
            isDark.value = false;
        }
        applyTheme();
    };

    const toggleTheme = () => {
        isDark.value = !isDark.value;
        const key = getThemeKey();
        localStorage.setItem(key, isDark.value ? 'dark' : 'light');
        applyTheme();
    };

    const applyTheme = () => {
        if (isDark.value) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
    };

    return {
        isDark,
        initTheme,
        toggleTheme
    };
}
