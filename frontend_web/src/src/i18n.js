import { createI18n } from 'vue-i18n'

// Import ไฟล์ภาษาที่เราสร้างไว้
import th from './locales/th.json'
import en from './locales/en.json'

const i18n = createI18n({
  legacy: false, // ใช้ Composition API mode (แนะนำสำหรับ Vue 3)
  locale: localStorage.getItem('lang') || 'th', // อ่านภาษาจาก LocalStorage ถ้าไม่มีให้ใช้ 'th'
  fallbackLocale: 'en', // ถ้าหาคำแปลไม่เจอให้ใช้ภาษาอังกฤษแทน
  globalInjection: true, // เพื่อให้ใช้ $t() ได้ทั่วทั้งแอพ
  messages: {
    th,
    en
  }
})

export default i18n