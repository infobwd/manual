# QA — WD Books Expert Domain 3 Source Review (28 ต.ค. 2569)

**Release candidate:** 1.3.55 · **Branch:** `docs/expert-domain3-20261026-rubric-review` · **Status:** PENDING REVIEW; ไม่ใช่ยืนยันว่าใช้เกณฑ์ยื่นจริง

## Static review ที่ตรวจแล้ว
- [x] เพิ่มรายการเล่ม `principal-expert-domain3-rubric-20261026-review` เพียง 1 ครั้งใน `assets/manuals-data.js`; มี 10 หน้า, สถานะ `published`, หมวด `administration` และข้อความเตือน Source Lock หน้าแรก/ท้ายเล่ม
- [x] มีแหล่งอ้างอิงสแกนห้าหน้าเฉพาะรายละเอียดที่อ่านได้ ไม่แนบ PDF ที่ผู้ใช้ให้เข้า repository public
- [x] ระบุ 60:40 และคะแนนรายการ 25/20/10/5+20/20 ตามเชี่ยวชาญหน้า 1–2; ไม่ย้าย TCI เชี่ยวชาญพิเศษมาใช้กับเชี่ยวชาญ
- [x] คงประวัติ rubric 50:50 ใน M0 และบันทึกข้อมูลใหม่เป็น `PENDING OFFICIAL LOCK`
- [x] เพิ่มเอกสาร matrix แผนเตรียมหลักฐาน และเชื่อมโยงใน master plan / M0
- [x] เพิ่ม `WD_BOOKS_VERSION` จาก 1.3.54 เป็น 1.3.55 เพื่อให้ PWA ตรวจรุ่นใหม่เมื่อ Merge

## Gate ก่อน Merge / เผยแพร่
- [ ] **Source verification:** ตรวจต้นฉบับหนังสือ ศธ 0206.3/555 และเอกสารแนบของ ก.ค.ศ. รวมวันมีผลใช้บังคับ; หากยังหาไม่ได้ให้ระบุสถานะ Pending บนทุกช่องทาง และห้ามอ้างว่าเป็นเกณฑ์ปัจจุบันอย่างเป็นทางการ
- [ ] **Syntax:** รัน `node --check assets/manuals-data.js`, `node --check assets/app-version.js` และ smoke tests ที่มีใน repo บนเครื่องหรือ CI ก่อน Merge
- [ ] **Reader:** เปิดเล่มใหม่ 10 หน้าใน preview/หลังเผยแพร่; ทดสอบอ่านหน้า 1–10, สารบัญ, เปลี่ยนหน้าจอ, dark/light, ปรับ Aa และกลับชั้นหนังสือ
- [ ] **Mobile:** iPhone PWA / Safari, Android Chrome และ iPad portrait/landscape; ไม่ตัดข้อความ/ปุ่ม และไม่มี horizontal overflow
- [ ] **Audio:** เสียงอ่านภาษาไทยของเล่มใหม่ไม่อ่าน Markdown markers แบบดอกจัน; ไม่กดเล่นเสียงเอง
- [ ] **PWA update:** 1.3.54 → 1.3.55 แจ้งอัปเดตเมื่อ online; favorites/อ่านค้าง/ตำแหน่งเสียงเดิมไม่หาย; service worker ยังขอความยินยอมก่อน activate
- [ ] **Security:** ไม่มีข้อมูลเด็ก ครู หรือเอกสารที่มีข้อจำกัดสิทธิ์ในเล่มและ commit

## ไม่อยู่ในขอบเขต
ไม่เปลี่ยนแปลง DPA, หลักเกณฑ์ด้าน 1–2, การรับรองคุณสมบัติ, คะแนนผ่าน, โครงสร้างฐานข้อมูล หรือ Production ของ WD Growth/PLC. ไม่ Merge อัตโนมัติ; เปิดเป็น PR เพื่อทบทวน.
