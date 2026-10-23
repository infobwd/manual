# WD Books — Stage 2: ทะเบียนหลักฐานกลาง (Evidence Registry)

**สถานะ:** Design / Documentation only — ยังไม่ใช่ระบบจัดเก็บข้อมูลจริง และยังไม่เปิดให้กรอกหลักฐานบนเว็บไซต์สาธารณะ
**เป้าหมาย:** ใช้หลักฐานจากงานประจำหนึ่งชิ้นเชื่อมหลายวัตถุประสงค์ โดยไม่สร้างสำเนาเอกสารซ้ำหรืออ้างผลเกินหลักฐาน

## 1. ขอบเขตและที่จัดเก็บ
- `infobwd/manual` (public) เก็บเฉพาะ **schema, คู่มือ, ตัวอย่างข้อมูลสมมติ, รหัสเกณฑ์ที่ไม่ระบุตัวบุคคล**; ห้ามเก็บไฟล์นักเรียน/บุคลากร/ผลประเมินรายบุคคล/URL ลับ/โทเคน
- เอกสารต้นฉบับเก็บในพื้นที่ควบคุมสิทธิ์ของโรงเรียน (เช่น Drive ภายในหรือ host ที่มี RBAC และ backup); Registry เก็บเพียง reference ที่อนุญาตตามสิทธิ์
- ระบบ WD Growth `infobwd/wd-standard` เป็นแหล่งข้อมูลการพัฒนาผู้เรียนตามสถานะที่ตรวจรับจริง ไม่ถือว่าฐานข้อมูล production สมบูรณ์จนกว่าจะผ่าน acceptance

## 2. Schema ทะเบียนขั้นต่ำ
| Field | ความหมาย | ข้อบังคับ |
|---|---|---|
| evidence_id | รหัสหลักฐานถาวร ไม่ฝังชื่อเด็ก/บุคลากร | required, unique |
| title | ชื่อสั้นอธิบายหลักฐาน | required |
| workstream | WD_GROWTH / PLC / ID_PLAN / MENTOR / PA / SAR / QA / OTHER | required |
| evidence_type | plan / activity / result / reflection / governance | required |
| owner_role | teacher / plc_lead / principal / qa_officer | required |
| period | ปีการศึกษา/ปีงบประมาณ/รอบที่ชัดเจน | required |
| occurred_on | วันที่เกิดกิจกรรมจริง (ถ้าทราบ) | nullable |
| source_system | แหล่งต้นทาง เช่น WD Growth, paper, restricted Drive | required |
| source_ref | รหัสอ้างอิงภายในที่ไม่มีข้อมูลอ่อนไหว | required |
| source_version | รุ่น/วันที่/ลายมือชื่อรับรองต้นฉบับ | nullable |
| evidence_status | planned / in_progress / submitted / verified / rejected / superseded | required |
| verified_by_role | บทบาทผู้ตรวจ ไม่ใช่ชื่อเต็มใน public metadata | nullable |
| verified_at | วันที่ตรวจรับจริง | nullable |
| confidentiality | public_summary / internal / restricted | required |
| criterion_links | array ของ `framework_id, criterion_id, mapping_status, rationale` | required (may be empty) |
| outcome_note | สรุปผลที่ตรวจสอบได้ ไม่เผยแพร่ข้อมูลรายคน | nullable |
| next_review_on | วันทบทวน | nullable |

**กฎ:** `verified` ต้องมีหลักฐานต้นฉบับที่ตรวจสอบได้ + ผู้รับรอง/วันที่; `planned` ห้ามแสดงเป็นผลสำเร็จ. ไม่ใช้เลขที่นักเรียนใน public evidence_id. แยกสถานะ mapping: proposed / reviewed / approved; approved ต้องอ้างเกณฑ์ฉบับที่ตรวจสอบแล้ว.

## 3. Frameworks ที่จะทำ mapping (ห้ามอนุมานการผ่านเกณฑ์)
1. `TEACHER_PA` — ว 9/2564 และฉบับแก้ไขที่ใช้บังคับ
2. `ADMIN_PA` — หลักเกณฑ์ตำแหน่งผู้บริหารสถานศึกษาและฉบับแก้ไข
3. `W11_2569_DEV` — การพัฒนาผู้ใต้บังคับบัญชา/ID Plan/Mentor
4. `EXTERNAL_QA` — สมศ. รอบประเมินที่โรงเรียนเข้ารับจริง (ยังต้องยืนยันฉบับ/ตัวชี้วัด)
5. `EXPERT_PRINCIPAL` — เกณฑ์วิทยฐานะเชี่ยวชาญของผู้บริหารสถานศึกษาที่ใช้จริง (ต้องตรวจคุณสมบัติ/องค์ประกอบ/เงื่อนไขก่อน)

