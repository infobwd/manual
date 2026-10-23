# WD Books — UX-00 Baseline & Design Review (ปี 2569)

**เริ่มงาน:** 23 ตุลาคม 2569  
**อ้างอิง:** [Reader UX Roadmap P0–P3](WD_BOOKS_READER_UX_ROADMAP_2569.md)  
**สถานะ:** DESIGN PREVIEW READY / REAL-DEVICE QA PENDING  
**ต้นแบบ:** [เปิดตัวอย่างหน้าจอ iPhone และ iPad](previews/WD_BOOKS_UX00_READER_PREVIEW_2569.html)

> UX-00 เป็นงานเตรียมการ ไม่ได้แก้เว็บจริง และไม่ได้อนุมัติให้ Merge งาน P0 อัตโนมัติ. ตัวอย่างมีเฉพาะข้อมูลสมมติ ไม่ใช่ผลนักเรียนจริง

## 1. สิ่งที่ทำใน UX-00

1. ตรวจ source code ใน main เพื่อบันทึก baseline ของ Library, Reader, TOC, data persistence และ PWA
2. สร้างตัวอย่าง **iPhone Home / iPhone Reader + Mobile TOC / iPad Landscape หน้าคู่** เพื่อเสนอให้ตรวจรับ
3. ทำ Decision Register และ QA Checklist สำหรับเก็บภาพจริงจาก iPhone/iPad
4. คง index.html, assets จริง, Service Worker, manifest, localStorage, GitHub Pages settings และคู่มือทุกเล่มไว้เหมือนเดิม

ต้นแบบเป็น HTML/CSS/JS แบบ self-contained มีปุ่มเปลี่ยนมุมมอง เปิด/ปิดสารบัญ และเปลี่ยนเลขหน้าจำลองเท่านั้น **ไม่ใช่แอปเวอร์ชันที่แก้ไขแล้ว** และไม่มี dependency ภายนอก

## 2. Verified source baseline

| องค์ประกอบ | สภาพเดิมจาก main | ช่องว่างก่อน P0 |
|---|---|---|
| Home | Hero → summary → My Books → Library/Search | หนังสือและอ่านต่ออยู่ค่อนข้างล่าง |
| Bottom nav | 5 ปุ่ม: หน้าหลัก หนังสือ ของฉัน อ่านต่อ ตั้งค่า | เสนอรวมเหลือ 3 หรือ 4 |
| Library | หมวด ค้นหา รายการพร้อมอ่าน/รอตรวจรับ/ตามแผน | ให้ published แสดงเด่นก่อน |
| Reader | HTML dialog, 1/2 หน้า, หน้าก่อน/ถัดไป, Arrow keys | ต้องลดปุ่มที่รบกวนการอ่าน |
| Mobile TOC | มีบน desktop แต่ถูกซ่อนที่จอกว้างไม่เกิน 850px | เพิ่ม Bottom Sheet / ปุ่มเรียกสารบัญ |
| Swipe | มีปุ่มและ keyboard แต่ยังไม่มีการปัดเปลี่ยนหน้า | ต้องไม่ชน vertical scroll, iOS Back, Pull-to-refresh |
| Thumb close | มีปุ่มปิดอ่านด้านขวาล่างแล้ว | ตรวจระยะนิ้วโป้งและการบังข้อความ |
| Comfort | Light, Sepia, Night; font 90–160% | เพิ่มระยะบรรทัด ขอบ ฟอนต์ และโหมดต่อเนื่องใน P1 |
| Local state | wd-manual-reader-v2: recent, progress, history, favorites, theme, font | ต้องไม่ reset; ไม่ sync ข้ามเครื่อง |
| PWA | Manifest + Service Worker + Offline shell | ตรวจ upgrade/cache/PWA จริง |

**ไฟล์ที่ตรวจ:** index.html; assets/app.js, experience.js, styles.css, app-experience.css, mobile-reader.css, manuals-data.js, wd-growth-individual-guide.js; sw.js; manifest.webmanifest.

**ข้อจำกัด:** Baseline นี้มาจากการอ่าน GitHub source ไม่ใช่ผลการจับภาพ production browser บนอุปกรณ์จริง. ในรอบนี้เครื่องมือไม่สามารถเปิดเว็บสาธารณะเพื่อถ่าย screenshot จึง **ยังไม่มี Before Screenshot ที่รับรองได้** และไม่สร้างภาพจำลองแล้วกล่าวว่าเป็นภาพจริง.

