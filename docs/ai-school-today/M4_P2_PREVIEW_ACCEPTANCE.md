# M4-P2 — Preview การอ่าน AI & School Today

**สถานะ:** สร้าง standalone interactive prototype แล้ว แต่ยังไม่ได้ทดสอบบนอุปกรณ์จริง และยังไม่เชื่อมเข้ากับ WD Books reader engine

## ไฟล์ Preview
- [เปิดต้นแบบ HTML](previews/M4_P2_READER_PREVIEW.html)
- แสดงเนื้อหาย่อ 13 ส่วนตาม M4-P1
- มีสารบัญเลือกส่วน, หน้าก่อน/ถัดไป, ปรับขนาดอักษร, โหมดกลางคืน, คีย์บอร์ดลูกศร, สารบัญมือถือ
- ไม่ใช้ข้อมูลเด็กจริง ไม่ส่งข้อมูลออกเครือข่าย และไม่เก็บ localStorage
- ไม่รวมเฉลยวิทยากร
- มีคำเตือนว่าเป็น Preview ไม่ใช่ฉบับผ่านตรวจรับ

## ขอบเขตที่ยังไม่ได้ทำ
- **ยังไม่ใช่** WD Books e-book engine: ต้นแบบเป็น HTML/CSS/JS แยก ไม่ได้ใช้ `assets/app.js`, `assets/manuals-data.js` หรือ `reader-coordinator.js`
- ยังไม่มีการเปิดหนังสือจากชั้นหนังสือหลัก/การบันทึกอ่านต่อ/การทำงาน offline ผ่าน service worker
- เนื้อหาในต้นแบบเป็น **สรุปสำหรับทดสอบ UX** ไม่ใช่เนื้อหาเต็ม 8 บท
- ยังไม่ได้ทดสอบบน Windows/iPhone/iPad หรือรัน smoke tests
- ยังไม่เพิ่มรายการหนังสือใน catalog และไม่เปลี่ยนเว็บ Production

## วิธีตรวจด้วย Windows Local-First
1. Checkout branch PR นี้ใน VS Code หรือเปิด worktree แยก
2. จาก root repository รัน `py -m http.server 4173 --bind 127.0.0.1`
3. เปิด `http://127.0.0.1:4173/docs/ai-school-today/previews/M4_P2_READER_PREVIEW.html`
4. ตรวจสารบัญครบ 13 ส่วน กดหน้าก่อน/ถัดไปจนถึงหน้าสุดท้าย
5. ทดสอบ viewport 390px, 768px และ desktop; เพิ่มอักษรสูงสุดและโหมดกลางคืน
6. ทดสอบ keyboard, focus, การอ่านข้อความไทย และไม่เกิด horizontal overflow
7. ตรวจ console error และไม่มี request ไปยังบริการ AI
8. ตรวจเว็บหลัก `/` ว่ายังเปิดหนังสือเดิมได้ตามปกติ

## ขั้นต่อไป
- รับข้อแก้ไขเรื่องเนื้อหาและ UX จากครู/ผู้ทดสอบ
- M4-P3 สร้าง **integration preview** ที่ใช้ schema `pages` และ reader engine จริงใน branch แยก หลังตรวจรายละเอียด schema และ regression tests
- ก่อน publish ต้องผ่าน content/privacy/device QA และอนุมัติแยก

> การ Merge PR ที่มี Preview เข้า main จะทำให้ไฟล์ HTML นี้เข้าถึงได้จาก public repository/Pages โดยตรง แม้ไม่ได้อยู่ใน catalog และแม้มี meta noindex; noindex **ไม่ใช่การจำกัดสิทธิ์**. ห้ามใส่ข้อมูลภายในหรือข้อมูลเด็กจริง
