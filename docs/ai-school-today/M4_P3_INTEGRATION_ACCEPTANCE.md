# M4-P3 — Integration Preview บน WD Books Reader

**สถานะ:** Prototype ใน branch ทดสอบ — ยังไม่ได้รันบนเบราว์เซอร์หรืออุปกรณ์จริง

## ไฟล์
- [เปิดหน้า Integration Preview](previews/M4_P3_WD_BOOKS_INTEGRATION.html)
- [ชุดข้อมูลหนังสือฉบับทดลอง](previews/m4-p3-preview-inject.js)

## กลไก
1. หน้า Preview โหลด `index.html` ที่มีอยู่จริงผ่าน local HTTP
2. สร้างเอกสาร iframe แยก และใช้ `<base>` ให้โหลด assets ของ WD Books เดิม
3. แทรกหนังสือ `ai-school-today-preview` จำนวน 13 หน้า **ในหน่วยความจำ iframe ก่อน `assets/app.js` เริ่มทำงาน**
4. ทดสอบด้วย UI catalog, reader, TOC และกลไกอ่านต่อที่มีอยู่จริง
5. **ไม่เขียนแก้** `assets/manuals-data.js`, `index.html`, `sw.js`, `manifest.webmanifest` หรือหนังสือที่เผยแพร่แล้ว

## ข้อจำกัด/ความเสี่ยงที่ต้องตรวจ
- iframe ใช้ `srcdoc` และโหลดสคริปต์ของเว็บจริง; การทำงานของ localStorage/service worker ใน iframe ขึ้นกับ origin/browser จึง **ยังไม่รับรองว่าแยก state หรือ service worker ได้สมบูรณ์**. ทดสอบด้วย browser profile แยกหรือ Incognito และห้ามใช้ข้อมูลจริง
- `noindex` ไม่ใช่การปิดสิทธิ์; หาก Merge จะเป็นไฟล์สาธารณะ
- Preview แสดง **เนื้อหาสรุปเพื่อทดสอบ** ไม่ใช่ฉบับตรวจรับเต็ม 8 บท
- ต้องตรวจว่า injection ทำงานจริงก่อนเชื่อผล UI; หากไม่เห็นรายการ AI & School Today ให้ถือว่า FAIL
- การทดสอบ offline/update SW จริงต้องใช้สภาพแวดล้อมแยกที่ควบคุมได้ ไม่ใช้ Production เป็นพื้นที่ทดลอง

## วิธีทดสอบ Local-First
```powershell
py -m http.server 4173 --bind 127.0.0.1
```
เปิด `http://127.0.0.1:4173/docs/ai-school-today/previews/M4_P3_WD_BOOKS_INTEGRATION.html`

### Checklist
- [ ] มีหนังสือ AI & School Today — Integration Preview เพิ่ม 1 เล่มใน iframe เท่านั้น
- [ ] หนังสือเดิมยังมีครบและเปิดอ่านได้
- [ ] ค้นคำว่า AI, PLC และเลือกหมวดครูพบหนังสือใหม่
- [ ] เปิดเล่มและตรวจสารบัญครบ 13 หน้า
- [ ] พลิกหน้า desktop/iPhone/iPad และปุ่มปิดอ่านทำงาน
- [ ] ทดสอบอ่านต่อ/หนังสือของฉัน **ใน profile แยก**
- [ ] ไม่มี error ใน Console
- [ ] กลับไปเปิด root `/` แล้วไม่พบหนังสือ Preview ใน catalog จริง
- [ ] ตรวจผล smoke tests ของ repo และบันทึก SHA/สภาพแวดล้อม
- [ ] ทดสอบ PWA offline/cache ในพื้นที่แยกหลังตรวจเรื่อง SW

## Gate
**ยังไม่ผ่าน** Device QA, PWA QA, Content QA หรือ Publish Approval; ไม่ควร Merge โค้ดที่แก้ catalog จริงจนกว่าจะผ่าน Gate เหล่านี้
