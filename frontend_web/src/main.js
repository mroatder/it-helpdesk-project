// src/main.js

import { createApp } from 'vue'
import { createPinia } from 'pinia' 
import App from './App.vue'
import router from './router'
import './assets/main.css'

import i18n from './i18n'
// ✅ 1. ต้อง Import setup function จาก apiClient.js
import apiClient, { setupAxiosInterceptors } from './services/apiClient' 

const app = createApp(App)
const pinia = createPinia() // 1. สร้าง Pinia Instance

// 2. ติดตั้ง Pinia เข้ากับ Vue App ก่อน
app.use(pinia) 

// ✅ 3. เรียกใช้ setupAxiosInterceptors โดยส่ง Pinia Instance เข้าไป
//    เพื่อให้ Interceptor ของ apiClient.js สามารถเข้าถึง Store ได้
setupAxiosInterceptors(pinia); 

// ✅ 4. สำคัญ: ติดตั้ง Axios Client ที่มี Interceptor ให้เป็น Global Property
//    เพื่อให้ Component สามารถเรียกใช้ด้วย inject('$api') หรือ this.$api ได้
app.config.globalProperties.$api = apiClient;

app.use(router)
app.use(i18n)

app.mount('#app')