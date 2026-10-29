# WD Growth Insights — Source Audit Matrix ป.1–ป.5

วันที่ตรวจ 29 ต.ค. 2569 | **การตรวจนี้เป็นการอ่านเอกสาร Repository ไม่ใช่การตรวจ Host สด**

| ชั้น | หลักฐานที่พบใน wd-standard | สถานะข้อมูลที่จะเผยแพร่ | สิ่งที่ต้องตรวจต่อ |
|---|---|---|---|
| ป.1 | มีโครงสร้างข้อสอบและแผน Host-first ระบุ Draft ป.1 | ยังไม่ยืนยัน aggregate | เทียบ draft/host และครูตรวจรับรายทักษะ |
| ป.2 | มีโครงสร้างข้อสอบและแผน Host-first ระบุ Draft ป.2 | ยังไม่ยืนยัน aggregate | เทียบ draft/host และครูตรวจรับรายทักษะ |
| ป.3 | มีโครงสร้างข้อสอบและแผน Host-first ระบุ Draft ป.3; เคยมีความไม่ตรงของจำนวนแบบกับทะเบียน | ยังไม่ยืนยัน aggregate | reconcile จำนวนผู้เรียน/คะแนนขัดแย้ง/ครูรับรอง |
| ป.4 | พบโครงสร้างข้อสอบ ป.4 แต่ยังไม่ได้ยืนยันไฟล์ผลจริงในรอบนี้ | ยังไม่ยืนยัน aggregate | ค้น data source และสถานะ Host canonical |
| ป.5 | มี paper intake/reconciliation รอบ 1–2 จาก 23 ภาพ; ยังมี PENDING | DRAFT ไม่ใช่ canonical | ตรวจคะแนนรายข้อและ missing โดยครู |

**ข้อควรระวัง:** แผน Host-first ลงวันที่ 18 ต.ค. 2569 เป็นหลักฐานประวัติ ไม่ใช่สถานะ Host ปัจจุบัน; ห้ามตีความว่า Production ยังไม่พร้อมหรือพร้อมแล้วโดยไม่ตรวจจริง. ตัวเลขทะเบียนที่อยู่ใน SQL snapshot เก่าไม่ใช่จำนวนนักเรียนปัจจุบัน.

## ลำดับการยืนยัน
1. อ่าน source snapshot ล่าสุดและแผน version ของข้อสอบแต่ละชั้น
2. ใช้ Host read-only ตรวจจำนวนผู้มีสิทธิ์และผลที่ครูรับรองโดยไม่ดึงชื่อเด็กไป Public Repo
3. ให้ฝ่ายวิชาการตรวจทาน aggregate และขนาดกลุ่มก่อนอนุมัติเผยแพร่
4. อัปเดตหนังสือรายชั้นและ Dashboard ด้วยสถิติที่อนุมัติพร้อมวันที่และตัวหาร

อ้างอิง: `infobwd/wd-standard/docs/WD_GROWTH_HOST_FIRST_PILOT_PLAN_2569.md`, `WD_GROWTH_BASELINE_A_PRIMARY_FORMS.md`, `WD_GROWTH_P5_BASELINE_A1_RECONCILIATION_ROUND2_2569.md`.
