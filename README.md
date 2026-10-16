# 🖥️ IT Helpdesk System

ระบบจัดการ IT Helpdesk สำหรับแจ้งปัญหาและติดตามการแก้ไข (Ticket Management System)  
พัฒนาโดยทีม IT ของ **3BMT Co., Ltd.**

---

## 📋 สารบัญ

- [ภาพรวมระบบ](#ภาพรวมระบบ)
- [Tech Stack](#tech-stack)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [ความต้องการของระบบ (Prerequisites)](#ความต้องการของระบบ-prerequisites)
- [การติดตั้งและรัน (Getting Started)](#การติดตั้งและรัน-getting-started)
- [Environment Variables](#environment-variables)
- [ระบบ Authentication (Active Directory)](#ระบบ-authentication-active-directory)
- [Report API (Power BI)](#report-api-power-bi)

---

## ภาพรวมระบบ

ระบบ IT Helpdesk พัฒนาขึ้นเพื่อจัดการคำร้องขอรับบริการ IT ภายในองค์กรแบบครบวงจร ประกอบด้วยฟีเจอร์หลักดังนี้:

| ฟีเจอร์ | รายละเอียด |
|---|---|
| 🎫 **Ticket Management** | สร้าง/ติดตาม/ปิด Ticket การแจ้งปัญหา IT |
| 👤 **AD Authentication** | Login ด้วยบัญชี Windows Domain (Active Directory) |
| 📁 **File Upload** | แนบไฟล์/รูปภาพประกอบ Ticket |
| 📧 **Email Notification** | แจ้งเตือนผ่าน Email อัตโนมัติ |
| 📊 **Report API** | API สำหรับ Power BI ดึงข้อมูล Dashboard |
| 💻 **Asset Monitoring** | ติดตามทรัพย์สินคอมพิวเตอร์ในองค์กร |

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Database:** Microsoft SQL Server (MSSQL)
- **Authentication:** Active Directory (LDAP) + JWT
- **File Upload:** Multer
- **Email:** Nodemailer
- **Process Manager:** PM2

### Frontend
- **Framework:** Vue.js 3 (Composition API)
- **Build Tool:** Vite
- **UI:** Tailwind CSS
- **HTTP Client:** Axios (ผ่าน VITE_API_URL)

---

## โครงสร้างโปรเจกต์

```
it-helpdesk-project/
├── backend_web/                  # Node.js/Express API Server (port 3001)
│   ├── server.js                 # Entry point — HTTP server
│   ├── db.js                     # Database connection (MSSQL)
│   ├── routes/                   # API Route definitions
│   ├── middleware/               # Auth & error handling middleware
│   ├── services/                 # Business logic services
│   ├── utils/                    # Helper utilities
│   ├── batscript/                # Windows Batch scripts
│   ├── .env.example              # ตัวอย่าง config ← ดูไฟล์นี้ก่อน!
│   └── package.json
│
├── frontend_web/                 # Vue.js 3 SPA (port 5173)
│   ├── src/                      # Source code
│   ├── public/                   # Static assets
│   ├── .env.example              # ตัวอย่าง config ← ดูไฟล์นี้ก่อน!
│   └── package.json
│
├── DB/                           # (ไม่รวมในสำเนานี้)
├── project_overview_part1.md     # 📖 รายละเอียดระบบ Part 1
├── project_overview_part2.md     # 📖 รายละเอียดระบบ Part 2
└── README.md                     # ไฟล์นี้
```

---

## ความต้องการของระบบ (Prerequisites)

| ซอฟต์แวร์ | เวอร์ชั่นแนะนำ | หมายเหตุ |
|---|---|---|
| **Node.js** | v18.x หรือใหม่กว่า | https://nodejs.org |
| **npm** | v9.x หรือใหม่กว่า | มาพร้อมกับ Node.js |
| **Microsoft SQL Server** | 2019 / 2022 | หรือ SQL Server Express |
| **Active Directory** | Windows Server | สำหรับ Login ด้วยบัญชีบริษัท |
| **Git** | ล่าสุด | https://git-scm.com |

---

## การติดตั้งและรัน (Getting Started)

### 1. Clone โปรเจกต์

```bash
git clone https://github.com/3bmt-th/it-helpdesk-project.git
cd it-helpdesk-project
```

### 2. ติดตั้ง Backend

```bash
cd backend_web
npm install
```

### 3. ตั้งค่า Environment Variables ของ Backend

```bash
# คัดลอกไฟล์ตัวอย่าง
copy .env.example .env

# จากนั้นแก้ไขไฟล์ .env ด้วย text editor
# กรอกค่าจริงของ DB, AD, JWT, Mail ให้ครบ
```

### 4. ติดตั้ง Frontend

```bash
cd ../frontend_web
npm install
```

### 5. ตั้งค่า Environment Variables ของ Frontend

```bash
copy .env.example .env
# แก้ไข VITE_API_URL ให้ชี้ไปยัง Backend server
```

### 6. รัน Development Server

เปิด Terminal 2 หน้าต่างพร้อมกัน:

**หน้าต่างที่ 1 — Backend:**
```bash
cd backend_web
npm run dev
# Server จะรันที่ http://localhost:3001
```

**หน้าต่างที่ 2 — Frontend:**
```bash
cd frontend_web
npm run dev
# App จะเปิดที่ http://localhost:5173
```

---

## Environment Variables

### Backend (`backend_web/.env`)

| ตัวแปร | ความหมาย | ตัวอย่าง |
|---|---|---|
| `PORT` | พอร์ตของ Backend Server | `3001` |
| `APP_FRONTEND_URL` | URL ของ Frontend | `http://localhost:5173` |
| `ALLOWED_ORIGINS` | CORS Origins ที่อนุญาต | `http://localhost:5173` |
| `AD_URL` | URL ของ Active Directory (LDAP) | `ldap://192.168.1.10` |
| `AD_BASE_DN` | Base DN ของ Domain | `DC=EXAMPLE` |
| `AD_DOMAIN` | ชื่อ Domain | `EXAMPLE` |
| `AD_ADMIN_USER` | บัญชี AD สำหรับ Read | `EXAMPLE\administrator` |
| `AD_ADMIN_PASSWORD` | Password ของ AD Admin | `****` |
| `JWT_SECRET` | Secret key สำหรับ JWT Token | `(random hex string)` |
| `REPORT_API_KEY` | API Key สำหรับ Power BI | `(random hex string)` |

### Frontend (`frontend_web/.env`)

| ตัวแปร | ความหมาย | ตัวอย่าง |
|---|---|---|
| `VITE_API_URL` | URL ของ Backend API | `http://localhost:3001/api` |

---

## ระบบ Authentication (Active Directory)

ระบบนี้ใช้ **Active Directory (LDAP)** สำหรับการ Login แทน username/password ในฐานข้อมูล

- พนักงานใช้ **บัญชี Windows Domain** ของตัวเองในการ Login
- หลัง Login สำเร็จ Backend จะออก **JWT Token** ให้ Frontend ใช้งาน
- ต้องมี **AD Server** ที่เข้าถึงได้จากเครื่อง Server ที่รัน Backend

---

## Report API (Power BI)

ระบบมี API พิเศษสำหรับดึงข้อมูล Ticket เพื่อนำไปแสดงใน Power BI Dashboard:

- ต้องใส่ `REPORT_API_KEY` ใน Header ของ Request ทุกครั้ง
- ดูรายละเอียด Endpoint ได้ที่ `backend_web/routes/`

---

## 🤝 การทำงานร่วมกัน (Git Workflow สำหรับทีม)

เนื่องจากโปรเจกต์นี้มีผู้พัฒนามากกว่า 1 คน เพื่อป้องกันปัญหา "โค้ดทับกัน" (Merge Conflict) หรือโค้ดหาย แนะนำให้ทำตามขั้นตอนดังนี้ครับ:

### กฎเหล็ก: "ดึง (Pull) ก่อน ดัน (Push) เสมอ"

**1. อัปเดตโค้ดล่าสุดก่อนเริ่มงานเสมอ**
เปิด Terminal แล้วพิมพ์คำสั่งนี้ **ก่อนเริ่มเขียนโค้ดทุกครั้ง** เพื่อดึงโค้ดล่าสุดที่คนอื่นอาจจะอัปเดตไว้ลงมาที่เครื่องเรา:
```bash
git pull origin main
```

**2. เซฟงานของเราเข้าเครื่อง (Commit)**
เมื่อเขียนโค้ดฟีเจอร์นั้นๆ เสร็จแล้ว:
```bash
git add .
git commit -m "อธิบายว่าแก้อะไรไป เช่น feat: เพิ่มระบบ Auto Close"
```

**3. ดึงโค้ดเช็คอีกรอบก่อนส่งขึ้น Server**
**ห้าม** `git push` ทันที! ให้ดึงโค้ดลงมาเช็คอีกรอบ เผื่อเพื่อนเพิ่ง Push งานสวนทางไปตอนที่เรากำลังเขียนโค้ด:
```bash
git pull origin main
```
*   **กรณี A (ราบรื่น):** ระบบจะรวมโค้ดให้แบบอัตโนมัติ (อาจจะมีหน้าจอให้กด Save commit message ให้กดบันทึกและปิดได้เลย)
*   **กรณี B (โค้ดชนกัน - Conflict):** ระบบจะแจ้งเตือน ให้เปิดไฟล์ที่มีปัญหาใน VS Code คุณจะเห็นโค้ดของคุณกับของเพื่อน ให้เลือกว่าจะเก็บอันไหนไว้ (Accept Current, Accept Incoming หรือ Accept Both) เมื่อแก้เสร็จให้พิมพ์ `git add .` และ `git commit -m "resolve conflict"` อีกครั้ง

**4. ส่งโค้ดขึ้น GitHub (Push)**
เมื่ออัปเดตและเช็คความเรียบร้อยหมดแล้ว:
```bash
git push origin main
```

*(💡 ทริคโปรเพลเยอร์: หากทำระบบใหญ่ๆ ที่ใช้เวลาหลายวัน แนะนำให้แตก Branch ออกไปทำก่อน `git checkout -b <ชื่อสาขา>` แล้วค่อยมารวมกันทีหลัง จะปลอดภัยที่สุดครับ)*

---

## 📝 หมายเหตุเพิ่มเติม

- **Database Schema:** ไม่รวมในสำเนานี้
- **Project Overview:** อ่านรายละเอียดระบบได้ที่ `project_overview_part1.md` และ `project_overview_part2.md`
- **Upload Files:** ไฟล์ที่ผู้ใช้แนบมากับ Ticket จะถูกเก็บใน `backend_web/uploads/` — **โฟลเดอร์นี้ไม่ได้ถูก track โดย Git**

---

*พัฒนาโดย IT Department — 3BMT Co., Ltd. © 2026*
