# WD School Manual Library — คลังคู่มือโรงเรียนบ้านวังด้ง

เว็บไซต์ต้นแบบ **School Manual Library** สำหรับค้นหาและเปิดอ่านคู่มือของโรงเรียนแบบ e-book แยกหมวดหมู่ รองรับมือถือ แท็บเล็ต และคอมพิวเตอร์

> **สถานะ:** เว็บไซต์และ PWA อยู่ใน `main` และ GitHub Pages เผยแพร่สำเร็จแล้ว คู่มือสาธารณะที่เปิดอ่านได้มีคู่มือแนะนำเว็บไซต์และคู่มือกรอกแบบบันทึกพัฒนาผู้เรียนรายบุคคลฉบับออนไลน์ โดยไม่แสดงข้อมูลเด็กจริงหรือไฟล์ภายใน

## UX-00 — ตรวจแบบก่อนพัฒนาหน้าอ่าน

- **[เอกสาร Baseline + Design Review + QA Gate](docs/WD_BOOKS_UX00_BASELINE_AND_DESIGN_REVIEW_2569.md)** — ตรวจโค้ดระบบเดิม, จุดต่างด้าน UX, เกณฑ์เก็บภาพ iPhone/iPad จริง และตาราง D01–D05 รอตรวจรับ
- **[ต้นแบบหน้าแรก/หน้าอ่าน iPhone และ iPad](docs/previews/WD_BOOKS_UX00_READER_PREVIEW_2569.html)** — ไฟล์ตัวอย่าง interactive สำหรับตรวจแนวทางเท่านั้น ไม่ใช่หน้า Production และไม่มีข้อมูลนักเรียน

**สถานะ:** ออกแบบ UX-00 พร้อมตรวจ แต่ยังไม่ผ่าน Gate 0 จนกว่าจะตรวจบนเครื่องจริงและยืนยันแบบก่อนเริ่ม P0

## UX-P0A — หน้าแรกแบบอ่านต่อก่อน (Merge PR #8)

มีการจัดหน้า Home ใหม่ใน feature branch: แสดงช่องค้นหาบนมือถือ, การ์ดอ่านต่อจากเล่มล่าสุด, รายการคู่มือพร้อมอ่านก่อนรอตรวจรับ และลด bottom tabs เหลือ 3 รายการ โดยยังรักษา localStorage และ PWA เดิมไว้

- [แผนตรวจรับและ Local-First QA ของ UX-P0A](docs/WD_BOOKS_UX_P0A_ACCEPTANCE_2569.md)
- Smoke tests: `node tests/home-p0a.smoke.cjs`, `node tests/library.smoke.cjs`, `node tests/pwa-reader.smoke.cjs`
- **Merge PR #8 แล้ว**: ต้องตรวจ iPhone/iPad จริง, accessibility และ PWA/Offline บน Pages อีกครั้ง

## UX-P0B — สารบัญบนมือถือ

เพิ่มปุ่มสารบัญให้ Reader บน iPhone/จอเล็ก เปิด Bottom Sheet เลือกบท แสดงบทปัจจุบัน ปิดด้วยปุ่ม/ฉากหลัง/Escape และคืน focus ไปจุดเดิม

- [เกณฑ์ตรวจรับ UX-P0B](docs/WD_BOOKS_UX_P0B_ACCEPTANCE_2569.md)
- ทดสอบ `node tests/mobile-toc-p0b.smoke.cjs` ร่วมกับ 3 ชุดเดิม

## แผนย้าย UI Stack — Tailwind CSS + shadcn/ui (UI-STACK-01)

**[อ่านแผน UI Stack Migration ปี 2569](docs/WD_BOOKS_UI_STACK_MIGRATION_TAILWIND_SHADCN_2569.md)** — วิเคราะห์ทางเลือกและกำหนด React + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui เป็นเป้าหมายแบบ **ต้องผ่านการทดลอง/Go-No-Go** โดยเริ่มจาก Design Tokens และ isolated prototype ก่อน, แยก PR ตาม UI-MIG-00–06, เก็บ baseline และรักษา Reader, Audio, localStorage และ PWA เดิม. แผนนี้เชื่อมอยู่ใต้ Reader UX Master Roadmap ไม่ใช่ roadmap ขนาน. **สถานะ: เอกสารแผนเท่านั้น ไม่เปลี่ยน Production, ไม่เพิ่ม package/build, ไม่ bump PWA version.**

