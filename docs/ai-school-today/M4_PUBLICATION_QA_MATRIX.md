# M4 — QA Matrix และ Rollback สำหรับเพิ่มหนังสือ AI & School Today

สถานะ: แผนตรวจรับก่อนพัฒนาเว็บจริง

| Gate | การตรวจ | หลักฐานที่ต้องได้ | สถานะ |
|---|---|---|---|
| G1 Content | 8 บท/ตัวอย่าง/แบบฟอร์มถูกต้อง | ผู้รับผิดชอบลงผลตรวจ | Pending |
| G2 Privacy | ไม่มีข้อมูลเด็กจริง/ข้อมูลจำกัดสิทธิ์ | Public-safe checklist | Pending |
| G3 Catalog | ID ไม่ซ้ำ หมวด/แท็ก/สถานะถูกต้อง | ตรวจ source + smoke test | Pending |
| G4 Reader | เปิดอ่าน/สารบัญ/อ่านต่อ/ปุ่มปิด | ภาพและบันทึกทดสอบ | Pending |
| G5 PWA | ติดตั้ง/offline/update cache | บันทึกอุปกรณ์และผล | Pending |
| G6 Accessibility | คีย์บอร์ด/ปรับอักษร/contrast | Checklist บนอุปกรณ์ | Pending |
| G7 Publish | ผู้รับผิดชอบอนุมัติ | การอนุมัติแยก | Pending |

## Local-First QA
```powershell
py -m http.server 4173 --bind 127.0.0.1
node tests/library.smoke.cjs
node tests/pwa-reader.smoke.cjs
node tests/home-p0a.smoke.cjs
```
รันจาก root ของ repository; หากไฟล์ทดสอบถูกย้ายในอนาคตต้องตรวจ path ก่อน ห้ามรายงาน PASS หากไม่ได้รันจริง

## Rollback Plan
1. บันทึก commit SHA ก่อนแก้ catalog และบันทึก PR ที่เพิ่มเล่ม
2. หากพบปัญหาหลัง Merge ให้ revert เฉพาะ commit ที่เพิ่มรายการหนังสือและ assets ที่เกี่ยวข้อง
3. ตรวจว่าเล่มเดิมยังเปิดได้และ service worker รับ version ใหม่ตามกลไกเดิม
4. ยืนยัน Pages อัปเดตแล้วบนมือถือ/แท็บเล็ต/desktop และไม่มีข้อมูลลับถูกเผยแพร่
5. หากมีการเปิดเผยข้อมูลส่วนบุคคล ให้ปฏิบัติตามกระบวนการรับมือเหตุข้อมูลรั่วไหลของหน่วยงานทันที; การ revert ไม่ลบประวัติ Git สาธารณะ

**ข้อกำกับ:** ยังไม่มีผลการรัน test หรือภาพตรวจรับจริงใน M4 รอบนี้
