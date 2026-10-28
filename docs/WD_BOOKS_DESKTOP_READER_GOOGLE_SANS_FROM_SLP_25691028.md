# WD Books — Desktop reader Google Sans จาก SLP (28 ต.ค. 2569)

**สถานะ:** PR เพื่อทดสอบ; ยังไม่ Merge / Deploy · Target release `1.3.59`

## ผลตรวจสอบต้นทาง SLP

- `infobwd/slp` (branch `master`), `index.html` โหลด `https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap`
- `src/index.css` ตั้ง `--font-sans` และ `--font-heading` โดยมี `"Google Sans"` นำหน้า fallback; โหลด Kanit, Sarabun, Inter ร่วมด้วย
- `src/hooks/useUiFontPreferences.ts` อนุญาตปรับ heading/body และฉีด CSS override ภายหลัง Tailwind; `.document-page` ยังคง Sarabun แยกต่างหาก
- Google Sans ที่อยู่ใน CSS stack **ไม่ยืนยันว่าใช้แสดงอักษรไทยทุกตัว**: ถ้าฟอนต์ขาด glyph เบราว์เซอร์จะใช้ fallback ของอักขระนั้น; หลีกเลี่ยงการอ้างว่าไทยทั้งหมดใช้ Google Sans โดยไม่มีการตรวจ Browser DevTools → Rendered Fonts

## ปัญหาของ WD Books ก่อนปรับ

`assets/google-sans-platform.css` ชื่อเหมือนโหลด Google Sans แต่โหลดเฉพาะ Sarabun และกำหนดให้ UI, kicker และหนังสือเป็น Sarabun. CSS ขนาดการอ่าน `data-font-family` มีตัวเลือก `system`, `sans`, `serif`. ตัวอ่านแบบพลิกมุมกระดาษเป็น iframe แยก document จึงรับ stylesheet ของหน้าหลักไม่ได้.

## ขอบเขตการเปลี่ยนแปลง (จำกัดเฉพาะเนื้อหา)

1. โหลด Google Sans แบบ Google Fonts API (ตาม SLP) เฉพาะ `screen`, กว้าง >= 1101px, `hover:hover`, `pointer:fine`.
2. ใช้ฟอนต์ใน `.reader-dialog .book-spread .book-page` ทั้งโหมดสองหน้าและเลื่อนต่อเนื่อง รวมส่วนที่เคยบังคับ Sarabun ด้วย shorthand (`.page-kicker`, `.book-page-number`).
3. **ไม่เปลี่ยน** เมนู, หน้าหลัก, ปกบนชั้นหนังสือ, ปุ่มควบคุม, mobile/tablet touch, หน้า iOS, เสียงอ่าน และการพิมพ์.
4. เคารพผู้เลือก `serif`; `system` (ค่าเดิม) และ `sans` บน desktop ใช้ `"Google Sans", "Sarabun", Tahoma, system-ui, sans-serif`.
5. โหมดพลิกมุมกระดาษใช้ query `desktopFont=1` จากหน้าหลักเท่านั้น และโหลด font ใน iframe เมื่อเข้าขอบเขต desktop. CSS ครอบคลุมทั้งหน้าจริงและ `#measure .paper` ที่ใช้แบ่งหน้า; `corner.js` มีการ repaginate หลัง `document.fonts.ready` อยู่แล้ว.
6. เปลี่ยน `app-version.js` + splash + `sw.js` เป็น `1.3.59` เพื่อแยก PWA cache; ไม่ลบ storage ของผู้ใช้.

## เกณฑ์ตรวจรับ (QA)

- [ ] Desktop Chrome/Edge (Windows), หน้าต่าง >= 1101px + mouse: เปิดเนื้อหาหนังสือทั่วไปทั้ง paged/continuous, เปลี่ยน font `system`/`sans` ได้ stack ใหม่, `serif` ยังใช้ serif
- [ ] ตรวจคำไทยที่มีหัว/สระบน/วรรณยุกต์/ตัวเลข/อังกฤษ: เปิด DevTools → Computed → Rendered Fonts เพื่อยืนยันว่าอักษรไทยใช้ font ใดจริง (อาจเป็น Sarabun fallback)
- [ ] Desktop flipbook: หลังโหลด web font จำนวนแผ่นอาจจัดใหม่ได้ แต่ข้อความครบ ไม่มีตัวอักษรล้น/หาย และตำแหน่งบทถูกต้อง
- [ ] iPhone PWA, Android touch และ iPad: ฟอนต์เนื้อหา/การแบ่งหน้าและการใช้งานเดิมต้องไม่เปลี่ยน
- [ ] หน้า UI, ปกหนังสือ, Search, Aa, ธีมกลางคืน, พอดแคสต์, การอ่านออกเสียง และการออฟไลน์ยังทำงาน
- [ ] บล็อก fonts.googleapis.com ใน DevTools: ข้อความยังอ่านได้ผ่าน Sarabun/system fallback
- [ ] แสดง v1.3.59 และตรวจว่าชุด shell ใน SW โหลดตรงกัน

## Rollback

Revert PR นี้ทั้งชุด; ไม่ลบข้อมูลการอ่านหรือ bookmarks. ไม่คัดลอกไฟล์ฟอนต์จาก SLP มายัง repo (ใช้ Google Fonts API ตามข้ออนุญาตของบริการ).
