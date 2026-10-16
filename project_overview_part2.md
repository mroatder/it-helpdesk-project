# IT Helpdesk Web Application — สรุปโครงสร้างและการทำงาน (ส่วนที่ 2: Frontend)

## 5. Frontend Architecture

### 5.1 Technology Stack

| Library | Version | ใช้ทำอะไร |
|---|---|---|
| Vue 3 | 3.5.x | Framework หลัก (Composition API) |
| Vite | 7.x | Build Tool + Dev Server |
| Pinia | 3.x | State Management |
| Vue Router | 4.x | Routing + Navigation Guard |
| Axios | 1.x | HTTP Client (apiClient.js) |
| TailwindCSS | 3.x | Styling |
| Chart.js + vue-chartjs | 4.x/5.x | กราฟ Dashboard |
| vue-i18n | 9.x | Multi-language (ไทย/อังกฤษ) |
| @heroicons/vue | 2.x | ไอคอน |
| @fontsource/kanit | - | ฟอนต์ภาษาไทย |
| svg-pan-zoom | 3.x | Pan/Zoom สำหรับ Asset Map |
| lodash | 4.x | Utility Functions |

### 5.2 App Initialization (`main.js`)

```
1. createApp(App)
2. createPinia() → app.use(pinia)
3. setupAxiosInterceptors(pinia) — ติดตั้ง 401 Interceptor
4. app.config.globalProperties.$api = apiClient
5. app.use(router)
6. app.use(i18n)
7. app.mount('#app')
```

### 5.3 Root Component (`App.vue`)

- สร้าง `isSidebarCollapsed` state + `toggleSidebar()` → `provide` ให้ทุก component
- Mount `<RouterView />` + `<GlobalModal />`
- `onMounted`: โหลด User จาก localStorage + Init Theme

---

## 6. State Management (Pinia Stores)

### 6.1 `userStore.js` — Authentication & Session

**State:**
- `currentUser` — ข้อมูล User ที่ Login
- `authToken` — JWT Token

**Computed:**
- `userProfile` — ข้อมูล User
- `isLoggedIn` — ตรวจว่า Login อยู่หรือไม่
- `getAuthToken` — Token ปัจจุบัน

**Actions:**
| ฟังก์ชัน | คำอธิบาย |
|---|---|
| `setUser(userData, token)` | เก็บ User + Token → localStorage, เริ่ม Idle Timer, Init Theme |
| `clearUser(isTimeout)` | Logout ผู้ใช้ |
| `logoutAndRedirect(isTimeout)` | ลบ localStorage, แสดง Modal (ถ้า Timeout), Redirect ไป Login |
| `loadUserFromStorage()` | โหลด User จาก localStorage ตอนเปิดแอป |
| `startIdleTimer()` | เริ่มนับเวลาว่างงาน (20 นาที) |
| `stopIdleTimer()` | หยุดนับ |
| `resetTimer()` | รีเซ็ตเวลา (เมื่อมีกิจกรรม) |
| `checkServerSession()` | ต่ออายุ Token กับ Server ทุก 5 นาที |

**Idle Timer Logic:**
1. ฟัง Events: mousedown, mousemove, keypress, scroll, touchstart, click
2. เช็คทุก 15 วินาที → ถ้าเกิน 20 นาทีไม่มี Activity → Logout
3. Sync ข้าม Tab ผ่าน `localStorage.last_activity`
4. ฟัง `storage` event → ถ้า Tab อื่น Logout ก็ Logout ตาม

### 6.2 `ticketStore.js` — Badge Counts

- `pendingCount` — จำนวนตั๋วรออนุมัติ
- `newTicketCount` — จำนวนตั๋วใหม่ (Admin)
- `fetchCounts()` — เรียก API ดึงจำนวน

### 6.3 `modalStore.js` — Global Alert/Confirm

- `alert(message, title, status)` → แสดง Alert แบบ `await` ได้
- `confirm(message, title)` → แสดง Confirm (Yes/No) แบบ `await` ได้
- ใช้ Promise เพื่อรอ User กดปุ่ม

---

## 7. API Client (`apiClient.js`)

