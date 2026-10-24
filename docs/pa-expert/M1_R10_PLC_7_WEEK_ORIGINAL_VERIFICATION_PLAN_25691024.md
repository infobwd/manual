# M1-R10 — แผนตรวจรับและเชื่อมโยงหลักฐาน PLC 7 สัปดาห์ (24 ต.ค. 2569)

## สถานะตั้งต้น
ผู้บริหารยืนยันในบทสนทนาว่า **ดำเนิน PLC ครบ 7 สัปดาห์และมีบันทึกจริง** (OWNER_REPORTED_COMPLETE). การยืนยันนี้เป็นข้อมูลสถานะจากผู้บริหาร ไม่ใช่ผลตรวจต้นฉบับใน Repository หรือการรับรองตามเกณฑ์ ก.ค.ศ. สถานะต้นฉบับยัง **NOT_VERIFIED**; การรับรอง **NOT_ACCEPTED**; Source Lock ของหลักเกณฑ์และฉบับแก้ไขยัง **BLOCKED_AMENDMENTS**.

## หลักการ
- ต้นฉบับ PLC และเอกสารลงนาม/ชื่อบุคคล/ข้อมูลผู้เรียนอยู่ในพื้นที่ **Private** ที่โรงเรียนกำหนดเท่านั้น
- Public repo นี้เก็บเฉพาะ checklist, วิธีตรวจ และผลสรุปที่ผ่านอนุมัติและไม่เปิดเผยข้อมูลบุคคล
- ห้ามแก้ย้อนหลัง สร้างบันทึกสมมติ หรือถือว่าการมีรายงานครบ 7 ฉบับพิสูจน์ผลลัพธ์ผู้เรียน
- ตรวจความสอดคล้องกับเกณฑ์ ก.ค.ศ. ฉบับใช้จริงก่อนเชื่อมรายเกณฑ์

## ขั้นตอน R10A–R10E
| ขั้น | งาน | สิ่งส่งมอบ | Gate |
|---|---|---|---|
| R10A | รับ/ตรวจต้นฉบับ PLC 7 ครั้งตามวันและฉบับจริง | Private register 7 records พร้อมผู้รับผิดชอบ/การรับรอง | Original authenticity + completeness |
| R10B | ถอดกระบวนการ ปัญหา-แนวทาง-ลงมือทำ-ทบทวนผล | Public-safe synthesis หลังอนุมัติ | No invented causal claims |
| R10C | เชื่อม PLC กับ coaching, teacher action, principal decisions, WD Growth | Evidence chain with provenance in Private | Links verified independently |
| R10D | ตรวจ criterion crosswalk โดยยึด rubric ฉบับล็อก | Draft mapping พร้อม gaps/limits | Source Lock before acceptance |
| R10E | จัดชุดหลักฐานผู้ประเมินแบบแยกชั้นสิทธิ์ | Private originals + approved redacted index | Formal approval required |

## R10A — Checklist รายสัปดาห์
ใช้รายการนี้ **ในพื้นที่ Private** โดยไม่กรอกข้อมูลจริงลงไฟล์สาธารณะ

| รอบ | วันที่ดำเนินการจริง | บันทึกการประชุม | ผู้ร่วม/ผู้รับรอง | ปัญหา/เป้าหมาย | มติ/กิจกรรม | ติดตามรอบถัดไป | ต้นฉบับตรวจแล้ว |
|---|---|---|---|---|---|---|---|
| W1 | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | NOT_VERIFIED |
| W2 | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | NOT_VERIFIED |
| W3 | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | NOT_VERIFIED |
| W4 | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | NOT_VERIFIED |
| W5 | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | NOT_VERIFIED |
| W6 | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | NOT_VERIFIED |
| W7 | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | NOT_VERIFIED |

**ต้องตรวจเพิ่มเติม:** เลขฉบับ/วันสร้างเอกสาร, ผู้รับผิดชอบ, ความต่อเนื่องของประเด็น, หลักฐานการนำมติไปใช้, บันทึกสะท้อนผล, ภาพกิจกรรมที่ได้รับอนุญาต, ตำแหน่งต้นฉบับ Private, checksum ตามนโยบายโรงเรียน

## Evidence chain ที่ต้องพิสูจน์
ปัญหาจาก Baseline หรือการสังเกตจริง → ผู้บริหารกำหนดเป้าหมาย/สนับสนุน → PLC ตกลงวิธีการ → ครูนำไปใช้จริง → Coaching/นิเทศติดตาม → Formative/Retest ที่เทียบเคียงได้ → PLC ทบทวนและผู้บริหารปรับการตัดสินใจ

แต่ละลูกศรต้องมีหลักฐานและวันเวลา; หากขาดให้ระบุ **GAP** ไม่อนุมานว่าครบวงจร

## ลำดับการปฏิบัติที่แนะนำ
1. ผู้บริหารกำหนดผู้ดูแลบันทึก PLC และช่องทางส่งต้นฉบับ Private
2. ตรวจ W1–W7 แบบอ่านอย่างเดียว; สรุปจำนวน **ที่พบจริง/ตรวจต้นฉบับผ่าน/ต้องแก้ไขข้อสงสัย** โดยไม่เผยชื่อ
3. ตรวจ coaching และบันทึกการตัดสินใจที่อ้างในแต่ละรอบ
4. หลังตรวจผ่าน จัดทำ summary ที่ไม่ระบุตัวบุคคลเพื่อเสนออนุมัติ ก่อนอัปเดตสถานะ evidence register
5. ไม่เปลี่ยน canonical 60-criterion acceptance หรือสถานะ R9 E04 จนกว่าจะตรวจและอนุมัติจริง

## Next decision
ขอผู้บริหารระบุ **ที่เก็บบันทึก PLC 7 สัปดาห์จริง** (Private repo path / Drive folder / ไฟล์แนบ) เพื่อเริ่ม R10A. หากเอกสารยังเป็นกระดาษ ให้สแกนเข้าพื้นที่ Private ตามนโยบายก่อนตรวจ. ไม่ต้องเผยข้อมูลบุคคลหรือคะแนนรายคนในแชทสาธารณะ
