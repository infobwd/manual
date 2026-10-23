# WD Books — UX-P0A Home Reading-First / Acceptance (ปี 2569)

**อ้างอิงแผน:** [Reader UX Roadmap](WD_BOOKS_READER_UX_ROADMAP_2569.md)  
**วันที่:** 23 ตุลาคม 2569  
**สถานะ:** IMPLEMENTATION IN DRAFT PR / REAL-DEVICE QA PENDING

## 1. ขอบเขตที่ลงมือแล้ว

- เรียงส่วน Home ให้ Search (มือถือ) → การ์ดอ่านต่อ (ถ้ามี) → คลังคู่มือ → ของฉัน → Hero/Stats/รายละเอียด
- อ่านต่อ: ใช้ข้อมูลประวัติและ progress เดิม, แสดงปก ชื่อ เลขหน้า และเปอร์เซ็นต์; เปิดเล่มเดิมในหนึ่งแตะ; กรณีไม่มีประวัติไม่แสดงการ์ด
- ค้นหาบนมือถือ: ช่องใหม่ด้านบนซิงก์กับช่องใน Library; กดดูรายการเพื่อเลื่อนลงไปผลการค้นหา
- แสดง published ก่อน review/planned ในทุกตัวกรอง; เล่มยังไม่เผยแพร่ยังเปิดอ่านไม่ได้
- ลด bottom navigation มือถือเหลือ 3 รายการ: หน้าหลัก / หนังสือ / ของฉัน; Settings ยังเข้าถึงจาก Header
- ธีม Light/Sepia/Night และขนาดตัวอักษรเดิมใช้ต่อ; Service Worker เพิ่ม assets/home-p0a.css และ cache รุ่น v6
- ไม่เปลี่ยน Reader, ข้อมูลหนังสือ 8/15 หน้า, storage schema, Private repo, backend หรือ GitHub Pages Settings

## 2. เกณฑ์ตรวจรับก่อน Merge

| ID | ทดสอบ | PASS เมื่อ |
|---|---|---|
| H01 | เริ่มใช้ใหม่ | ไม่พบการ์ดอ่านต่อ; มีคู่มือ published สองเล่มอยู่ต้นรายการ |
| H02 | เปิดเล่มและกลับ Home | มีการ์ดอ่านต่อพร้อมชื่อ/เลขหน้า; แตะครั้งเดียวเปิดเล่มถูกต้อง |
| H03 | พลิกหน้าและปิด | การ์ดอัปเดต progress โดยไม่ทำให้ปุ่ม/โฟกัสหาย |
| H04 | ปิดแท็บแล้วเปิดอีกครั้ง | ประวัติและหน้าค้างยังถูกต้องบนเครื่องเดิม |
| H05 | ค้นหา | คำค้นของ Home กับ Library ซิงก์กันและผลกรองตรง |
| H06 | กรองหมวด | published อยู่ก่อน review/planned; รายการรอตรวจรับเปิดไม่ได้ |
| H07 | Bottom bar | มี 3 เมนู; Header Settings และ My Books ยังใช้ได้ |
| H08 | ธีม/ฟอนต์ | Light/Sepia/Night และ 90–160% ไม่ถดถอย |
| H09 | Reader | คู่มือ 8/15 หน้า ปุ่มปิดอ่าน / ปุ่มเปลี่ยนหน้า / Keyboard ใช้ได้ |
| H10 | PWA | app shell v6 โหลด CSS ใหม่/ออฟไลน์; upgrade ไม่ลบ localStorage |
| H11 | Responsive | iPhone 320/375/390px และ iPad portrait/landscape ไม่ชน/ล้น |
| H12 | Accessibility | ซูม 200%, focus, VoiceOver/TalkBack เมื่อมีเครื่องจริง |
| H13 | Data safety | ไม่มีชื่อ คะแนน หรือข้อมูลนักเรียน/secret จริง |

## 3. Local-first QA

เปิด PowerShell ใน clone ของ repo manual และตรวจว่า D:\wd-books-p0a ยังไม่มีอยู่ก่อนสร้าง worktree

~~~powershell
git fetch origin
git worktree add --detach D:\wd-books-p0a origin/feat/ux-p0a-home-reading-first-25691023
cd D:\wd-books-p0a
node tests/library.smoke.cjs
node tests/pwa-reader.smoke.cjs
node tests/home-p0a.smoke.cjs
py -m http.server 4173 --bind 127.0.0.1
~~~

ตรวจ Chrome/Edge ที่ http://127.0.0.1:4173/ โดยเปิด Device Toolbar, ซูม 200%, และลองใช้ Keyboard. สำหรับ iPhone/iPad จริงให้ทดสอบหน้าเว็บที่เข้าถึงจากเครื่องนั้นได้โดยไม่ใช้ข้อมูลส่วนบุคคล. PWA/Service Worker ต้องทดสอบบน HTTPS หรือ localhost จึงไม่ถือว่าทดสอบผ่านด้วย LAN HTTP

**ผลเบื้องต้น:** ตรวจ source และ smoke 3 ชุด PASS ด้วย JavaScript simulation runner ในรอบนี้ ไม่ใช่ผลรัน Node CLI/การแตะจริงบน iPhone/iPad. ต้องเก็บหลักฐานอุปกรณ์จริงก่อนอนุมัติ Merge โค้ด

## 4. Known risks / Rollback

- อัปเดต progress แล้วการ์ดอ่านต่อไม่ replace ปุ่มเดิมถ้าเป็นหนังสือเล่มเดียวกัน เพื่อรักษา focus
- ช่องค้นหาสองตำแหน่งต้องซิงก์; บนมือถือซ่อนช่องเดิมใน Library ไม่ให้ซ้ำ
- การ์ด review/planned ลดความเด่นและเรียงหลัง published เท่านั้น ยังไม่ได้ลบออกจากทะเบียน
- หาก QA ไม่ผ่านแก้ใน feature branch; หลัง Merge หากมี regression ให้ revert feature PR โดยไม่ลบ localStorage ผู้ใช้
- ต้องเช็ก SW cache update/online-offline จริงหลังปล่อย ไม่อ้างว่าผ่านจาก smoke test จำลอง

## 5. Release Gate และลำดับต่อไป

1. PR นี้เป็น implementation งาน UX-P0A **ยังไม่ Merge เข้า main**
2. ผู้รับผิดชอบตรวจ UX-00 Design Preview และตัดสินใจ D01 (bottom tabs 3 ปุ่ม)
3. ตรวจ Before/After บน iPhone/iPad พร้อมผล Node tests และ PWA/Offline จริง
4. เมื่อผ่าน Gate จึงอนุมัติ Merge UX-P0A และตรวจ Pages live
5. เริ่ม UX-P0B (สารบัญบนมือถือ) ใน PR ใหม่หลัง P0A ผ่าน ไม่รวม P0C/P0D ใน PR นี้
