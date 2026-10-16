# IT Helpdesk Web Application — สรุปโครงสร้างและการทำงาน (ส่วนที่ 1: Backend)

## 1. ภาพรวมของระบบ (System Overview)

ระบบ **IT Helpdesk** เป็น Web Application สำหรับจัดการงานแจ้งซ่อม/คำร้องขอบริการด้าน IT ภายในองค์กร

| รายการ | รายละเอียด |
|---|---|
| **ชื่อระบบ** | IT Helpdesk / IT Service Desk |
| **ประเภท** | Internal Enterprise Web Application |
| **Backend** | Node.js + Express.js (Port 3001) |
| **Frontend** | Vue 3 + Vite + TailwindCSS + Pinia |
| **Database** | Microsoft SQL Server (MSSQL) — ชื่อ DB: `IT_Helpdesk` |
| **Authentication** | Active Directory (LDAP) + JWT Token (20 นาที) |
| **Email** | Nodemailer (SMTP ตั้งค่าผ่าน DB) |
| **ภาษา** | รองรับ ไทย/อังกฤษ (vue-i18n) |
| **Theme** | Dark/Light Mode (เก็บตาม User) |

---

## 2. โครงสร้างโฟลเดอร์ (Project Structure)

```
e:\it-helpdesk-project\
├── backend_web\           # Backend API (Express.js)
│   ├── server.js          # Entry Point — เริ่ม Express, ตั้ง CORS, Mount Routes
│   ├── db.js              # เชื่อมต่อ MSSQL (Connection Pool)
│   ├── .env               # ค่า Config: PORT, AD, JWT_SECRET
│   ├── middleware\
│   │   └── authMiddleware.js  # ตรวจ JWT Token ทุก Request
│   ├── routes\
│   │   ├── auth.js        # Login (AD Auth) + Refresh Token
│   │   ├── tickets.js     # CRUD ตั๋ว + Approval + Feedback (ใหญ่ที่สุด ~996 บรรทัด)
│   │   ├── users.js       # จัดการ User, Manager, AD Sync
│   │   ├── categories.js  # หมวดหมู่ปัญหา (Main/Sub)
│   │   ├── dashboard.js   # ข้อมูลสถิติ + Drilldown
│   │   ├── inventory.js   # ระบบ Asset/คอมพิวเตอร์ + Asset Map
│   │   ├── stock.js       # อะไหล่คงคลัง (spare_parts)
│   │   ├── settings.js    # ตั้งค่า SMTP, วันหยุด
│   │   └── knowledgeBase.js # บทความ FAQ
│   ├── services\
│   │   ├── mailService.js # ส่ง Email แจ้งเตือนอัตโนมัติ
│   │   └── jobService.js  # Background Job ปิดตั๋วอัตโนมัติ
│   └── utils\
│       └── emailTemplates.js # HTML Template อีเมล (3 แบบ)
│
├── frontend_web\          # Frontend (Vue 3 + Vite)
│   ├── src\
│   │   ├── main.js        # Entry Point — Mount App, Pinia, Router, i18n
│   │   ├── App.vue        # Root Component + Sidebar State + GlobalModal
│   │   ├── i18n.js        # ตั้งค่า vue-i18n (th/en)
│   │   ├── router\index.js    # Route ทั้งหมด + Navigation Guard
│   │   ├── stores\            # Pinia State Management
│   │   │   ├── userStore.js   # Auth State, Idle Timer, Token Refresh
│   │   │   ├── ticketStore.js # นับจำนวน Pending/New
│   │   │   └── modalStore.js  # Global Alert/Confirm Modal
│   │   ├── services\
│   │   │   └── apiClient.js   # Axios Instance + 401 Interceptor
│   │   ├── composables\
│   │   │   └── useTheme.js    # Dark/Light Toggle (per user)
│   │   ├── components\        # Shared Components
│   │   │   ├── Sidebar.vue, GlobalModal.vue, Pagination.vue
│   │   │   ├── DrilldownModal.vue, TicketTimeline.vue
│   │   │   └── CustomScroll.vue
│   │   ├── views\             # หน้าจอทั้งหมด
│   │   │   ├── LoginView.vue, HomeView.vue (Admin), UserHomeView.vue
│   │   │   ├── tickets\   — TicketCreateView, TicketListView, TicketDetailView
│   │   │   │               — ApprovalListView, ApprovalDetailView, ApprovalHistoryView
│   │   │   ├── user\      — MyTicketsView, MyTicketDetailView, KnowledgeBaseView
│   │   │   ├── admin\     — UsersView, CategorySettings, SettingsView, KnowledgeBaseAdminView
│   │   │   ├── assets\    — AssetListView, AssetDetailView, AssetMapView, AssetMapAdminView
│   │   │   └── stock\     — StockListView
│   │   └── locales\       # ไฟล์แปลภาษา (th.json, en.json)
│   └── .env               # VITE_API_URL=http://localhost:3001/api
│
├── uploads\               # ไฟล์แนบ (tickets/, asset-map/, kb/)
└── DB\                    # Backup ฐานข้อมูล (db2.bak)
```