## 4. Evidence chain — เชื่อม WD Growth / PLC
`baseline_ref` → `individual_plan_ref` → `intervention_ref` → `plc_ref` → `retest_ref` → `mentor_ref` → `outcome_ref`.

หนึ่งหลักฐานอ้างหลายเกณฑ์ได้ผ่านตาราง mapping แยก; ไม่เปลี่ยนหลักฐานต้นทางเมื่อเกณฑ์เปลี่ยน. เก็บ lineage ของเครื่องมือประเมิน/version และตัวหารกลุ่มเป้าหมายก่อนเทียบผล. สรุปกลุ่มย่อยที่ระบุตัวบุคคลได้ต้องอยู่ภายในเท่านั้น.

## 5. Role and approval
- Teacher: เสนอ/แก้หลักฐานที่รับผิดชอบ; ยืนยันข้อมูลต้นทางตามสิทธิ์
- PLC lead: ตรวจความสอดคล้องกับบันทึก PLC
- QA officer: ทบทวน mapping ประกันคุณภาพตามกรอบจริง
- Principal: รับรองหลักฐานเชิงระบบ/กำกับดูแลและให้คำปรึกษา; ไม่ใช่ผู้อนุมัติอัตโนมัติทุกหลักฐาน
- Registry administrator: จัดการ version/backup/access log; ห้ามเปลี่ยนผลประเมินโดยไม่มี audit trail

## 6. Workflow
1. รับหลักฐานจากแหล่งเดิม → ตรวจความถูกต้องและความลับ
2. สร้าง metadata + evidence_id → สถานะ `submitted`
3. ผู้รับผิดชอบตรวจต้นฉบับ → `verified` หรือ `rejected` พร้อมเหตุผล
4. ผู้รับผิดชอบแต่ละ framework จับคู่เกณฑ์ → `proposed` → `reviewed` → `approved`
5. สร้าง export เฉพาะข้อมูล/ไฟล์ที่ผู้ขอมีสิทธิ์และตรงวัตถุประสงค์ พร้อมแหล่งอ้างอิงและ audit

## 7. Milestones และ acceptance
- **EVID-01 Design lock (PR นี้):** schema, privacy, role, workflow, example; ไม่มี Production mutation
- **EVID-02 Controlled prototype:** สร้าง registry ภายในพื้นที่ Private, ตรวจ RBAC, CRUD, audit, backup, version, dedup, export; ไม่ใช้ GitHub Public เป็นฐานข้อมูล
- **EVID-03 Pilot:** ใช้หลักฐานจริงเฉพาะที่ได้รับอนุญาตจาก WD Growth/PLC และผู้รับผิดชอบ ตรวจการโยงหลักฐานและ consent
- **EVID-04 Framework mapping:** ตรวจเกณฑ์ สมศ./ก.ค.ศ. ฉบับจริง, ผู้รับผิดชอบรับรอง mapping, สร้าง gap report
- **EVID-05 External QA / Expert dossier:** export แยกตามกรอบ, ห้ามอ้างว่าผ่านประเมินจากทะเบียนเพียงอย่างเดียว

## 8. ตัวอย่างสมมติ (ไม่ใช่ผลจริง)
```json
{
  "evidence_id": "EVD-2569-DEMO-001",
  "title": "วงจรปรับการสอนการอ่าน — ตัวอย่าง",
  "workstream": "PLC",
  "evidence_type": "reflection",
  "owner_role": "plc_lead",
  "period": "ปีการศึกษา 2569",
  "source_system": "paper",
  "source_ref": "DEMO-PLC-W7",
  "evidence_status": "planned",
  "verified_by_role": null,
  "verified_at": null,
  "confidentiality": "internal",
  "criterion_links": [
    {"framework_id":"W11_2569_DEV","criterion_id":"TO_VERIFY","mapping_status":"proposed","rationale":"ตัวอย่างการเชื่อม PLC กับการพัฒนาครู"}
  ],
  "outcome_note": null,
  "next_review_on": null
}
```

## 9. สิ่งที่ต้องตรวจต่อก่อนพัฒนา
- สถานที่เก็บต้นฉบับจริงและผู้ดูแลสิทธิ์
- แบบแผนพัฒนารายบุคคลและบันทึก PLC ที่ครูรับรอง
- เกณฑ์ประเมินภายนอก สมศ. และเกณฑ์ผู้บริหารเชี่ยวชาญฉบับที่ใช้จริง
- ระยะเก็บรักษา การลบ/แก้ไข การส่งออก และมาตรการข้อมูลส่วนบุคคล