## 3. ภาพหน้าจอเป้าหมายใน Preview

### 01 iPhone Home — UX-P0A
- Header กระชับ: WD Books + Settings; Search อยู่ต้นหน้า
- อ่านต่อจากครั้งล่าสุดเป็นการ์ดแรกเมื่อมีประวัติ; ถ้าไม่มี แสดงคู่มือพร้อมอ่านแทน
- คู่มือ published มาก่อน planned/review; Hero/สถิติย้ายไปท้ายหรือย่อ
- เสนอ bottom bar 3 รายการ: หน้าหลัก / คลังคู่มือ / ของฉัน; อ่านต่อเป็นการ์ด และตั้งค่าอยู่ Header
- **รอการตัดสินใจ:** จะใช้ 3 หรือ 4 รายการตามความสะดวกจริง

### 02 iPhone Reader — UX-P0B และ UX-P0C
- หน้าหนังสือเป็นพื้นที่หลัก; มีสารบัญชัดเจนที่ Header
- แตะสารบัญเปิด Bottom Sheet เลือกบท/แสดงบทปัจจุบัน แล้วปิดกลับการอ่านได้
- คงปุ่มหน้าก่อน/หน้าถัดไป + เลขหน้า; ปิดหนังสือได้สะดวกด้านขวา
- ปัดซ้าย/ขวาเป็นข้อเสนอสำหรับ P0C เท่านั้น; preview ยังไม่ใช่ gesture implementation
- เมื่อเพิ่ม gesture ต้องรักษา vertical scroll, selection, links, focus, escape/back และ reduced motion

### 03 iPad Reader — UX-P0D
- Landscape แสดงสารบัญด้านข้างพร้อมกระดาษหน้าคู่ ถ้าพื้นที่จริงเพียงพอ
- ปิดสารบัญได้; Portrait และ Split View เมื่อแคบให้ยุบเป็นหน้าเดียว
- หมุนจอแล้วต้องคง logical page ที่กำลังอ่าน ไม่ reset progress

**Visual direction:** สีเขียว WD, กระดาษขาวนวล, ฟอนต์ไทยอ่านง่าย, ปุ่มสัมผัสขนาดพอ, ไม่มี animation 3D หนัก และไม่มีข้อมูลส่วนบุคคลใน Preview.

## 4. Design decisions ที่ต้องตรวจ

| ID | เรื่อง | ข้อเสนอ | สถานะ |
|---|---|---|---|
| D01 | เมนูล่างมือถือ | 3 ปุ่ม + อ่านต่อหน้า Home + Settings Header | PENDING |
| D02 | สารบัญมือถือ | Bottom Sheet / ไฮไลต์บท / คืนโฟกัส | PENDING |
| D03 | การพลิกหน้า | ปุ่ม + swipe; ไม่ตัดวิธีเข้าถึงเดิม | PENDING |
| D04 | ปุ่มปิดอ่าน | คงการใช้นิ้วโป้งขวาและไม่บังเนื้อหา | PENDING DEVICE QA |
| D05 | iPad | หน้าคู่เมื่อ available width พอ, สารบัญปิดได้ | PENDING |
| D06 | อ่านแบบเลื่อนต่อเนื่อง | เลื่อนไปพัฒนาใน P1; อย่าเปลี่ยน progress เดิม | DEFER |

## 5. QA baseline บนอุปกรณ์จริง (ยังไม่ได้ตรวจรับ)

ทุกภาพต้องใช้เนื้อหาสาธารณะที่ published เท่านั้น และลบ/ปิดการแจ้งเตือน ชื่อจริงหรือข้อมูลบุคคลก่อน commit ลง repo Public

