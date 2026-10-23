# WD Books 1.3.3 — QA Device Gate

สถานะ: **READY TO TEST / NOT TESTED**  
วันที่จัดทำ: 23 ตุลาคม 2569  
เว็บไซต์: https://infobwd.github.io/manual/

## อุปกรณ์ที่ต้องตรวจ

| อุปกรณ์ | Browser / โหมด | ผล |
|---|---|---|
| iPhone | Safari | NOT TESTED |
| iPhone | PWA จากหน้าจอโฮม | NOT TESTED |
| Android | Chrome | NOT TESTED |
| Android | PWA ที่ติดตั้งแล้ว | NOT TESTED |
| iPad | Safari หรือ PWA | NOT TESTED |
| Windows | Chrome หรือ Edge | NOT TESTED |

ให้ระบุรุ่นเครื่อง, OS, browser version, วันที่ และผู้ทดสอบก่อนกรอกผล

## รายการทดสอบ

| รหัส | ทดสอบ | เกณฑ์ผ่าน | ผล |
|---|---|---|---|
| Q01 | แตะหน้าปก ชื่อ คำอธิบาย และพื้นที่ว่างการ์ด | เปิดเล่มเดียวกัน | NOT TESTED |
| Q02 | แตะหัวใจบนการ์ด | เพิ่ม/ลบรายการโปรด ไม่เปิด Reader | NOT TESTED |
| Q03 | ทดสอบ draft และ Enter/Space | draft เปิดไม่ได้; keyboard ใช้ได้ | NOT TESTED |
| Q04 | ชื่อคู่มือ Reader ในโหมดสว่าง/ถนอมสายตา/มืด | อ่านชัด ไม่ชนปุ่ม | NOT TESTED |
| Q05 | ปรับ Aa และเปลี่ยน Paged/Continuous | ตัวเลือกทำงานและคงค่า | NOT TESTED |
| Q06 | คั่นหน้า 0/1/หลายเล่ม ค้นหา ยุบขยาย | เปิดตรงตอน ข้อมูลครบ | NOT TESTED |
| Q07 | ปิดแอปและเปิดใหม่ | ประวัติ คั่นหน้า ความคืบหน้ายังอยู่ | NOT TESTED |
| Q08 | คำแนะนำติดตั้งและเปิด PWA | แสดงตามอุปกรณ์ ไม่แสดงซ้ำใน PWA | NOT TESTED |
| Q09 | เปิดออนไลน์แล้วทดสอบออฟไลน์ | เปิด app shell และเนื้อหาที่แคชไว้ | NOT TESTED |
| Q10 | กลับมาออนไลน์และอัปเดตเวอร์ชัน | อัปเดตได้โดยข้อมูลไม่สูญหาย | NOT TESTED |
| Q11 | แนวนอน ตัวอักษรใหญ่ zoom 200% | ปุ่มและเนื้อหาไม่ถูกบัง | NOT TESTED |
| Q12 | VoiceOver / TalkBack / keyboard | อ่านชื่อปุ่มและนำทางได้ | NOT TESTED |
| Q13 | ค้นหาคู่มือและเนื้อหา | ค้นหาและนำทางถูกต้อง | NOT TESTED |

หากต้องทดสอบคั่นหน้า 50+ ตอน ให้ใช้ข้อมูลจำลองในสภาพแวดล้อมแยก และห้ามเขียนทับข้อมูลจริงในเครื่องผู้ใช้

## บันทึกผล

| เครื่อง/OS/Browser | รหัส | PASS/FAIL/BLOCKED | ผลจริง/ขั้นตอนทำซ้ำ | ภาพหลักฐาน |
|---|---|---|---|---|
| รอกรอก | — | NOT TESTED | — | — |

## เกณฑ์ตัดสิน

GO: ทดสอบ critical flows จริงบน iPhone, Android และ desktop โดยไม่มี critical FAIL  
NO-GO: พบการสูญหายข้อมูล เปิดคู่มือไม่ได้ หรือคั่นหน้าใช้งานไม่ได้  
PENDING: ยังไม่มีผลทดสอบจริง

**ผลปัจจุบัน: PENDING**  
ผู้ตรวจรับ: __________ วันที่: __________  
งานถัดไปเมื่อผ่าน Gate: UX-SEARCH-HIGHLIGHT

## Closure decision — 23 ต.ค. 2569

ผู้ใช้อนุญาตให้ **ปิดรายการทดสอบที่ค้างเพื่อดำเนินงานถัดไป** จึงปิดการติดตาม Gate ในเชิงกระบวนงาน (administrative closure) และอนุญาตให้เริ่ม UX-SEARCH-HIGHLIGHT โดย **ไม่ได้เปลี่ยนผล NOT TESTED เป็น PASS**

- ยืนยันผ่านจากผู้ใช้: UX-READER-CONTRAST (ภาพบนอุปกรณ์), UX-HEART (ขนาดและรูปลักษณ์)
- Q01–Q03, Q05–Q13 และ device matrix ที่ไม่มีหลักฐาน: **NOT TESTED / residual risk accepted for progression**
- Q04: **PARTIAL PASS** เฉพาะภาพที่ผู้ใช้ยืนยัน ไม่ครอบคลุมทุกธีม/ทุกอุปกรณ์
- ความเสี่ยงคงเหลือ: offline/cache, data persistence, keyboard/screen reader, PWA installation; ต้องทดสอบเมื่อมีอุปกรณ์และหลักฐาน ไม่กล่าวอ้างว่าผ่าน
- Gate decision: **CONDITIONAL GO (user-authorized)** สำหรับเริ่มพัฒนาคิว 4; ไม่ใช่ใบรับรอง QA ครบ
