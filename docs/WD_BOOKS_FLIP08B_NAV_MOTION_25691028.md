# FLIP-08B — แถบนำทางแถวเดียว + แสดงสถานะโมชั่นชัดเจน (28 ต.ค. 2569)

## ปัญหาที่ตรวจจาก iPhone PWA v1.3.61
- “กลับไปอ่าน” แยกออกเป็นแถวล่างอีกแถว ทำให้เนื้อหาเสียความสูงและคนอ่านต้องมองสองแถว
- “โมชั่น” มีสีคล้ายกันในโหมดมืด ไม่ชัดว่ากดแล้วเปิด/ปิดการลดแอนิเมชัน

## แนวทางและขอบเขต
- รุ่นเป้าหมาย **1.3.63** (รักษาเนื้อหาคู่มือนิเทศที่เพิ่มแล้วใน 1.3.62)
- เฉพาะ mobile iframe แนวตั้งกว้างไม่เกิน 690px: จัดแถบนำทางเดียว **ก่อนหน้า | เลขหน้า | ถัดไป | กลับไปอ่าน** ด้วย CSS grid 4 ช่อง; ปุ่มสูงอย่างน้อย 48px และเคารพพื้นที่ home indicator
- ปุ่มกลับใน iframe ส่ง `wd:flip08b:exit` พร้อมเลขบทไปที่ parent โดย `postMessage` ที่ origin เดียวกัน; parent ตรวจ origin, frame, bookId ก่อนปิด modal ผ่าน lifecycle เดิมเพื่อคืน focus/ตำแหน่งอ่าน
- ปุ่ม × มุมขวาบนของ parent ยังอยู่สำหรับกรณี iframe เปิดไม่ได้หรือผู้ใช้ใช้คีย์บอร์ด; ไม่สร้างแถบล่างซ้ำ
- Motion สองสถานะมี `aria-pressed`, `aria-label`, title ตรงกัน: แอนิเมชันปกติ “โมชั่น”; เมื่อเปิดลดการเคลื่อนไหวใช้ “⏸ ลดแล้ว” พร้อมสี/ขอบตัดกันชัดเจนรวมถึงโหมดมืด; ไม่แตะสวิตช์โหมดสีเดิม
- ไม่แตะเนื้อหาหนังสือ, self-hosted flip engine, font, ปุ่มหน้าก่อน/ถัดไป, ธีมที่บันทึกเดิม, พอดแคสต์ และ service worker offline scope เดิม
- บังคับ cache bust `corner.css`/`corner.js` 1.3.63, release version หน้า splash / SW ตรงกัน

## QA gates
`node tests/flip08b-inline-exit-motion.smoke.cjs`, `node tests/flipbook-reader-bridge.behavior.cjs`, `node tests/flip08a-thumb-theme.smoke.cjs`, `node tests/flip08-pwa-navigation.smoke.cjs`, `node tests/flipbook-corner.smoke.cjs`, `node tests/flipbook-reader-choice.smoke.cjs`.

ตรวจเครื่องจริงหลัง deploy บน iPhone PWA 390×844 และ iPad แนวตั้ง: 4 ช่องไม่ล้น, อ่านเลขหน้าชัด, ปุ่มกลับทำงานและจำตำแหน่งบท, ปุ่มโมชั่นกดแล้วเห็น “ลดแล้ว” ชัดในโหมดมืด, แตะอีกทีคืน “โมชั่น”, สลับ ☾/☀ ไม่เปลี่ยนสถานะโมชั่น, โหมดแคบ/แนวนอนมี parent × สำรอง.

**Rollback**: revert FLIP-08B; ไม่ล้างข้อมูลผู้ใช้หรือ localStorage.
