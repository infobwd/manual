# WD Books — FLIP-06 แก้ปุ่มพลิกกระดาษไม่ปรากฏใน PWA (28 ต.ค. 2569)

**สถานะ:** FIX / เผยแพร่เฉพาะหนึ่งเล่มที่เคยทดสอบ, Reader เดิมยังเป็นค่าเริ่มต้น  
**Issue:** เปิด WD Books บน iPhone PWA v1.3.56 แล้วไม่พบปุ่ม “พลิกกระดาษ” ในเมนู ⋯ แม้เปิดหนังสือทดลองที่ถูกต้อง

## สาเหตุ (ยืนยันจาก source)

FLIP-05 ใช้ `new URLSearchParams(window.location.search).get("flip05") === "1"` เป็นเงื่อนไขใน `eligibleFlipbook`. การเปิดจากไอคอน PWA ปกติไม่มี query parameter นี้ จึงซ่อนปุ่มไว้ด้วย `flipChoice.hidden = !eligibleFlipbook(book)`. เวอร์ชัน v1.3.56 แสดงในภาพผู้ใช้แล้ว จึงไม่ใช่ปัญหาที่ต้องล้างข้อมูลหรือถอนการติดตั้ง.

## การแก้ไข

1. ตัดเงื่อนไข URL flag ออก; ยังคงตรวจ book ID `ai-five-questions-speaker-cheatsheet-25691026`, `status="published"` และ `pages.length > 0` — หนังสืออื่นยังไม่เห็นปุ่ม
2. ย้ายปุ่มเข้า **รายการแรก** ของ `readerExtraTools` (เมนู ⋯) ปรับลักษณะให้เด่นขึ้นบนมือถือ โดยไม่ทำให้ปุ่มอื่นหาย
3. ถ้าออฟไลน์ ปุ่มจะ disabled และยังอ่านแบบปกติได้ตามเดิม (ไม่แอบเปิด iframe ว่าง)
4. คงข้อความรับข้อมูล chapter เดิมที่ตรวจ origin, frame, book ID, integer range ก่อนกลับ Reader เดิม; ไม่สร้าง storage key ใหม่และไม่แตะเสียงอ่าน/Podcast
5. ออกเวอร์ชัน `1.3.57` ให้ `app-version.js`, `index.html` และ `sw.js` ตรงกัน เพื่อให้ PWA ตรวจการอัปเดตตามกลไกเดิม

## Validation

- ผ่าน contract smoke ของ FLIP-06: PWA URL ที่ไม่มี query flag, จำกัดแค่เล่มเดียว, ปุ่มอยู่ต้นเมนู, เวอร์ชัน PWA สอดคล้อง, safe message bridge
- ผ่าน dynamic bridge behavior: เปิดโดยไม่มี flag, ป้องกันหนังสืออื่น, modal open/close, origin/source/book/chapter validation, offline disabled และกลับไปอ่านเดิม
- ไฟล์ JavaScript 17 ไฟล์บนหน้าแรกผ่าน syntax และถูกประกาศใน Service Worker shell ครบ
- **ยังต้องตรวจ UI บนเครื่องจริงหลัง deploy** โดยเฉพาะ iPhone PWA เมื่ออัปเดตเป็น 1.3.57 แล้ว

## ขั้นตอนตรวจบน iPhone

1. เปิด WD Books PWA จากไอคอนหน้า Home Screen; ไปที่เมนูตั้งค่า → ตรวจสอบอัปเดตจนเห็นเวอร์ชัน **1.3.57**
2. เปิด “5 คำถามชวนคิด เมื่อ AI เข้ามาในโรงเรียน — ชีทโน้ตผู้บรรยาย”, กด ⋯
3. เห็นปุ่ม **📖 พลิกกระดาษ** เป็นรายการแรก; แตะเพื่อเปิดโหมดพลิก
4. พลิกหน้า → “กลับไปอ่าน”; Reader เดิมพร้อมตำแหน่งบทและเสียงอ่านยังใช้งานได้
5. เปิดเล่มอื่น (เช่นคู่มือฝึกพูด 7 คำถาม) → **ไม่เห็น** ปุ่มพลิกกระดาษ
6. หากยังเห็น 1.3.56 ให้กด “ตรวจสอบอัปเดต” และยืนยันการเปลี่ยนรุ่นผ่าน UI; ไม่ลบ localStorage, bookmark หรือรีเซ็ตแอป

## Rollback

Revert PR FLIP-06 เฉพาะไฟล์ที่เปลี่ยน; ห้ามลบข้อมูลในอุปกรณ์. Reader เดิมและ FLIP-04 standalone preview ใช้งานได้แม้ไม่มีปุ่มทดลอง.