- **[คู่มือปฏิบัติ UI-MIG-00: เก็บ Baseline แบบ Read-Only](docs/WD_BOOKS_UI_MIG00_BASELINE_RUNBOOK_2569.md)** — คำสั่ง Windows/VS Code, จด SHA/เวอร์ชัน, Device Matrix, เกณฑ์วัด performance และ Gate 0 แบบไม่เปลี่ยน Production (สถานะ NOT STARTED จนกว่าจะทดสอบจริง)

## แผนพัฒนา Reader UX (P0–P3)

**[WD Books — Reader Experience Roadmap ปี 2569](docs/WD_BOOKS_READER_UX_ROADMAP_2569.md)** คือเอกสารกำกับการปรับประสบการณ์อ่านหนังสือบน iPhone/iPad/Android/PC โดยอ้างอิง Apple Books, Kindle และ Kobo ครอบคลุมการจัดหน้าแรก, สารบัญมือถือ, Swipe, โหมดอ่านเต็มจอ, การตั้งค่าข้อความ, Continuous Scroll, ค้นในหนังสือ และ Bookmark พร้อม Work Packages **UX-00, UX-P0A–P0D, UX-P1A–P1B, UX-P2A–P2B, UX-P3A** และ Release/QA gates

> การเพิ่มเอกสารแผน **ไม่ใช่การแก้เว็บหรืออนุมัติ Merge งาน implementation**. เริ่มจาก Gate 0 และตรวจรับงานจริงทีละ PR ตามแผน โดยยังคง Local-First, ไม่มี GitHub Actions เพิ่ม และไม่เผยแพร่ข้อมูลผู้เรียนจริง

## สิ่งที่ทำได้ในต้นแบบ

- ชั้นหนังสือแยก 7 หมวดหมู่ พร้อมค้นหาชื่อ/คำสำคัญและแสดงสถานะแต่ละเล่ม
- ตัวอ่าน e-book: 2 หน้าเมื่อจอกว้าง, หน้าเดียวบนมือถือ, สารบัญ, เลขหน้า, progress, ปรับขนาดอักษร, ArrowLeft/ArrowRight, Esc
- เนื้อหา HTML ที่ปรับตามจอ (ไม่ใช้ PDF iframe เป็นวิธีอ่านหลัก) และไม่ใช้ API/DB/login
- สีเขียวสะอาดตามอัตลักษณ์ WD Growth, มี reduced-motion และ keyboard accessibility เบื้องต้น
- แสดงชัดว่าอะไรเป็นเล่มสาธิต อะไรยังรอตรวจรับ/ตามแผน

## โครงสร้าง

~~~text
manual/
├── index.html                # หน้าเว็บรวมคู่มือ + e-book reader
├── assets/
│   ├── styles.css            # Responsive layout / book UI
│   ├── app.js                # ค้นหา หมวดหมู่ อ่าน e-book
│   └── manuals-data.js       # ทะเบียนเล่มและเนื้อหาที่เผยแพร่ได้
├── docs/
│   └── CONTENT_GOVERNANCE_2569.md
├── .nojekyll                 # ให้ GitHub Pages แสดง static assets ตรง ๆ
└── README.md
~~~

## ทดสอบ Local-First บน Windows

เปิด PowerShell ในโฟลเดอร์ clone/worktree ของ repository นี้ แล้วรัน:

~~~powershell
py -m http.server 4173 --bind 127.0.0.1
~~~

เข้าเว็บไซต์ **http://127.0.0.1:4173/** ใน Chrome หรือ Edge ไม่จำเป็นต้องติดตั้ง Node, npm, XAMPP เพิ่ม และไม่ต้องใช้ GitHub Actions ในการพัฒนา/ทดสอบ

ตรวจ Smoke Test แบบไม่ต้องติดตั้ง dependency เพิ่ม (ต้องมี Node.js):

