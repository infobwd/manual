# M4 รอบที่ 1 — สำรวจโครงสร้าง WD Books และแผนเพิ่ม AI & School Today

**สถานะ:** Read-only architecture review + implementation plan | **ยังไม่เปลี่ยนเว็บไซต์จริง**

วันที่ตรวจ: 25 ต.ค. 2569 | Repository: `infobwd/manual` | Base: `main`

## 1. สิ่งที่ตรวจพบจากไฟล์จริง
| องค์ประกอบ | ไฟล์ | ผลสำรวจ |
|---|---|---|
| หน้าเว็บไซต์ | `index.html` | โหลดข้อมูลหนังสือและชุด JS แยกส่วนจาก `assets/` |
| ทะเบียนหนังสือ | `assets/manuals-data.js` | `window.WD_LIBRARY_DATA` มี `categories` และ `manuals` |
| หมวดคู่มือ | `assets/manuals-data.js` | มี `teachers` และ `academic` อยู่แล้ว ไม่จำเป็นต้องเพิ่มหมวดใหม่ |
| การเลือกและค้นหา | `assets/catalog-core.js`, `assets/catalog-ui.js` | แยก logic catalog และ UI |
| การเปิดอ่าน | `assets/reader-coordinator.js` | เปิดเฉพาะ `status === "published"` และมี `pages` |
| PWA | `manifest.webmanifest`, `sw.js` | PWA แบบ static; SW cache เฉพาะ allowlist และใช้ version จาก `assets/app-version.js` |
| นโยบายข้อมูล | `docs/CONTENT_GOVERNANCE_2569.md` | ต้องผ่านการตรวจรับเนื้อหาและข้อมูลก่อนเผยแพร่ |
| วิธีทดสอบ | `README.md` | Local-First ด้วย `py -m http.server 4173`; smoke tests ผ่าน Node เมื่อพร้อม |

การสำรวจนี้ตรวจจาก source ใน GitHub เท่านั้น **ยังไม่ทดสอบการรันจริงบน Windows, iPhone, iPad หรือ Pages** และไม่ได้รับรองว่า UX ผ่านแล้ว

## 2. รูปแบบหนังสือที่เสนอ
- **ID:** `ai-school-today-teacher-guide` (ตรวจซ้ำก่อนใช้จริง)
- **ชื่อ:** AI & School Today — เมื่อ AI เข้ามาอยู่ในโรงเรียนแล้ว
- **หมวดหลัก:** `teachers`; แท็ก `AI`, `การสอน`, `การประเมิน`, `PLC`, `คิดวิเคราะห์`
- **กลุ่มผู้อ่าน:** ครูปฐมวัย–ประถมศึกษา ผู้บริหาร และวิทยากร
- **เวอร์ชันเริ่มต้น:** `Review Draft 0.1`; เปลี่ยนเป็น `Public Edition 1.0` เมื่อผ่าน Gate
- **สถานะก่อนตรวจรับ:** ไม่เผยแพร่เป็น `published` และไม่เพิ่มหน้าเนื้อหาที่เปิดอ่านได้
- **หน้าปก:** ใช้ theme เดิมของ WD Books ไม่เพิ่ม dependency ใหม่

## 3. แผนสารบัญ e-book
1. หน้าปกและคำเตือนเกี่ยวกับขอบเขตการใช้ AI
2. AI ในโรงเรียนและบทบาทครู
3. จริยธรรมและความปลอดภัย
4. การออกแบบงานที่ AI ช่วยแต่เด็กยังคิดเอง
5. หลักฐานวิธีคิด
6. การตรวจข้อมูลจาก AI
7. การประเมินในยุค AI
8. กิจกรรมตามช่วงวัย
9. PLC และการติดตาม
10. แบบฟอร์มครูและใบงานตัวอย่าง
11. แนวทางอบรม 180 นาที
12. สรุปและแหล่งข้อมูล/เวอร์ชัน

