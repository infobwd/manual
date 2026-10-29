# WD Growth Insights — School Dashboard Design Lock 2569

**สถานะ:** SPEC ONLY / ยังไม่มี Dashboard ที่เปิดใช้งานจริง / ไม่เชื่อม Host และไม่แก้ UI ใน PR นี้

## เป้าหมาย
หน้า Dashboard ภาพรวมทั้งโรงเรียนสำหรับครู ผู้บริหาร และผู้ปกครอง อ่านสารสนเทศ ป.1–ป.5 และรองรับ ป.6/อนุบาลภายหลัง. มีทางเข้าสู่หนังสือรายชั้นและติดตามผลรายทักษะข้ามรอบ โดยไม่เผยแพร่รายคน

## หน้าจอหลัก
1. Header: ปีการศึกษา รอบการประเมิน วันอัปเดต สถานะการรับรอง แหล่งข้อมูล
2. Coverage: จำนวนผู้เรียนที่มีสิทธิ์, ประเมินแล้ว, ยืนยันแล้ว, รอประเมิน/ขาดเรียน/ไม่มีหลักฐาน แยกสถานะชัดเจน
3. ชั้นเรียน ป.1–ป.5: การ์ดชั้นพร้อมลิงก์หนังสือ, ตัวชี้วัดเฉพาะที่ได้รับอนุมัติ; ไม่เรียงอันดับชั้น
4. รายวิชา: ภาษาไทย คณิตศาสตร์ อังกฤษ → ทักษะตาม blueprint ของแต่ละชั้น; แสดงตัวหารและรุ่นเครื่องมือ
5. Growth: Baseline / Follow-up / วันเติบโต; กราฟเฉพาะเมื่อข้อมูล 2 รอบเทียบเคียงกันได้ พร้อม n และวิธีคำนวณ
6. ข้อค้นพบเชิงคุณภาพ: จุดแข็ง ทักษะที่ต้องพัฒนา แนวทางสนับสนุนที่บ้าน โดยไม่ระบุรายคน
7. Footer: นโยบายข้อมูล วันที่อนุมัติเผยแพร่ และหมายเหตุเรื่องข้อมูลไม่ครบ

## Data contract (public aggregate only)
`academic_year, grade, assessment_round, instrument_version, subject, skill_id, skill_label, eligible_n, assessed_n, confirmed_n, pending_n, absent_n, not_observed_n, aggregate_value, aggregate_unit, approved_for_publication, approved_at, data_updated_at, suppression_reason`.

- ตัวเลขผลต้องมาจาก WD Standard Host canonical ที่ยืนยันแล้วเท่านั้น; ไม่อ่าน Draft Git เป็น public feed
- แยก missing/absent/N-O/0 และป้องกันการหารด้วยศูนย์
- กำหนดกฎ suppression โดยผู้รับผิดชอบข้อมูล; กลุ่มขนาดเล็กหรือการตัดกรองที่อาจระบุตัวเด็กต้องไม่แสดงค่า แม้เป็นข้อมูลรวม
- ไม่เผยแพร่เลขที่, student_id, raw responses, URL ไฟล์ private, รูปเด็ก, ชื่อครูประกอบผลรายคน
- ห้ามเก็บ token/secret บน static GitHub Pages
- ถ้ายังไม่มีข้อมูลที่อนุมัติ ให้แสดง 'รอข้อมูลรับรอง' ไม่ใส่ 0 หรือค่าจำลองใน production

## แนวทาง implementation ที่ไม่ชนงาน Reader
- Phase D0: data audit ป.1–ป.5 และ mapping ทักษะ
- Phase D1: static content books + dashboard specification (PR เอกสารนี้)
- Phase D2: approved aggregate JSON export หรือ secure read-only feed ผ่าน PR แยกพร้อม privacy review
- Phase D3: เพิ่ม dashboard UI และทะเบียนหนังสือใน PR แยกหลังตรวจสถานะ UI-MIG/FLIP
- Phase D4: QA responsive mobile/tablet, PWA cache, screen reader, reader/flipbook, links, no personal data, rollback

## Acceptance
- การ์ด ป.1–ป.5 เชื่อมไปเล่มของชั้นนั้น
- ทุกค่ามีสถานะตรวจรับ วันที่และตัวหาร
- ข้อมูลที่ไม่ครบไม่ถูกแปลงเป็นศูนย์
- ไม่มีการเปิดเผยข้อมูลรายบุคคลหรือกลุ่มเล็ก
- ไม่กระทบ Reader, Flipbook, เสียงอ่าน, PWA และงาน migration ที่ยังเปิด PR อยู่
