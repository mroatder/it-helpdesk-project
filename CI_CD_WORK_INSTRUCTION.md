# Work Instruction (WI): การติดตั้ง CI/CD Pipeline ด้วย GitHub Actions บน Windows Server (Self-hosted)

เอกสารนี้จัดทำขึ้นเพื่อเป็นคู่มือ (Work Instruction) สำหรับ Developer และ AI Assistant ในการนำไปตั้งค่าระบบ CI/CD ให้กับโปรเจกต์อื่นๆ ที่มีโครงสร้างคล้ายคลึงกัน (Frontend + Backend Node.js วางบนเซิร์ฟเวอร์บริษัท)

---

## 🏗 ภาพรวมสถาปัตยกรรม (Architecture Overview)
- **CI (Continuous Integration):** รันบน `ubuntu-latest` (GitHub Cloud) เพื่อทำการเช็คโค้ด ติดตั้ง dependencies และทดสอบ Build ฝั่ง Frontend ว่าโค้ดไม่มี Error ก่อนที่จะส่งไปเซิร์ฟเวอร์จริง
- **CD (Continuous Deployment):** รันบน `self-hosted` (Windows Server ของบริษัท) รับหน้าที่ก๊อปปี้ไฟล์โค้ดที่ผ่านการทดสอบแล้ว นำไปวางในโฟลเดอร์ Production (เช่น IIS) และจัดการ Restart API ด้วย PM2

---

## 🛠 ขั้นตอนที่ 1: การติดตั้ง Self-Hosted Runner บน Windows Server เป็น Service

การตั้งค่า Runner ให้รันเป็น Background Service เป็นสิ่งที่สำคัญมาก เพื่อให้การ Deploy เป็นไปโดยอัตโนมัติแม้ว่าจะไม่ได้ล็อกอินหรือเปิดหน้าต่าง Command ค้างไว้

1. เข้าไปที่โปรเจกต์บนเว็บ GitHub > **Settings** > **Actions** > **Runners**
2. กด **New self-hosted runner** เลือก **Windows**
3. ล็อกอินเข้า Windows Server ด้วยบัญชีหลักของระบบ (เช่น `administrator`)
4. สร้างโฟลเดอร์ `C:\actions-runner` (หรือที่ไดรฟ์อื่น) แล้วดาวน์โหลดแตกไฟล์ตามคำสั่งในหน้าเว็บ
5. รันคำสั่ง Configure (เอาจากข้อ 2 ในหน้าเว็บ):
   ```powershell
   # กรณีลงทะเบียนใช้เฉพาะโปรเจกต์นี้ (Repository-level)
   .\config.cmd --url https://github.com/<owner>/<repo> --token <YOUR_TOKEN>

   # กรณีต้องการให้ Runner ตัวเดียวแชร์ใช้ได้ทุกโปรเจกต์ (Organization-level) ⭐ แนะนำ
   .\config.cmd --url https://github.com/<your-org> --token <ORG_TOKEN>
   ```
6. **[สำคัญมาก]** เมื่อมีคำถามว่า `Would you like to run the runner as service? (Y/N)` ให้พิมพ์ **`Y`** แล้วกด Enter
7. **[สำหรับกรณีติดตั้งในระดับ Org]** ตรวจสอบให้แน่ใจว่าได้เปิดใช้งานสิทธิ์การ Deploy ใน Organization Settings -> Actions -> Runners ของ Organization แล้ว เพื่อให้ Runner สามารถหยิบงานจาก Repositories ที่ต้องการได้
8. **[สำคัญมาก - การแก้บั๊ก PM2]** 
   - ค่าเริ่มต้นของ Service จะรันด้วยชื่อ `NT AUTHORITY\NETWORK SERVICE` ซึ่งจะทำให้รันคำสั่ง `pm2 restart` ไม่ได้เพราะ PM2 ผูกติดกับ User 
   - ให้เข้าไปแก้สิทธิ์โดยเปิดโปรแกรม **`services.msc`** ใน Windows
   - ค้นหา **`GitHub Actions Runner (<repo-name>)`** > คลิกขวา **Properties**
   - ไปที่แท็บ **Log On** > เลือก **This account**
   - ระบุ User และ Password ของเครื่อง (เช่น `.\administrator`) แล้วกด OK
   - คลิกขวาที่ Service แล้วเลือก **Restart**