- สร้าง Axios Instance กับ `baseURL` จาก ENV (`VITE_API_URL`)
- **Request**: ทุก Request แนบ `Content-Type: application/json`
- **Response Interceptor**:
  - ✅ Success: รีเซ็ต Idle Timer
  - ❌ 401: เรียก `logoutAndRedirect(true)` → แสดง Session Expired Modal → Redirect Login
  - ❌ อื่นๆ: ส่งต่อให้ UI จัดการ

---

## 8. Routing (`router/index.js`)

### Route Map:

| Path | Component | Role | คำอธิบาย |
|---|---|---|---|
| `/` | LoginView | - | หน้า Login |
| `/app/home` | HomeView | ADMIN | Dashboard Admin |
| `/app/user-home` | UserHomeView | ALL | หน้าหลัก User |
| `/app/ticket-create` | TicketCreateView | ALL | สร้างตั๋วใหม่ |
| `/app/my-tickets` | MyTicketsView | ALL | ดูตั๋วของตัวเอง |
| `/app/my-tickets/:id` | MyTicketDetailView | ALL | รายละเอียดตั๋ว (มุม User) |
| `/app/tickets/:id` | TicketDetailView | ADMIN | รายละเอียดตั๋ว (มุม Admin) |
| `/app/knowledge-base` | KnowledgeBaseView | ALL | บทความ FAQ |
| `/app/approvals/pending` | ApprovalListView | ALL | รายการรออนุมัติ |
| `/app/approvals/history` | ApprovalHistoryView | ALL | ประวัติอนุมัติ |
| `/app/approvals/:id` | ApprovalDetailView | ALL | รายละเอียดอนุมัติ |
| `/app/assets` | AssetListView | ADMIN | รายการทรัพย์สิน |
| `/app/assets/:id` | AssetDetailView | ADMIN | รายละเอียดทรัพย์สิน |
| `/app/asset-map` | AssetMapView | ADMIN | แผนที่ Asset (View) |
| `/app/asset-map/admin` | AssetMapAdminView | ADMIN | แผนที่ Asset (Edit) |
| `/app/stock` | StockListView | ADMIN | อะไหล่คงคลัง |
| `/app/admin/users` | UsersView | ADMIN | จัดการ Users |
| `/app/admin/categories` | CategorySettings | ADMIN | จัดการหมวดหมู่ |
| `/app/admin/tickets` | TicketListView | ADMIN | ดูตั๋วทั้งหมด |
| `/app/admin/settings` | SettingsView | ADMIN | ตั้งค่าระบบ |
| `/app/admin/knowledge-base` | KnowledgeBaseAdminView | ADMIN | จัดการ FAQ |

### Navigation Guard:
1. ถ้าเข้า `/app/*` แต่ไม่ได้ Login → Redirect ไป `/` + เก็บ redirect path
2. ถ้า Login แล้วเข้า `/` → Redirect ไป Home ตาม Role (ADMIN→home, USER→user-home)
3. ถ้ามี `meta.roles` → ตรวจสอบว่า Role ตรงกัน

---

## 9. Components สำคัญ

| Component | คำอธิบาย |
|---|---|
| `Sidebar.vue` | เมนูด้านซ้าย, Collapsible, แสดง Badge Count, แยกเมนูตาม Role |
| `GlobalModal.vue` | Modal กลาง Alert/Confirm ใช้ร่วมกับ modalStore |
| `Pagination.vue` | Pagination Component สำหรับตาราง |
| `DrilldownModal.vue` | Modal แสดงรายละเอียดเมื่อคลิกกราฟ Dashboard |
| `TicketTimeline.vue` | แสดง Activity Log ของตั๋วเป็น Timeline |
| `CustomScroll.vue` | Custom Scrollbar |

---

## 10. Theme System (`useTheme.js`)

- เก็บ Theme ต่อ User ใน localStorage: `theme_{username}`
- `initTheme()` — อ่านค่า + Apply CSS class (dark/light) บน `<html>`
- `toggleTheme()` — สลับ Dark/Light
- ใช้ CSS class `dark`/`light` บน `document.documentElement`

---