~~~powershell
node tests/library.smoke.cjs
~~~

จากนั้นทดสอบด้วยเบราว์เซอร์:
1. ค้นคำว่า “WD Growth”, “ระบบ”, “คู่มือ” แล้วดูจำนวนผลลัพธ์
2. กดหมวด “คู่มือสำหรับครู” เปิดคู่มือบันทึกพัฒนารายบุคคล แล้วตรวจ 15 หน้าและสารบัญ 7 ส่วน
3. กลับ “ทั้งหมด” แล้วเปิด “เริ่มต้นใช้งานคลังคู่มือ”
4. พลิกหน้า 1–8 บน Desktop (เป็นคู่หน้า), ใช้แป้นลูกศรและสารบัญ
5. ทดสอบ viewport โทรศัพท์ (หน้าเดียว), ปุ่ม A−/A+, Esc, ความยาวข้อความภาษาไทย/การเลื่อนอ่าน
6. ตรวจ DevTools Console ว่าไม่มี error, ลิงก์และ scroll ใช้งานได้
7. ตรวจ keyboard focus และผู้ใช้ที่ตั้ง Reduce motion

## ขั้นตอน GitHub Pages (หลังผ่าน PR และอนุมัติเผยแพร่เท่านั้น)

1. Merge PR ของต้นแบบเข้า **main** เมื่อผู้รับผิดชอบตรวจผ่าน; ก่อน Merge ยังไม่ใช่หน้าเว็บจริง
2. ไปที่ GitHub repository **Settings → Pages → Build and deployment**
3. เลือก **Source: Deploy from a branch**, เลือก **Branch: main**, Folder: **/(root)** แล้วกด **Save**
4. เมื่อ GitHub แจ้งว่า deploy สำเร็จ ให้เปิด URL เว็บไซต์โครงการโดยปกติ: **https://infobwd.github.io/manual/** และตรวจหน้าเว็บจริงบนมือถือ/PC
5. **ไม่ต้องสร้าง workflow GitHub Actions เอง**; GitHub Pages อาจทำการ deploy ภายในระบบของ GitHub ตามปกติ (ไม่อ้างว่า Actions ทั้งหมดถูกปิด)

> GitHub Pages เป็นเว็บ **สาธารณะ**. อย่าวางเอกสารหรือข้อมูลส่วนบุคคลที่จำกัดสิทธิ์ใน repository นี้ แม้จะยังไม่ได้ตั้งค่า Pages เพราะ repository เป็น Public อยู่แล้ว

## เพิ่มคู่มือจริงเมื่อผ่านการตรวจรับ

แก้เฉพาะรายการใน `assets/manuals-data.js` โดยต้องมีอย่างน้อย:
- รหัสเล่มที่ไม่ซ้ำกัน, ชื่อ, หมวดหมู่, กลุ่มผู้อ่าน, เวอร์ชัน/วันที่ปรับปรุง, คำอธิบาย/แท็ก
- สถานะ `published` เฉพาะเมื่อมีสิทธิ์เผยแพร่และเนื้อหาผ่านการตรวจรับ
- หน้าใน `pages` จัดเป็นหัวข้อ บทนำ รายการย่อย และคำแนะนำ (ไม่ต้องเขียน HTML ตรงเพื่อเลี่ยงการแทรกโค้ด)
- ตรวจรหัส/URL อ้างอิงที่สาธารณะเข้าถึงได้; อย่าแปะ URL private repo แล้วคาดว่าผู้ใช้ทั่วไปจะเปิดได้
- PR review โดยเจ้าของคู่มือและผู้รับผิดชอบข้อมูลก่อน Merge

### หลักการ Source of Truth

- **Repository ระบบต้นทางที่จำกัดสิทธิ์** = แผนงาน/คู่มือร่างภายใน/โค้ด/ผลการทดสอบ
- **Repository `infobwd/manual`** = คู่มือ **ฉบับสาธารณะ** ที่ผ่านการตรวจรับและแปลงเป็น e-book เท่านั้น
- เมื่อคู่มือต้นทางเปลี่ยน ต้องปรับฉบับสาธารณะให้มีเวอร์ชันและบันทึกการเปลี่ยนแปลง ห้ามแก้แบบไม่บอกที่มา