---

## 3. Backend — รายละเอียดแต่ละส่วน

### 3.1 Database Connection (`db.js`)

- ใช้ `mssql` library เชื่อมต่อ SQL Server ผ่าน **Connection Pool**
- Server: `localhost\SQLEXPRESS`, DB: `IT_Helpdesk`, Port: 1433
- ถ้าเชื่อมต่อไม่ได้จะ `process.exit(1)` ทันที

### 3.2 Server Entry Point (`server.js`)

**การทำงานเมื่อเริ่มต้น:**
1. โหลด `.env` ด้วย `dotenv`
2. ตั้งค่า CORS — อ่าน Allowed Origins จาก ENV + localhost
3. ตั้ง Body Parser ขนาด 50MB
4. Serve Static Files จาก `../uploads`
5. Mount Routes ทั้งหมด (auth, tickets, users, categories, dashboard, inventory, stock, settings, kb)
6. เริ่ม Background Job `startAutoCloseJob()`

**Route Mounting:**
| Path | Route File | Auth Required |
|---|---|---|
| `/api/auth` | auth.js | ❌ (Login ไม่ต้อง Token) |
| `/api/tickets` | tickets.js | ✅ verifyToken |
| `/api/users` | users.js | ✅ verifyToken |
| `/api/categories` | categories.js | ✅ verifyToken |
| `/api/dashboard` | dashboard.js | ✅ verifyToken |
| `/api/inventory` | inventory.js | ⚠️ บางส่วนไม่ต้อง (Script Update) |
| `/api/stock` | stock.js | ✅ verifyToken |
| `/api/settings` | settings.js | ✅ verifyToken |
| `/api/kb` | knowledgeBase.js | ✅ verifyToken |

### 3.3 Authentication (`authMiddleware.js` + `routes/auth.js`)

**Middleware (`authMiddleware.js`):**
- ดึง Token จาก Header `Authorization: Bearer <token>`
- Verify ด้วย `jwt.verify()` + `JWT_SECRET` จาก ENV
- ถ้า Token หมดอายุ → 401 `TokenExpiredError`
- ถ้า Token ไม่ถูกต้อง → 401 `Invalid token`

**Login Flow (`POST /api/auth/login`):**
1. รับ `username`, `password` จาก Body
2. **AD Authentication** — ใช้ `activedirectory2` ตรวจสอบกับ LDAP Server
3. **ดึงข้อมูล AD** — email, displayName, title, department จาก AD
4. **Sync แผนก** — หาหรือสร้าง `dept_id` ในตาราง `departments` (ป้องกัน Race Condition)
5. **กำหนด Role** — ถ้าแผนกมีคำว่า "IT" หรือ username = "administrator" → ADMIN, อื่นๆ → USER
6. **Sync User** — INSERT หรือ UPDATE ตาราง `users`
7. **ตรวจสอบ is_active** — ถ้าถูก Disable → 403
8. **สร้าง JWT** — Payload: `{id, username, role}`, หมดอายุ 20 นาที
9. **ส่งกลับ** — token + user profile

**Refresh Token (`GET /api/auth/refresh-token`):**
- ต้อง Login อยู่แล้ว (verifyToken)
- สร้าง JWT ใหม่จาก payload เดิม (ต่ออายุ 20 นาที)

### 3.4 Ticket System (`routes/tickets.js`) — หัวใจของระบบ

#### สถานะตั๋ว (Ticket Status Flow):
```
NEW → PENDING → IN PROGRESS → RESOLVED → CLOSED
                                    ↑          ↑
                                  REOPEN    Auto Close (5 วัน)
                                    
WAITING APPROVE → APPROVED → NEW (ส่งต่อ IT)
                → REJECTED (จบ)
```

#### Ticket Workflow Steps (current_step):
`OPEN → ACKNOWLEDGED → PURCHASING → RECEIVED → INSTALLING/FIXING → RESOLVED → CLOSED`

