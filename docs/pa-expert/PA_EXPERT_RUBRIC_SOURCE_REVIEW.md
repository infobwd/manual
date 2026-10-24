# PA Expert — Official Rubric Source Review
สถานะ: working reference / ตรวจสอบการแก้ไขล่าสุดก่อนใช้ยื่นจริง
แหล่งหลัก: สำนักงาน ก.ค.ศ. คู่มือ ว10/2564 (กันยายน 2564), https://www.otepc.go.th/th/pa-download/pa-manual/download/165/3885/17.html
ไฟล์ต้นฉบับที่ผู้ใช้แนบ: 2Mv10-2564.pdf (227 หน้า)
## ตำแหน่งที่ต้องเปิดตรวจ
- หลักเกณฑ์ผู้อำนวยการเชี่ยวชาญ: หน้าเลขพิมพ์ 33 เป็นต้นไป
- PA 2/บส ชำนาญการพิเศษ: หน้า 100 เป็นต้นไป (PA ประจำปีของวิทยฐานะเดิม)
- PA 4/บส เชี่ยวชาญ สังกัด สพฐ.: หน้า 152 เป็นต้นไป (ด้าน 1 และ 2)
- PA 5/บส/ชช: หน้า 218 เป็นต้นไป (ด้าน 3)
หมายเหตุ: เลขหน้าเป็นเลขในสารบัญ ไม่ใช่ลำดับหน้าของ PDF; ให้ตรวจจากแบบประเมินจริงก่อนลงคะแนน
## โครงสร้าง
ด้าน 1: ทักษะการวางแผนพัฒนาสถานศึกษา กลยุทธ์ เครื่องมือหรือนวัตกรรมการบริหาร
ด้าน 2: ผลลัพธ์ในการพัฒนาการบริหารสถานศึกษา
ด้าน 3: ผลงานทางวิชาการ (วิทยฐานะเชี่ยวชาญ)
## กฎการใช้
1. แยกข้อกำหนด ก.ค.ศ. ออกจาก checklist วิเคราะห์ภายในอย่างชัดเจน
2. ไม่ใช้ผลงานหรือกิจกรรมแทนหลักฐานผลลัพธ์ที่ตรวจสอบได้
3. ทุกข้อเก็บหน้าเอกสาร ข้อความเกณฑ์ หลักฐาน ตัวชี้วัด และสถานะการตรวจทาน
4. ยังไม่ยืนยันว่าคู่มือ 2564 ครอบคลุมหนังสือแก้ไขทุกฉบับถึง ต.ค. 2569
5. ไม่จัดเก็บข้อมูลระบุตัวนักเรียนใน repo

## Cross-PR reconciliation / source precedence (24 ต.ค. 2569)

**สถานะ: REVIEW REQUIRED — ยังไม่ผ่าน M0-A LOCK; ไม่เผยแพร่เป็น e-book**

- **แผนแม่บทที่ main:** [WD_PRINCIPAL_EXPERT_RANK_MASTER_PLAN_2570.md](../WD_PRINCIPAL_EXPERT_RANK_MASTER_PLAN_2570.md) เป็นเจ้าของ roadmap M0–M6 และหลักการบริหาร
- **งาน M0 และกรณีศึกษาผู้ผ่าน (PR #75):** [M0 research](https://github.com/infobwd/manual/pull/75) เป็นเจ้าของ criteria research / exemplar ledger; ยังเปิด PR อยู่และมี **ทะเบียน 60 ช่องซ้ำ** ซึ่งต้องเปลี่ยนเป็นลิงก์มายัง matrix ใน PR #76 ก่อน merge #75
- **PR #76:** [M0_A_EXPERT_RUBRIC_MATRIX.md](M0_A_EXPERT_RUBRIC_MATRIX.md) เป็น **canonical register** สำหรับ 12 ตัวชี้วัดและ 60 จุดตรวจเท่านั้น; ไฟล์นี้เป็น source ledger ไม่ทำ rubric ซ้ำ
- **M1:** เปิดเอกสารและ PR แยกหลัง M0-A lock; ห้ามผสมผล audit จริงกับ placeholder

### Revision / precedence checks
| เอกสาร | แหล่งทางการ | ข้อควรตรวจ |
|---|---|---|
| ว 10/2564 | https://www.otepc.go.th/th/pa-download/pa-criteria/item/3369-10-2564.html | ต้นเกณฑ์ผู้บริหารสถานศึกษา |
| คู่มือ ว 10/2564 | https://otepc.go.th/images/00_YEAR2564/03_PV1/2Mv10-2564.pdf | PA 4/บส/ชช สพฐ. ต้องตรวจภาพหน้าจริง ไม่ถือสารบัญเป็น PDF index |
| ล 679/2566 | https://otepc.go.th/th/144-km/inforgraphics/5971-pa-3.html | ก.ค.ศ. ยืนยันมีการแก้เกณฑ์ **ตัดสิน** ด้าน 1–2; ต้องอ่านฉบับเต็ม |
| ล 1933/2567 | https://circular.otepc.go.th/v1_t_circualr_book_view.php?editid1=646 | ฉบับรวมแก้ไขสำหรับผู้บริหารสถานศึกษา |
| ล 1144/2567 | https://circular.otepc.go.th/v1_t_circualr_book_view.php?editid1=632 | แก้ไขตัวชี้วัด; ต้องตรวจว่ากระทบ D1/D2 อย่างไร |
| ล 1222/2568 | https://otepc.go.th/th/144-km/inforgraphics/5971-pa-3.html | แก้ข้อกำหนดด้าน 3; ตรวจแยกจาก M0-A |
| ว 17/2567 | https://otepc.go.th/th/144-km/inforgraphics/5971-pa-3.html | ตรวจความซ้ำซ้อนผลงานทางวิชาการ |

**กฎ:** ใช้ถ้อยคำฉบับแก้ไขที่มีผลในวันยื่นเหนือข้อความเดิมที่ขัดกัน; หน้าเว็บไซต์/infographic ยืนยันการมีอยู่ของเอกสาร ไม่แทนเนื้อหาข้อบังคับ.

**Validation fields ต่อหนึ่ง subitem:** `ID | official wording | document/version | URL | printed page | PDF page | scoring rule | evidence | reviewer | date | status`; สถานะ `PENDING_SOURCE / VERIFIED_ORIGINAL / VERIFIED_AMENDED / SUPERSEDED`. ขณะนี้ **60/60 ยังเป็น placeholder**; ไม่ควรตีความว่า 60 รายการได้รับการยืนยัน.

**ต้องปิดก่อนเสนอ Merge:** อ่านต้นฉบับ PA 4/บส/ชช รายข้อ, ตรวจแก้ไข ล 679/2566 และ ล 1144/2567 กับ ล 1933/2567, ตรวจคะแนนผ่านที่แก้ไข, peer review, แก้ PR #75 ให้ link กลับ canonical, ขอเจ้าของงานตรวจรับ. **ห้ามเผยแพร่ e-book / Pages / production**.

**ข้อจำกัดไฟล์:** PR #76 ปัจจุบันเพิ่ม Markdown 2 ไฟล์เท่านั้น ไม่ได้แนบ PDF ต้นฉบับ แม้ข้อความเดิมอ้างว่าเคยมีผู้ใช้แนบ PDF ในอีกงาน จึงยังไม่ถือว่าถอด rubric จาก PDF ได้จริง.