**หมายเหตุ:** โครงสารบัญ 12 ส่วนเป็นการจัดหน้าเสนอ ไม่ใช่การแปลงบท Markdown เป็น `pages` แล้ว; ต้องตรวจความยาวและแยกหน้าเพื่ออ่านบนมือถือจริง

## 4. แนวทาง Implementation แยก PR
### M4-P1 — Content mapping (ไม่แตะ Production)
- ทำตาราง map จาก `docs/ai-school-today/01–08`, `templates/`, `examples/`, `workshops/` ไปยังหน้า e-book
- คัดเนื้อหา **Public-safe** ที่ผ่านตรวจรับเท่านั้น
- แยกเฉลย/เอกสารวิทยากรจากหน้าที่แจกผู้เข้าอบรม; ไม่อ้างว่าไฟล์ public ปิดบังเฉลยได้

### M4-P2 — Preview-only
- ทำ preview ใน branch แยก โดยไม่แก้ `assets/manuals-data.js` บน `main`
- ใช้โครง `id/category/status/title/subtitle/description/audience/updated/edition/readTime/color/coverTitle/coverTop/tags/pages` ตามรูปแบบที่พบในข้อมูลจริง
- หลีกเลี่ยงการเพิ่ม script, service-worker scope หรือ storage keys ใหม่หากไม่จำเป็น
- ทดสอบการเปิดอ่าน สารบัญ ค้นหา และการอ่านต่อโดยไม่กระทบหนังสือเดิม

### M4-P3 — QA และตรวจรับ
- ทดสอบ `node tests/library.smoke.cjs`, `node tests/pwa-reader.smoke.cjs`, `node tests/home-p0a.smoke.cjs` และชุด smoke อื่นที่มีจริงใน repository
- ตรวจ responsive iPhone/iPad/desktop, ปรับขนาดอักษร, โหมดถนอมสายตา, คีย์บอร์ด, offline/cache update
- ตรวจเนื้อหา ภาษาไทย ข้อเท็จจริง การอ้างอิง และความปลอดภัยของข้อมูล
- ให้เจ้าของเนื้อหาและผู้ดูแลข้อมูลอนุมัติ

### M4-P4 — Publish (ต้องอนุมัติแยก)
- เพิ่ม entry หนังสือที่ผ่านตรวจรับเข้า `assets/manuals-data.js` พร้อม `status:"published"`
- ตรวจ version/cache และ rollback ก่อน Merge
- ตรวจ GitHub Pages จริงหลัง Merge และทดสอบบนอุปกรณ์

## 5. ข้อห้ามและความเสี่ยง
- ห้ามเผยแพร่ชื่อ เลขที่ ภาพ ผลประเมินหรือข้อมูลระบุตัวเด็กจริง
- ห้ามอ้างว่าไฟล์ใน public repo หรือเอกสารที่ซ่อนด้วย UI เป็นข้อมูลลับ
- ห้ามแก้ระบบ WD Growth, PLC หรือหนังสืออื่นโดยไม่จำเป็น
- ห้ามเพิ่ม GitHub Actions workflow ตามแนวทาง Local-First
- **การ Merge PR เอกสารไม่เท่ากับการอนุมัติเผยแพร่ e-book**

## 6. Gate ก่อนเริ่มเพิ่มรายการหนังสือ
- [ ] M3 ซ้อมอบรมจริงและบันทึกผล
- [ ] ครูตรวจรับเนื้อหาและตัวอย่างตามช่วงวัย
- [ ] ตรวจแหล่งอ้างอิงและเฉลยที่ใช้ประกอบกิจกรรม
- [ ] ตรวจความปลอดภัยของเนื้อหา Public Edition
- [ ] Preview และทดสอบบนอุปกรณ์จริง
- [ ] ผู้รับผิดชอบอนุมัติ M4 Publish แยก

**ผลรอบนี้:** พร้อมเริ่ม M4-P1 การจัดทำ content mapping; ยังไม่พร้อมประกาศว่าเว็บไซต์เผยแพร่หนังสือเล่มใหม่แล้ว