## ขอบเขตที่ไม่รวมในต้นแบบ

ไม่มีการคัดลอกเอกสารจาก private repo อัตโนมัติ, ไม่แก้คู่มือร่างใน repository ระบบต้นทาง, ไม่เพิ่มข้อมูลนักเรียนจริง, ไม่ทำฐานข้อมูล/login/analytics, ไม่สร้าง GitHub Actions และไม่ตั้งค่า GitHub Pages/Custom Domain จนกว่าจะได้รับคำสั่งอนุมัติ

ดูรายละเอียดเกณฑ์ก่อนเผยแพร่ใน `docs/CONTENT_GOVERNANCE_2569.md`

## PWA Mobile Reader — รุ่นตรวจรับ 23 ต.ค. 2569

- ไฟล์: `assets/app-experience.css`, `assets/experience.js`, `manifest.webmanifest`, `sw.js`, `icons/icon-192.png`, `icons/icon-512.png`
- มีเมนูด้านล่างสำหรับมือถือ/แท็บเล็ต, โหมดสว่าง/กระดาษถนอมสายตา/กลางคืน, ตัวปรับอักษร 90–160%, การจดจำหน้าล่าสุดใน localStorage, ปุ่มติดตั้ง PWA ในเบราว์เซอร์ที่รองรับ และวิธีเพิ่มลง Home Screen สำหรับ iPhone/iPad
- Service Worker ทำ cache เฉพาะทรัพยากรสาธารณะใต้ scope เว็บไซต์นี้ และพยายามอ่านแบบ network-first ก่อนใช้ cache เมื่อออฟไลน์; ไม่เก็บข้อมูลผู้เรียน/เอกสารภายใน
- ไอคอน PNG 192×192 และ 512×512 มีอยู่จริงบน branch นี้; Manifest และ Service Worker อ้างตรงกับเส้นทางไฟล์
- ตรวจ syntax JavaScript / JSON และการอ้างอิง static path แล้ว; **ยังไม่ได้ยืนยันการติดตั้งและ UX จริงบน iPhone/iPad/Android** จึงยังเป็นร่างตรวจรับ

**ขั้นทดสอบ Windows (แนะนำ worktree แยก):**

```powershell
cd D:\wd-manual-preview
git fetch origin
git switch feat/manual-mobile-reader-pwa-25691023
node tests/library.smoke.cjs
py -m http.server 4173 --bind 127.0.0.1
```

หรือใช้โฟลเดอร์ใหม่ถ้า `D:\wd-manual-preview` ใช้งานอื่นอยู่; อย่าสั่ง `git switch` เมื่อมีการแก้ไขที่ยังไม่ commit. เปิด `http://127.0.0.1:4173/` แล้วตรวจ Responsive/Fonts/Reader/Install. บน iPhone ให้ทดลองกับ Pages หลังได้รับอนุมัติ Merge และ deploy จริง เพราะ `localhost` ของเครื่อง Windows ไม่ใช่ `localhost` ของ iPhone.

**PR PWA #2 Merge แล้ว** และ GitHub Pages Deploy ผ่านเมื่อ 23 ต.ค. 2569; ยังต้องทดสอบการติดตั้ง/ออฟไลน์บนอุปกรณ์จริง ไม่เพิ่ม custom GitHub Actions.

## คู่มือ WD Growth บันทึกการพัฒนาผู้เรียนรายบุคคล (Public Edition 1.0)

