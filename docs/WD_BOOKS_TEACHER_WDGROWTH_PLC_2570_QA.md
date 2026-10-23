# QA — คู่มือครู WD Growth + PLC 7 สัปดาห์

## Source of truth
- `infobwd/wd-standard/docs/WD_GROWTH_MASTER_PLAN.md` — Operating Model ครู/ผู้บริหาร/ผู้ปกครอง/PLC, Baseline→แผนรายทักษะ→Retest, ตัวชี้วัด proposed
- `infobwd/wd-standard/docs/WD_GROWTH_ASSESSMENT_DESIGN.md` — แยก Baseline/practice/formative/retest, ประเมินตามวัย, เทียบเครื่องมือ
- `infobwd/manual/docs/WD_BOOKS_INTEGRATED_TEACHER_ADMIN_PLC_QA_EXPERT_2570_PLAN.md` — แผนเชื่อมหลักฐานงานจริงกับ PA/ประกันคุณภาพ/วิทยฐานะ

## Change
เพิ่มหน้า 13–18 ในคู่มือ PA ครูเดิม รวม 18 หน้า โดยไม่แก้คู่มือผู้บริหาร ไม่แก้ reader storage หรือโค้ด UI. ตัวอย่างผู้เรียนเป็นข้อมูลสมมติ ไม่เปิดเผยชื่อหรือคะแนนจริง.

## Acceptance
- ตรวจความสอดคล้องกับแบบแผนพัฒนาผู้เรียนรายบุคคลฉบับที่โรงเรียนรับรอง
- ตรวจ PLC 7 สัปดาห์จากบันทึกปฏิบัติจริง; ตารางสัปดาห์ในคู่มือยังเป็น **ตัวอย่างเสนอ** ไม่ใช่คำยืนยันว่าดำเนินการแล้ว
- ตรวจข้อมูลส่วนบุคคล/ข้อสอบ/ผลรายคนไม่ถูกเผยแพร่
- ทดสอบอ่าน 18 หน้า, resume, bookmarks, font scaling, night/sepia, offline บน iPhone/iPad
- ตรวจเกณฑ์ PA/ID Plan/ว 11/2569 ฉบับเต็มกับงานบุคคลก่อนใช้ยื่นราชการ
- JS syntax check: new Function(manuals-data.js) ผ่านในการจัดทำ PR; ยังไม่ได้ทดสอบ browser/device จริง