- [ ] **iPhone Safari Portrait:** Home top/bottom, Reader เล่มสาธิต, Reader คู่มือ 15 หน้า, Settings, My Books, ปุ่มปิดอ่าน
- [ ] **iPhone PWA:** Splash, reopen progress, pull-to-refresh หน้า Home, pull-to-refresh ระหว่าง Reader ต้องไม่ทำงาน, offline
- [ ] **iPad Safari/PWA:** Portrait, Landscape, Reader + TOC, หมุนจอ, Split View หากทำได้
- [ ] **Android Chrome/PWA:** ทดสอบเมื่อมีเครื่องจริง
- [ ] **Windows Chrome/Edge:** 390×844; 768×1024; 1024×768; 1366×768; 200% zoom; keyboard Tab/Arrows/Esc; Console
- [ ] **Screen Reader / A11y:** ตรวจ focus, labels, contrast, reduced motion, Safe Area
- [ ] **Regression:** ตรวจ published guide 8 และ 15 หน้า, last page, favorites, themes, offline/PWA update

**หลักฐานแต่ละภาพ:** วันที่, device model, OS/browser version, viewport, portrait/landscape, Safari/PWA/Chrome, PASS/FAIL/NOT TESTED, ข้อสังเกต. ตั้งชื่อไฟล์แบบ UX00_BASELINE_IPHONE_PORTRAIT_HOME_25691023.png และตรวจภาพก่อนแชร์.

## 6. Local-first verification

เปิด PowerShell จากโฟลเดอร์ clone ที่เป็น repo manual แล้วตรวจว่ายังไม่มีโฟลเดอร์ปลายทางก่อนใช้ git worktree:

~~~powershell
git fetch origin
git worktree add --detach D:\wd-books-ux00 origin/docs/ux00-mobile-tablet-preview-and-baseline-25691023
cd D:\wd-books-ux00
node tests/library.smoke.cjs
node tests/pwa-reader.smoke.cjs
py -m http.server 4173 --bind 127.0.0.1
~~~

Preview URL: http://127.0.0.1:4173/docs/previews/WD_BOOKS_UX00_READER_PREVIEW_2569.html

ถ้าใช้ worktree ไม่ได้ ให้ clone แยกในโฟลเดอร์ใหม่; ไม่สลับ branch/ลบไฟล์ของเครื่องที่มีงานค้าง.

| ตรวจ | สถานะรอบนี้ |
|---|---|
| ตรวจ source baseline | PASS |
| Commit design preview ใน feature branch | PASS |
| ตรวจ source ว่าไม่มีข้อมูลนักเรียนจริง | PASS (source inspection) |
| Live production screenshots | NOT TESTED |
| Smoke tests ผ่านใน JavaScript simulation (ไม่ใช่ Node บน Windows) | PASS: tests/library.smoke.cjs และ tests/pwa-reader.smoke.cjs |
| Node tests บน Windows | NOT TESTED |
| iPhone/iPad real touch + PWA | NOT TESTED |
| Design decision D01–D05 | PENDING OWNER REVIEW |

## 7. UX-00 Gate: GO / NO-GO

**GO เพื่อเริ่ม UX-P0A** เมื่อ:
- [ ] เจ้าของงานตรวจตัวอย่าง 3 มุมมองและยืนยัน/ให้แก้ D01–D05
- [ ] ได้ภาพ baseline ของ Safari/PWA บนอุปกรณ์ iPhone/iPad พร้อมบันทึก QA และไม่มีข้อมูลส่วนบุคคล
- [ ] Node smoke tests ของ baseline ผ่านจริงและเก็บผล
- [ ] ยืนยันว่าจะเริ่ม UX-P0A ใน PR ใหม่แยกจากงานเอกสาร

ห้ามลง production/P0 หากยังไม่ผ่านเงื่อนไขความเป็นส่วนตัว หรือ regression data-loss / PWA crash ที่ยังไม่แก้.

**ลำดับเมื่อผ่าน:** UX-P0A (Home) → UX-P0B (Mobile TOC) → UX-P0C (Swipe/Focus) → UX-P0D (Tablet). แต่ละงานมี PR/test/screenshot/approval แยก. เอกสารและ Preview นี้ไม่ถือว่าอนุมัติ Merge implementation.

**การเผยแพร่:** เอกสารอยู่บน branch สำหรับ review; หาก Merge เฉพาะเอกสารและ preview ลง main จะมีลิงก์ preview ใหม่ใน Pages แต่หน้าแอปหลักยังเหมือนเดิม. ห้ามเรียก Preview นี้ว่าเว็บไซต์จริง.