## 11. Internationalization (i18n)

- ใช้ `vue-i18n` (Composition API mode)
- ภาษาเริ่มต้น: ไทย (`th`), Fallback: อังกฤษ (`en`)
- เก็บภาษาใน localStorage key `lang`
- ไฟล์แปล: `locales/th.json` (57KB), `locales/en.json` (32KB)

---

## 12. Business Logic Flow สรุป

### Flow 1: สร้างตั๋วแบบไม่ต้องอนุมัติ
```
User กรอกฟอร์ม → POST /tickets/create
→ สถานะ: NEW, Step: OPEN
→ ส่ง Email แจ้ง User (USER_CREATED)
→ ส่ง Email แจ้ง IT (IT_NEW_TICKET)
→ IT รับงาน (ACKNOWLEDGED) → PENDING
→ IT ดำเนินการ (PURCHASING/INSTALLING/FIXING) → IN PROGRESS
→ IT แก้ไขเสร็จ (RESOLVED) → ส่ง Email แจ้ง User
→ User ให้คะแนน (Feedback) → CLOSED
   หรือ ไม่ทำอะไร 5 วัน → Auto Close (CLOSED + 5 ดาว)
```

### Flow 2: สร้างตั๋วแบบต้องอนุมัติ
```
User กรอกฟอร์ม + เลือก Approver → POST /tickets/create
→ สถานะ: WAITING APPROVE
→ สร้าง Approval Chain (เรียงตาม level_rank)
→ ส่ง Email แจ้ง Approver คนแรก (MANAGER_APPROVAL)
→ Approver คนแรก APPROVE → ปลดล็อค Approver คนถัดไป
→ ... → Approver คนสุดท้าย APPROVE
→ สถานะ: NEW → ส่ง Email แจ้ง User + IT
→ (ต่อเหมือน Flow 1)

ถ้า Approver ใดปฏิเสธ:
→ สถานะ: REJECTED → จบ
```

### Flow 3: Session Management
```
Login → JWT 20 นาที + Idle Timer 20 นาที
→ ทุกครั้งที่ขยับเมาส์/คลิก → รีเซ็ต Idle Timer
→ ทุก 5 นาที → Refresh Token กับ Server
→ ถ้าว่างงาน 20 นาที → แสดง Modal "Session Expired" → Logout
→ ถ้า Tab อื่น Logout → Tab นี้ Logout ตาม
```

---

## 13. Security Features

| Feature | รายละเอียด |
|---|---|
| **JWT Authentication** | Token 20 นาที, Refresh อัตโนมัติ |
| **Role-Based Access** | ADMIN/USER, adminOnly middleware |
| **Owner Check** | ดูข้อมูลได้เฉพาะของตัวเอง (ยกเว้น Admin) |
| **CORS** | Whitelist Origins จาก ENV |
| **Soft Delete** | ไม่ลบจริง, ใช้ `is_deleted` flag |
| **SMTP Password** | เข้ารหัส/ถอดรหัสก่อนเก็บ DB |
| **File Upload** | จำกัดขนาด (10MB tickets, 5MB assets, 30MB KB) |
| **SQL Injection** | ใช้ Parameterized Queries ทุกที่ |
| **Idle Timeout** | 20 นาทีไม่มี Activity → Logout อัตโนมัติ |
| **Cross-Tab Sync** | Logout พร้อมกันทุก Tab |

---

## 14. Dependencies สรุป

### Backend (`package.json`):
- `express` 5.x — Web Framework
- `mssql` 12.x — SQL Server Driver
- `activedirectory2` — LDAP Authentication
- `jsonwebtoken` — JWT
- `nodemailer` — ส่ง Email
- `multer` 2.x — File Upload
- `cors`, `dotenv`

### Frontend (`package.json`):
- `vue` 3.5.x, `pinia` 3.x, `vue-router` 4.x
- `axios` 1.x, `vue-i18n` 9.x
- `chart.js` 4.x + `vue-chartjs` 5.x + `chartjs-plugin-datalabels`
- `@heroicons/vue`, `@fontsource/kanit`
- `tailwindcss` 3.x, `vite` 7.x