- วันที่เผยแพร่: 23 ตุลาคม 2569 ตามคำสั่งเจ้าของโครงการให้นำคู่มือขึ้นคลัง e-book
- ไฟล์สาธารณะ: `assets/wd-growth-individual-guide.js`; แสดงผ่านหมวด **คู่มือสำหรับครู** ในหน้าเว็บ `https://infobwd.github.io/manual/`
- ครบ **15 หน้า** รวม 7 ส่วนของแบบฟอร์มกระดาษ 2 หน้า A4, ตัวอย่างสมมติสำหรับ ป.3 และ อ.3, กรณีครูร่วม, ติดตาม PLC, N/O/0 และข้อมูลส่วนบุคคล
- ตัวอย่าง/คะแนน/รหัส DEMO ไม่ใช่ข้อมูลจริงหรือรูบริกฉบับทางการ เอกสารจริงต้องจัดเก็บในช่องทางภายในที่จำกัดสิทธิ์
- ใช้คู่มืออ่านออนไลน์เพื่อเริ่มทดลองกรอกเอกสารได้ แต่ยังต้องตรวจรับ **การพิมพ์แบบฟอร์มจริง A4 และคู่มือฉบับพิมพ์** แยกตามกระบวนการของโรงเรียน; การเผยแพร่นี้ไม่ได้ Merge เอกสาร draft ใน repo ต้นทางหรือเปิดระบบบันทึกผลจริง
- การเปลี่ยนเนื้อหา/เวอร์ชันในอนาคตควรเปิด PR พร้อมทบทวนโดยฝ่ายวิชาการและผู้ดูแลข้อมูล


## WD Books — Splash, Pull to Refresh และชั้นหนังสือส่วนตัว (Merge PR #4 แล้ว)

ฟีเจอร์รุ่นนี้พัฒนาบน branch `feat/manual-mobile-pwa-eye-care-25691023` และ **Merge เข้า main แล้วใน PR #4**. การตรวจรับบน iPhone/iPad/Android เครื่องจริงยังต้องทำแยกจากผลทดสอบโค้ดจำลอง.

- **Splash Screen:** หน้าเปิดแอปสีเขียวพร้อมสัญลักษณ์ WD Books สั้น ๆ เมื่อเริ่มเปิดหน้าใหม่ใน session; Android ใช้ไอคอนและสีจาก PWA manifest สำหรับ splash ระดับระบบ ส่วน iOS แสดงหน้า splash ของเว็บหลังเริ่มโหลด (ภาพ launch ระดับระบบปฏิบัติการขึ้นกับ Safari/iOS)
- **Pull to Refresh:** ดึงลงบนหน้าหลัก/ชั้นหนังสือเมื่ออยู่ตำแหน่งบนสุด ระยะถึงเกณฑ์แล้วปล่อยเพื่อรีเฟรช; ไม่ทำงานขณะเปิด e-book, หน้าตั้งค่า หรือกำลังพิมพ์ข้อมูล เพื่อป้องกันการเสียตำแหน่งอ่าน
- **ปิดอ่านด้วยนิ้วโป้งขวา:** ปุ่ม "✕ ปิดอ่าน" ลอยด้านขวาล่างเหนือส่วนเปลี่ยนหน้าบนโทรศัพท์และแท็บเล็ต (พื้นที่แตะอย่างน้อย 49 พิกเซล); บนคอมพิวเตอร์ยังมีปุ่มปิดด้านบนและปุ่ม Esc
- **หนังสือของฉัน:** บันทึกรายชื่อหนังสือโปรดด้วยปุ่ม ♡ บนปกหนังสือ, เรียกดูเล่มโปรด, นำออก, แสดงประวัติ 3 เล่มที่เปิดล่าสุด และอ่านต่อจากหน้าที่บันทึกไว้
- **แถบแอป 5 เมนู:** หน้าหลัก / หนังสือ / ของฉัน / อ่านต่อ / ตั้งค่า; มีทางลัด "หนังสือของฉัน" ใน PWA manifest

### การบันทึกข้อมูลในเครื่อง

ใช้ **localStorage** ในเบราว์เซอร์ภายใต้ key `wd-manual-reader-v2` เดิม (รองรับข้อมูลเดิม) เก็บเฉพาะ `theme`, `font`, `recent`, `progress` (index หน้าล่าสุดแยกเล่ม), `favorites` (รหัสหนังสือ), และ `history` (รหัส 20 เล่มล่าสุด) ไม่มีชื่อ/ข้อมูลประจำตัว, ไม่มีผู้เรียนจริง, ไม่ส่งขึ้นเซิร์ฟเวอร์, ไม่มีล็อกอิน; ไม่ซิงก์ข้ามเครื่องหรือข้ามเบราว์เซอร์. หากล้างข้อมูลเว็บไซต์, ใช้ Private Browsing หรือเบราว์เซอร์ปิดกั้น storage การบันทึกอาจไม่คงอยู่. เอกสารคู่มือที่เก็บ offline เป็นข้อมูลสาธารณะที่ผ่านการเผยแพร่เท่านั้น