---

## 🛠 ขั้นตอนที่ 2: ตั้งค่า PM2 ให้รองรับการทำงานกับ CI/CD (ฝั่ง Backend)

ในโฟลเดอร์ `backend_web` ควรมีไฟล์ `ecosystem.config.js` เพื่อให้คำสั่ง restart มีความสม่ำเสมอ:

```javascript
module.exports = {
  apps: [
    {
      name: 'My-App-API',          // ชื่อ Process ใน PM2
      script: 'server.js',         // ไฟล์หลัก
      cwd: __dirname,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000                 // ระบุ Port ที่รัน
      }
    }
  ]
}
```

---

## 🛠 ขั้นตอนที่ 3: การสร้าง Workflow File (`ci.yml`)

สร้างไฟล์ไว้ที่ `.github/workflows/ci.yml` ของโปรเจกต์ (นี่คือเทมเพลตมาตรฐานที่คุณหรือ AI สามารถนำไปก๊อปปี้ใช้ได้เลย โดยเปลี่ยนแค่ตำแหน่งโฟลเดอร์และชื่อแอป)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main # ทริกเกอร์อัตโนมัติเมื่อมีการ Push โค้ดเข้า branch main

# สามารถกำหนดพาร์ทเซิร์ฟเวอร์ตรงนี้ได้เลย (ต้องใช้ \\ สำหรับ Windows Path)
env:
  FRONTEND_DEPLOY_PATH: 'E:\deploy\frontend'
  BACKEND_DEPLOY_PATH: 'E:\deploy\backend'

jobs:
  # ==========================================
  # เฟสที่ 1: CI (Build & Test บน GitHub Cloud)
  # ==========================================
  build-and-test:
    name: Build & Test on GitHub Cloud
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js for Frontend
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
          cache-dependency-path: frontend_web/package.json

      - name: Install Frontend Dependencies
        run: |
          cd frontend_web
          npm ci

      - name: Build Frontend (Test)
        run: |
          cd frontend_web
          # (ตรงนี้ใส่คำสั่ง echo ".env" ถ้าต้องการจำลองตัวแปร)
          npm run build

  # ==========================================
  # เฟสที่ 2: CD (Deploy ขึ้น Windows Server)
  # ==========================================
  deploy:
    name: Deploy to Corporate Server
    needs: build-and-test
    runs-on: self-hosted # วิ่งไปรันที่ Windows Server

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      # 1. Deploy Frontend (สร้าง .env ชั่วคราว และ Build)
      - name: Build & Deploy Frontend
        shell: powershell
        run: |
          cd frontend_web
          npm ci
          
          # [Best Practice] ใช้ Set-Content แทนคำสั่ง echo > เพื่อป้องกันบั๊ก UTF-16 ของ PowerShell
          # หากโปรเจกต์ต้องการไฟล์ .env.production ให้ใช้คำสั่งนี้สร้างไฟล์ก่อน Build
          Set-Content -Path .env.production -Value "VITE_API_BASE_URL=http://api.example.local:3000" -Encoding utf8
          npm run build

          # ลบไฟล์เก่าออกทั้งหมด
          Remove-Item -Path "${{ env.FRONTEND_DEPLOY_PATH }}\*" -Recurse -Force -ErrorAction SilentlyContinue

          # คัดลอกไฟล์ Build (dist)
          Copy-Item -Path "dist\*" -Destination "${{ env.FRONTEND_DEPLOY_PATH }}\" -Recurse -Force

      # 2. Deploy Backend (ก๊อปปี้ไฟล์ และ Restart PM2)
      - name: Copy & Deploy Backend
        shell: powershell
        run: |
          # [Best Practice] ห้ามใช้ Copy-Item -Exclude node_modules เพราะจะทำให้ค้าง 10 นาที
          # ให้ใช้ robocopy /E /XD แทน เพื่อความเร็วฟ้าแลบ (ไม่ถึง 5 วินาที)
          robocopy "backend_web" "${{ env.BACKEND_DEPLOY_PATH }}" /E /XD "node_modules" "logs" "upload"
          if ($LASTEXITCODE -ge 8) { throw "Robocopy failed with exit code $LASTEXITCODE" }
          $global:LASTEXITCODE = 0

          cd "${{ env.BACKEND_DEPLOY_PATH }}"
          npm install --production
          
          # สั่ง Restart PM2
          pm2 restart My-App-API --update-env
          if ($LASTEXITCODE -ne 0) {
              pm2 start ecosystem.config.js --env production
          }