#### API Endpoints:

| Method | Path | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| GET | `/approvals/pending/:userId` | Owner/Admin | ดูรายการรออนุมัติ |
| GET | `/approvals/history/:userId` | Owner/Admin | ดูประวัติการอนุมัติ |
| GET | `/all` | **Admin Only** | ดูตั๋วทั้งหมด |
| GET | `/my-tickets/:userId` | Owner/Admin | ดูตั๋วของตัวเอง |
| GET | `/:id` | Owner/Tech/Admin/Approver | ดูรายละเอียดตั๋ว + ไฟล์แนบ |
| GET | `/:id/approval-chain` | Related Users | ดูลำดับการอนุมัติ |
| GET | `/:id/approval` | Approver/Owner/Admin | ดูข้อมูลการอนุมัติที่รอ |
| GET | `/:id/logs` | Owner/Tech/Admin/Approver | ดู Activity Timeline |
| POST | `/create` | All Users | สร้างตั๋วใหม่ (รองรับไฟล์แนบ) |
| POST | `/:id/logs` | Admin/Tech | อัปเดต Step + ส่ง Email |
| POST | `/:id/approve` | Approver | อนุมัติ/ปฏิเสธคำร้อง |
| POST | `/:id/feedback` | Owner | ให้คะแนน + ปิดงาน |
| PUT | `/update/:id` | Admin | แก้ไขสถานะ/ลำดับ/ประเภท |
| PUT | `/soft-delete/:id` | Admin | Soft Delete ตั๋ว |

#### การสร้างตั๋ว (POST `/create`):
1. สร้าง Ticket No: `TB{ปีพุทธ2หลัก}{เดือน}{Running 3 หลัก}` เช่น `TB6904001`
2. ถ้ามี Approver → สถานะ `WAITING APPROVE`, สร้าง Approval Chain
3. ถ้าไม่มี → สถานะ `NEW`, ส่ง Email แจ้ง User + IT
4. Approval Chain เรียงตาม `level_rank` (Rank มาก=ตำแหน่งล่าง อนุมัติก่อน)
5. คนแรก = `PENDING`, คนถัดไป = `BLOCKED` (Sequential Approval)
6. บันทึกไฟล์แนบลง `ticket_attachments` (สูงสุด 5 ไฟล์, 10MB)

#### การอนุมัติ (POST `/:id/approve`):
- **APPROVED**: ปลดล็อคคนถัดไปเป็น PENDING → ถ้าเป็นคนสุดท้าย → ตั๋วเป็น `NEW` + แจ้ง IT
- **REJECTED**: ตั๋วเป็น `REJECTED` ทันที

### 3.5 User Management (`routes/users.js`)

| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/list` | ดึง User ทั้งหมด (Admin) + Manager IDs |
| GET | `/profile/:userId` | ดูโปรไฟล์ (เฉพาะตัวเอง/Admin) |
| GET | `/search?q=` | ค้นหา User จากชื่อ/username |
| GET | `/technicians` | ดึง IT Staff ที่ Active |
| GET | `/managers` | ดึง Manager ทั้งหมด |
| GET | `/assigned-managers/:userId` | ดึง Manager ที่ผูกกับ User |
| GET | `/access-approvers` | ดึง Manager Rank 1,3,4 |
| GET | `/ad-search?q=` | ค้นหา User จาก AD |
| POST | `/update` | แก้ไข Role/Manager/Rank (Admin) |
| POST | `/department-manager` | กำหนด Manager ประจำแผนก |
| POST | `/bulk-update-managers` | Bulk Update Manager |
| POST | `/import` | Import User จาก AD เข้า DB |
| POST | `/sync-ad` | Sync ข้อมูล AD ทั้งหมด |

**Manager System:**
- ตาราง `user_managers`: ผูก Manager เฉพาะรายคน
- ตาราง `department_managers`: ผูก Manager ประจำแผนก
- เมื่อดึง Manager ของ User จะ UNION ทั้ง 2 ตาราง

### 3.6 Dashboard (`routes/dashboard.js`) — Admin Only

**GET `/api/dashboard/overview`:**
- รับ Filter: `month`, `year`, `period` (6_months, 1_year)
- คืนข้อมูล: KPI Stats, Recent Tickets, Charts Data
- Charts: Priority, Trend, Status, Subject Breakdown, Ticket Type, Resolution Time, Top Departments
- คำนวณ Response Time: หัก วันหยุด (holidays table) ออก

**GET `/api/dashboard/drilldown`:**
- Drill-down ตาม chartType: priority, status, subject, ticketType, department, trend, resolution

### 3.7 Inventory/Asset (`routes/inventory.js`)

| Method | Path | Auth | คำอธิบาย |
|---|---|---|---|
| POST | `/update` | ❌ | Script ส่งข้อมูลเครื่อง (ไม่ต้อง Token) |
| GET | `/` | Admin | ดึง Asset ทั้งหมด |
| GET | `/:id` | Admin | รายละเอียด Asset (RAM, Disk, Software, UPS) |
| GET | `/map` | Admin | ดึง Asset ที่มีพิกัดบนแผนที่ |
| PUT | `/:id/map` | Admin | อัปเดตตำแหน่งบน Map |
| PUT | `/:id/assign` | Admin | กำหนดเจ้าของ + UPS |
| DELETE | `/:id` | Admin | Soft Delete |
| POST | `/:id/upload-image` | Admin | อัปโหลดรูป Asset |

**ตารางที่เกี่ยวข้อง:** `computers`, `computer_rams`, `computer_disks`, `computer_software`, `ups`, `ups_maintenance_logs`

### 3.8 อื่นๆ

**Categories** — CRUD หมวดหมู่หลัก (`categories`) + ย่อย (`sub_categories`) พร้อม SLA Hours

**Stock** — CRUD อะไหล่ (`spare_parts`) — Admin Only

**Settings** — SMTP Config (app_settings), Holiday Management (holidays), Test SMTP

**Knowledge Base** — CRUD บทความ FAQ + อัปโหลดรูป

### 3.9 Services

**Mail Service (`mailService.js`):**
- อ่าน SMTP Config จาก `app_settings` table
- 3 Template: `itNewTicketTemplate`, `managerApprovalTemplate`, `userStatusUpdateTemplate`
- Events: `IT_NEW_TICKET`, `MANAGER_APPROVAL`, `USER_CREATED`, `USER_UPDATED`, `USER_RESOLVED`

**Job Service (`jobService.js`):**
- Background Job รันทุก 1 ชั่วโมง
- ปิดตั๋ว `RESOLVED` ที่เกิน 5 วัน โดยอัตโนมัติ → `CLOSED` + Feedback 5 ดาว
- ใช้ Transaction ป้องกันข้อมูลเสียหาย

---

## 4. Database Tables (สรุปจาก Code)

| ตาราง | คำอธิบาย |
|---|---|
| `users` | ผู้ใช้ (user_id, username, full_name, email, role, dept_id, department, title, level_rank, is_active) |
| `departments` | แผนก (dept_id, dept_name) |
| `user_managers` | ความสัมพันธ์ User-Manager (user_id, manager_id) |
| `department_managers` | Manager ประจำแผนก (department_name, manager_id) |
| `tickets` | ตั๋วงาน (ticket_id, ticket_no, subject, description, status, current_step, priority, user_urgency, ticket_type, requester_id, technician_id, category_id, created_at, resolved_at, closed_at, is_deleted) |
| `ticket_logs` | ประวัติการดำเนินการ (ticket_id, actor_id, action, message, created_at) |
| `ticket_approvals` | ลำดับอนุมัติ (ticket_id, approver_id, status, approval_order, comment, approved_at) |
| `ticket_attachments` | ไฟล์แนบ (ticket_id, file_name, file_path, file_type, file_size) |
| `ticket_feedback` | คะแนนประเมิน (ticket_id, user_id, rating, comment) |
| `categories` | หมวดหมู่หลัก (cat_id, category_name, is_active) |
| `sub_categories` | หมวดหมู่ย่อย (sub_id, cat_id, sub_name, sla_hours, is_active) |
| `computers` | ทรัพย์สินคอมพิวเตอร์ (computer_id, serial_number, hostname, specs, map_floor/x/y, owner_name, ...) |
| `computer_rams` | RAM ของเครื่อง |
| `computer_disks` | Disk ของเครื่อง |
| `computer_software` | Software ที่ติดตั้ง |
| `ups` | เครื่องสำรองไฟ |
| `ups_maintenance_logs` | ประวัติซ่อม UPS |
| `spare_parts` | อะไหล่คงคลัง |
| `app_settings` | ตั้งค่าระบบ (key-value) |
| `holidays` | วันหยุด (holiday_date, description) |
| `knowledge_base` | บทความ FAQ |