### ทดสอบเพิ่มเติมบนอุปกรณ์จริงหลัง Merge

```powershell
node tests/library.smoke.cjs
node tests/pwa-reader.smoke.cjs
py -m http.server 4173 --bind 127.0.0.1
```

ทดสอบ iPhone/iPad/Android ผ่าน HTTPS บน branch preview หรือหลังอนุมัติ Merge: เปิดหน้าแรกเห็น splash, ปัดลงจากด้านบนจนเห็น "ปล่อยเพื่อรีเฟรช", เข้าอ่าน e-book แล้วลองปัดลง (ต้องไม่รีเฟรช), ปุ่ม "ปิดอ่าน" ด้านขวาล่าง, กด ♡ บันทึกหนังสือ, เปิด/พลิกหน้า/ปิด/เปิดใหม่แล้วตรวจหน้าเดิม, ปิดแท็บ/เปิดใหม่แล้วตรวจ "ของฉัน", เปลี่ยนโหมดสว่าง-ถนอมสายตา-กลางคืน, ปรับอักษร และตรวจ PWA Offline + Home Screen. iOS Safari อาจใช้ท่าปัดรีเฟรชของระบบในบางเวอร์ชัน ต้องตรวจบนเครื่องจริง

> ไม่มี GitHub Actions เพิ่มเติม. Smoke tests นี้เป็นการทดสอบ DOM จำลอง/ส่วนข้อมูลภายในโค้ด; ไม่ใช่การยืนยันผลการติดตั้งหรือท่าทางสัมผัสบนอุปกรณ์จริง


## AI in Learning — คำถามข้อที่ 3: จากตรวจคำตอบสู่การดูวิธีคิด (26 ต.ค. 2569)

- [หนังสือฉบับต้นทาง Markdown](docs/ai-learning/AI_Q3_FROM_ANSWER_CHECKING_TO_VISIBLE_THINKING_25691026.md) — อธิบายแบบอ่านง่ายพร้อมตัวอย่างคณิตศาสตร์ ป.2 ภาษาไทย ป.3 อนุบาล 3 วิทยาศาสตร์ ป.4 และคำถามครู
- **WD Books Reader:** รหัสเล่ม `ai-q3-from-answer-checking-to-visible-thinking`, หมวดงานวิชาการ, จำนวน 21 หน้า ใน `assets/manuals-data.js`
- มีหลักฐานวิจัย การสังเกต–ตีความ–ตอบสนอง แบบบันทึกสั้นในแนว WD Growth และแนวทดลอง PLC 4 สัปดาห์
- สถานะ **Public Discussion 0.1**: ตัวอย่างทั้งหมดเป็นสถานการณ์สมมติ ไม่ใช่ผลผู้เรียนจริงหรือเกณฑ์วัดทางการ; การเผยแพร่ขึ้นหน้าเว็บต้อง Merge และตรวจ Pages/PWA หลัง deploy
- ทดสอบ `node tests/manuals-data-syntax.smoke.cjs` และทดสอบการเปิดอ่าน การค้นหา สารบัญ ขนาดอักษรและออฟไลน์บนเครื่องจริงหลัง Merge


## หนังสือข้อที่ 5 — การประเมินในยุค AI (26 ต.ค. 2569)