```

---

## 🚨 ข้อควรระวังและการแก้ปัญหาที่พบบ่อย (Troubleshooting & Best Practices)

1. **Deploy ค้างนาน 10 นาทีตอน Deploy Backend**
   - **สาเหตุ:** การใช้คำสั่ง `Copy-Item -Recurse -Exclude node_modules` ใน PowerShell มีบั๊กก๊อปปี้แบบเจาะลึก
   - **วิธีแก้:** บังคับให้ใช้ **`robocopy`** ทุกครั้งที่มีการก๊อปปี้ Backend และใช้พารามิเตอร์ `/E /XD "node_modules"` เสมอ
2. **ตัวแปร .env กลายเป็น `undefined` หลังนำขึ้น Server**
   - **สาเหตุ:** การใช้คำสั่ง `echo "VAR=1" > .env` ใน Windows PowerShell จะได้ไฟล์เข้ารหัสแบบ **UTF-16** ซึ่ง Node.js อ่านไม่ได้!
   - **วิธีแก้:** ต้องใช้คำสั่ง **`Set-Content -Path .env -Value "..." -Encoding utf8`** ใน Windows เสมอ
3. **PM2 ฟ้องว่า "Process not found" หรือค้างตอน Start**
   - **สาเหตุ:** ตัว Runner service ของ Windows ถูกตั้งค่าให้รันด้วย `NETWORK SERVICE` ซึ่งเป็นคนละสิทธิ์กับแอดมินที่สร้างแอป PM2 ทิ้งไว้แต่แรก
   - **วิธีแก้:** ต้องแก้ `Log On` ในหน้าตั้งค่า `services.msc` ตามที่ได้กล่าวไว้ใน "ขั้นตอนที่ 1"
4. **ทำไมต้องเอา Build Frontend ไปไว้ใน CD ด้วย?**
   - เพราะบางโปรเจกต์ (อย่างเช่น Vite) จะคอมไพล์โค้ด Environment variable ฝังลงไปใน Static file เลย ดังนั้นการ Build บน Runner เครื่องเซิร์ฟเวอร์จริงและแนบ `.env` สดๆ จะจัดการ Environment ได้ง่ายกว่า

---

## 🤖 วิธีใช้งานคู่มือนี้ร่วมกับ AI (สำหรับ Project ถัดไป)

หากคุณกำลังเริ่มทำ CI/CD ในโปรเจกต์ใหม่ และต้องการให้ AI ช่วยตั้งค่าให้ สามารถใช้งานเอกสารนี้ได้ 2 วิธี:

**วิธีที่ 1: แนบไฟล์เข้าโปรเจกต์ใหม่**
1. นำไฟล์ `CI_CD_WORK_INSTRUCTION.md` นี้ไปเซฟไว้ในโฟลเดอร์หลัก (Root) ของโปรเจกต์ใหม่
2. พิมพ์สั่ง AI ว่า *"ช่วยเขียนไฟล์ CI/CD ให้โปรเจกต์นี้หน่อย โดยให้อ่าน Best Practices และสถาปัตยกรรมจากไฟล์ `CI_CD_WORK_INSTRUCTION.md` ก่อน เพื่อหลีกเลี่ยงบั๊กเดิม"*

**วิธีที่ 2: ใช้เป็น Prompt อ้างอิง**
ให้ก๊อปปี้เนื้อหา **ข้อ 3** (โครงสร้างโค้ด `ci.yml`) ไปให้ AI แล้วบอกว่า *"สร้าง GitHub Actions CI/CD ให้หน่อย โดยให้ยึดเทมเพลตโค้ดนี้เป๊ะๆ โดยเฉพาะตรง Set-Content กับ robocopy เพราะของเดิมมีปัญหา"*

เมื่อ AI ได้รับบริบทจากเอกสารนี้ มันจะสร้างไฟล์ `ci.yml` ของโปรเจกต์ใหม่ได้ถูกต้อง 100% ตั้งแต่ครั้งแรกโดยไม่เกิดปัญหาเก่าๆ แน่นอนครับ!
