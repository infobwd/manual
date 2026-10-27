# WD Books — คู่มือสารสนเทศสู่การพัฒนาในวง PLC (ฉบับสาธารณะ)

**วันที่:** 27 ตุลาคม 2569  
**สถานะ:** PUBLISHING CANDIDATE / รอเจ้าของข้อมูลและฝ่ายวิชาการตรวจรับ PR ก่อน Merge  
**เว็บไซต์:** https://infobwd.github.io/manual/ (Public GitHub Pages)  
**หมวดหมู่:** คู่มือสำหรับครู (`teachers`)  
**รหัสเล่ม:** `wd-growth-plc-information-to-action-2569` · 15 หน้า · Public Edition 1.0

## เป้าหมาย

ให้ครูอ่านแนวทางใช้ข้อมูล Baseline เพื่อพัฒนาการสอนและร่วม PLC 7 สัปดาห์ โดยไม่ให้ข้อมูลกลายเป็นการประเมินจัดอันดับครูหรือผู้เรียน

สาระสำคัญครอบคลุม (1) ตรวจข้อมูลและแยก 0/ไม่ประเมิน, (2) แยกหลักฐานกับสมมติฐาน, (3) ตัวอย่างสอนคณิต/ไทย/อังกฤษจากสถานการณ์ **สมมติ**, (4) กิจกรรม 10 นาที × 3 ต่อสัปดาห์ตามความเหมาะสม, (5) หลักฐาน formative, (6) PLC สัปดาห์ 1–7 รวม 2.5, (7) Buddy/ครูร่วม, (8) แนวปฏิบัติข้อมูลปลอดภัย

## Data boundary สำคัญมาก

**อย่านำรายงานคะแนน ป.4 จาก Private Repository ออกสู่ Public WD Books โดยอัตโนมัติ**.

- ข้อมูลต้นทางสำหรับ PLC ภายใน: `infobwd/wd-standard` (Private), คู่มือ `docs/WD_GROWTH_P4_TEACHER_PLC_DATA_BRIEF_AND_ACTION_GUIDE_2569.md` ใน Draft PR #66
- ชุดคะแนน ป.4 ยังเป็น `DRAFT_AWAITING_TEACHER_REVIEW`; จาก 20 ภาพที่อ่านได้ มีภาพตามแจ้งอีก 4 ใบที่ยังไม่ได้ตรวจรายการรายข้อ
- คู่มือฉบับสาธารณะนี้ **ไม่มีคะแนนจริง** ไม่แสดงเลขที่/ชื่อ ภาพต้นฉบับหรือชิ้นงานเด็ก ไม่มีแม้แต่สถิติรวมของกลุ่มเล็ก
- กรณีตัวอย่างในเล่มเป็น **ตัวอย่างสมมติ**, ไม่ตีความว่าเป็นผลจริงของโรงเรียน
- แม้มีแผน Protected Library/PIN ในเอกสาร `docs/WD_BOOKS_PROTECTED_LIBRARY_P0_PLAN_2569.md` ก็ยังไม่มี Backend Authorization ที่ใช้งานได้; ห้ามซ่อนข้อมูลจริงใน JS เพราะ Public source/PWA cache ทุกคนอ่านได้
- หากครูต้องดูตัวเลขและหลักฐานรายบุคคล ให้ใช้ระบบ/แฟ้มจำกัดสิทธิ์ที่โรงเรียนกำหนดเมื่อได้รับอนุญาต ไม่ใช้ GitHub Pages นี้

## Implementation

| ไฟล์ | หน้าที่ |
|---|---|
| `assets/wd-growth-plc-information-guide.js` | เพิ่มเล่มผ่าน `window.WD_LIBRARY_DATA.manuals` หลัง catalog โหลด มี guard idempotency |
| `index.html` | โหลดเล่มใหม่หลังคู่มือ WD Growth เดิม และก่อนเริ่ม library |
| `sw.js` | เพิ่มไฟล์หนังสือเข้า precache shell เพื่ออ่านออฟไลน์หลังอัปเดต PWA |
| `assets/app-version.js` | Release `1.3.53` เพื่อแยกชุด cache ใหม่ |
| `tests/wd-growth-plc-public.smoke.cjs` | ตรวจ schema, content safety, category, script order, PWA shell และ idempotency |

**ไม่มี** การเปลี่ยนแปลง Server/API/DB, ระบบ PLC จริง หรือข้อมูลคะแนน WD Growth ภายใน

## Acceptance

- [ ] เจ้าของข้อมูล/ฝ่ายวิชาการยืนยันว่าข้อความเหมาะสมกับครูและไม่อ้างข้อมูลจริงเป็นข้อมูลสมมติ
- [ ] คัดกรองความเสี่ยงเผยแพร่ข้อมูลผู้เรียน/บุคลากรและข้อมูลภายใน
- [ ] `node tests/wd-growth-plc-public.smoke.cjs` PASS บนเครื่องทดสอบ
- [ ] `node tests/cat01-contract.smoke.cjs`, `node tests/library.smoke.cjs`, `node tests/pwa-update-lifecycle.smoke.cjs` ไม่เกิด regression
- [ ] ตรวจอ่านทุก 15 หน้า รวมโหมด iPhone/iPad และ TTS สำหรับภาษาไทย/อังกฤษ
- [ ] ตรวจบน GitHub Pages หลัง Merge ว่าเล่มใหม่ค้นหาได้ในหมวดครู เปิดอ่าน 15 หน้าได้ และ Service Worker ได้เวอร์ชัน 1.3.53
- [ ] ไม่อ้างว่า Production/PWA อัปเดตแล้วจนเปิดดูเวอร์ชันและทดสอบจริงได้

## วิธีตรวจบนเว็บไซต์เมื่อเผยแพร่แล้ว

1. เปิด https://infobwd.github.io/manual/ และกดรีเฟรช/อัปเดตเมื่อ PWA แจ้ง
2. ค้น `PLC` หรือ `จากสารสนเทศสู่การพัฒนา` หรือเลือกหมวด `คู่มือสำหรับครู`
3. เปิดหนังสือ `WD Growth — จากสารสนเทศสู่การพัฒนาในวง PLC`
4. ตรวจปก/สารบัญ 15 หน้า, หน้า “ตรวจคุณภาพข้อมูล”, ตัวอย่าง 3 กลุ่มวิชา, PLC สัปดาห์ 1–7, หน้าความปลอดภัยข้อมูล
5. ทดสอบบนมือถือ, iPad, ตัวอ่านเสียง, กดเปิดหน้าที่กำลังอ่านเสียง, อ่านต่อและออฟไลน์ตามสิทธิ์ public content

**Gate:** ไม่ Merge หรือเผยแพร่จนผ่านการตรวจรับเนื้อหาและนโยบายข้อมูลของ `docs/CONTENT_GOVERNANCE_2569.md`.