- หนังสือออนไลน์หมวดงานวิชาการ: **การประเมินในยุค AI — จากคำตอบที่ถูกต้อง สู่หลักฐานว่าเด็กเรียนรู้จริง** (20 บท; Public Discussion 0.1)
- Markdown ต้นทาง: [AI_Q5_ASSESSMENT_FOR_AUTHENTIC_LEARNING_25691026.md](docs/ai-assessment/AI_Q5_ASSESSMENT_FOR_AUTHENTIC_LEARNING_25691026.md)
- รหัสเล่มใน WD Books: `ai-q5-assessment-authentic-learning-primary` · เปิดหน้า [WD Books](https://infobwd.github.io/manual/) แล้วค้นคำว่า “การประเมินในยุค AI”
- เนื้อหา: วิจัย PNAS/OECD/Black–Wiliam/EEF/Retrieval Practice/NAEYC/AIAS, ตัวอย่างคณิตศาสตร์ **ป.2** ตรง สสวท., ภาษาไทย ป.3, อนุบาล, วิทยาศาสตร์ ป.4–6, กรอบหลักฐานห้ามิติ, แนวคิด WD Growth และ PLC
- **สถานะ:** ข้อเสนออภิปราย ไม่ใช่นโยบายโรงเรียน ไม่ใช้คะแนนจริง ไม่แก้ข้อมูล/รูบริก/ฐานข้อมูลของ WD Growth
- QA หลัง merge: `node tests/manuals-data-syntax.smoke.cjs`; เปิด Reader ค้นชื่อเล่ม ตรวจครบ 20 หน้า สารบัญ ปรับตัวอักษร และทดสอบการโหลดบนมือถือ/แท็บเล็ตจริง


## WD Books — หนังสือคำถามข้อที่ 4: เด็กที่ตั้งคำถามเป็น

- หนังสือ: **เด็กที่ตั้งคำถามเป็น — จากการเชื่อคำตอบสู่การค้นหาความจริง** — Public Discussion 0.1 (26 ตุลาคม 2569) จำนวน 22 บท หมวด **งานวิชาการ**
- ต้นฉบับ: [AI_Q4_CHILDREN_ASK_VERIFY_AND_THINK_25691026.md](docs/ai-critical-inquiry/AI_Q4_CHILDREN_ASK_VERIFY_AND_THINK_25691026.md) และหนังสือออนไลน์รหัส `ai-q4-children-ask-verify-think`
- มีงานวิจัย King, Rosenshine, McGrew และ Bastani พร้อมกรอบ UNESCO/OECD/UNICEF โดยแยกข้อค้นพบวิจัยออกจากข้อเสนอทดลอง
- ตัวอย่างสมมติ: ต้นมะพร้าว ข่าวน้ำท่วม การอ่านที่บ้าน คณิตศาสตร์ ป.2 (478 + 156 = 634), กิจกรรม อ.–ป.6, แผน 50 นาที, รูบริกร่าง และ PLC/WD Growth
- เป็นหนังสือชวนคิด ไม่ใช่นโยบายหรือการปรับ WD Growth Production ไม่มีข้อมูลนักเรียนจริง ไม่เพิ่ม GitHub Actions
- ปรับ PWA shell version `1.3.46` โดยไม่เปลี่ยนระบบ reader, localStorage หรือประวัติอ่าน
- ก่อน Merge รัน `node tests/manuals-data-syntax.smoke.cjs`, `node tests/library.smoke.cjs` และ `node tests/pwa-reader.smoke.cjs`; หลัง Merge ตรวจ Reader/PWA จริงบนมือถือและแท็บเล็ต


## WD Books — 5 คำถามชวนคิด: ชีทโน้ตผู้บรรยาย (26 ต.ค. 2569)

- หนังสือแยกหมวดงานวิชาการ: **5 คำถามชวนคิด เมื่อ AI เข้ามาในโรงเรียน — ชีทโน้ตผู้บรรยาย** (12 หน้า, Speaker Notes 0.1) รหัส `ai-five-questions-speaker-cheatsheet-25691026`
- เนื้อหาอ่านสั้นระหว่างบรรยาย: มุกสุภาพ ตัวอย่างใกล้ตัว มุมผู้บริหาร มุมครู งานวิจัยและต่างประเทศประกอบอย่างมีขอบเขต พร้อมสคริปต์เปิด/ปิด
- [ต้นฉบับหนังสือ Markdown](docs/ai-workshop-notes/AI_FIVE_QUESTIONS_SPEAKER_CHEATSHEET_25691026.md) · [ไฟล์คำสั่ง/Storyboard สำหรับ AI ทำสไลด์ 12 หน้า](docs/ai-workshop-notes/AI_FIVE_QUESTIONS_SLIDE_GENERATION_BRIEF_25691026.md)
- ไม่มีข้อมูลนักเรียนจริงและไม่มีการแก้ WD Growth Production; สถานะเป็นชีทวิชาการสำหรับอภิปราย ไม่ใช่นโยบายประกาศใช้
- เพิ่ม smoke assertions ตรวจครบ 12 หน้า / แหล่งอ้างอิง / บทบาทผู้บริหารครู พร้อมปรับหมายเลข PWA ไม่ชนเวอร์ชันเดิม
- หลัง Merge ให้เปิด [WD Books](https://infobwd.github.io/manual/) ค้นคำว่า “ชีทโน้ตผู้บรรยาย” และตรวจหน้าอ่าน/สารบัญ/ออฟไลน์บนเครื่องจริง


## UI-TECH-01 — แผน Tailwind CSS + shadcn/ui (26 ต.ค. 2569)

- **[WD Books UI Technology Migration Plan](docs/WD_BOOKS_UI_TECH_MIGRATION_TAILWIND_SHADCN_2569.md)** — ประเมินสถาปัตยกรรม React/TypeScript/Vite/Tailwind/shadcn, ความเสี่ยงของ Reader/Audio/PWA และขั้นดำเนินการ UI-M0–M7 พร้อม gates/rollback.
- เชื่อมเข้า **[Master Reader UX Roadmap](docs/WD_BOOKS_READER_UX_ROADMAP_2569.md)** แล้ว; ไม่ตั้งคิวงานแข่งขันกับ UX-P0–P3 หรือ ARCH-01.
- **เอกสารแผนเท่านั้น**: ยังไม่สร้าง React app, ไม่ปรับ UI Production, ไม่เปลี่ยน SW/cache version, ไม่มีข้อมูลผู้เรียนหรือ GitHub Actions เพิ่ม.
- Next recommended task: UI-M0 baseline และ M1 design prototypes Home/Books/Settings ก่อนเริ่ม isolated React preview.

## WD Books — ชุดฝึกพูด 7 คำถามการศึกษาในยุค AI (27 ต.ค. 2569)

- หนังสือเดิมรหัส `ai-five-questions-speaking-handbook-25691026` ขยายเป็น **7 คำถาม** โดยไม่เปลี่ยนรหัสหนังสือ เพื่อรักษารายการโปรด ประวัติอ่าน และบุ๊กมาร์กในเครื่อง
- ข้อที่ 6 **AI in Learning** ว่าด้วยการปรับตัวของครูและผู้บริหารเพื่อใช้ AI อย่างมีคุณภาพ; ข้อที่ 7 เป็น **คำถามปิด** ฝากกำลังใจและแนวทางเริ่มต้น
- [บทพูดฉบับเต็มและวิเคราะห์ทั้ง 7 ข้อ](books/ai-education-five-questions-speaking-scripts-2569.md) — รักษาบทพูดเดิม 5 ข้อและเพิ่มอีก 2 ข้อพร้อมคำแนะนำ
- [คู่มือฝึกพูดฉบับขยาย](docs/WD_BOOKS_AI_FIVE_QUESTIONS_SPEAKING_GUIDE_2569.md) — แผนที่เนื้อหา 7 ข้อ, เทคนิคเว้นจังหวะ, แนวทางใช้ Teleprompter
- [คู่มือ Teleprompter](docs/WD_BOOKS_TELEPROMPTER_2569.md) — เลือกได้ 7 บท, หยุด/เล่นต่อ/ปรับความเร็ว, อ่านต่อได้โดยไม่ใช้บริการภายนอก
- PWA เวอร์ชัน **1.3.50** ใช้ service worker cache version ใหม่สำหรับทะเบียนหนังสือ; การ Merge โค้ดยังต้องตรวจการเผยแพร่ Pages และทดสอบบนอุปกรณ์จริง
- ทดสอบแบบ Local-First: `node tests/teleprompter.smoke.cjs`, `node tests/library.smoke.cjs`, `node tests/pwa-reader.smoke.cjs` (ไม่เพิ่ม GitHub Actions)
