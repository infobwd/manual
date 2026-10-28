# WD Books — FLIP-01 Flipbook Pilot (28 ตุลาคม 2569)

**Repository:** \`infobwd/manual\` · **Status:** ISOLATED PREVIEW / Device QA pending  
**Branch:** \`feat/wd-books-flipbook-pilot-01\`  
**Pilot path after preview-only merge:** \`https://infobwd.github.io/manual/experiments/flipbook-pilot/\`

## FLIP-02 — ปรับปกหนังสือให้เปิดจากด้านขวา (28 ต.ค. 2569)

**เหตุผล:** ภาพทดสอบ Desktop จากผู้ใช้แสดงปกอยู่ซ้ายและเนื้อหาหนึ่งหน้าอยู่ขวาตั้งแต่เปิดครั้งแรก ทำให้รู้สึกเป็นหน้าคู่ที่เปิดอยู่แล้ว ไม่เหมือนหยิบหนังสือจริงขึ้นมาอ่าน.

**กติกาหน้า (หนังสืออ่านซ้ายไปขวา):**
1. เมื่อเริ่มเล่มบน Desktop กว้างกว่า 1100 CSS px: ฝั่งซ้ายว่าง (ไม่มี sheet), ปกอยู่ **ขวาหน้าเดียว**, progress = `หน้าปก`.
2. พลิกปกครั้งแรก: ปกด้านในซ้ายว่าง, เนื้อหาหน้า 1 ขวา. จากนั้นแสดงหน้าคู่ 2–3, 4–5, … จนหมดทุกหน้าตามลำดับ.
3. หนังสือที่มีเนื้อหาจำนวนหน้าคู่ อาจมีช่องว่างขวาตอนจบเพื่อไม่บีบหรือทิ้งหน้าท้าย. ห้ามนับช่องว่างเหล่านี้เป็นเนื้อหา.
4. มือถือ/iPad viewport ไม่เกิน 1100 CSS px: หน้าเดี่ยวเรียง `ปก → หน้า 1 → หน้า 2 → …` ไม่มี blank sheet.
5. สารบัญต้องกระโดดไปยัง spread ที่มีหน้าต้นบททั้งบน Desktop และ mobile; หลังปรับฟอนต์/หมุนจอให้อิงต้นบทเดิม. คงปุ่มย้อนกลับถึงปกและป้องกันการคลิกเลยหน้าสุดท้าย.
6. แยก navigation เป็น `experiments/flipbook-pilot/spread-model.js` แบบ pure helper และทดสอบจำนวนหน้า 2/25/26/27/28/31 ทั้งหน้าคู่-หน้าเดี่ยว. ไม่เปลี่ยนจำนวนหน้าเนื้อหาจริง ไม่แก้ข้อมูล/เสียง/เวอร์ชัน PWA.

**Acceptance:** Node static smoke + spread sequence gate; browser QA บน GitHub Pages หลัง Merge เท่านั้นจึงพิจารณาว่าภาพพลิกปกถูกต้องจริง. ไม่ตีความ static QA เป็นการรับรอง iPad หรือ Safari.
**Rollback:** revert เฉพาะ FLIP-02 PR ไม่กระทบ Reader หรือ PWA เดิม.

---

## Decision / Scope

ทดลองการพลิกหน้ากระดาษแบบ 3D บนมือถือ (หน้าเดี่ยว) และจอกว้าง (หน้าคู่) โดยเลือกหนังสือฉบับ **เผยแพร่แล้ว** จาก \`assets/manuals-data.js\` เพียงเล่มเดียว: \`ai-five-questions-speaker-cheatsheet-25691026\`, 12 source chapters (หนังสือสำหรับผู้บรรยาย). การนำข้อความมาจัดหน้าใหม่อาจทำให้จำนวนหน้าที่แสดงต่างจาก 12 หน้าต้นฉบับได้; ต้องแสดงข้อความครบ ไม่ตัดเงียบ.

นี่เป็น **vanilla HTML/CSS/JS CSS-3D proof-of-concept** ไม่ได้อ้างว่าใช้ Heyzine หรือ StPageFlip แล้ว. StPageFlip (MIT) เป็น **candidate สำหรับการยกระดับ** ให้จับมุมกระดาษและลากตามนิ้วจริง โดยต้องทดสอบ renderer, performance และ license ก่อน vendor โค้ดไว้ใน repo (ไม่ใช้ CDN runtime).

Prototype นี้ **ไม่ใช้** React, Tailwind หรือ shadcn/ui และไม่ถือว่า UI-MIG-02 ผ่านแล้ว. เป็นโครงการทดลองย่อยที่สอดคล้องกับ [Reader UX Master Roadmap](WD_BOOKS_READER_UX_ROADMAP_2569.md) และ [UI stack migration](WD_BOOKS_UI_STACK_MIGRATION_TAILWIND_SHADCN_2569.md); การตัดสินใจย้าย UI หลักต้องผ่าน Gate 0–6 เดิมแยกต่างหาก.

## ขอบเขตที่ทำ

- แยกไฟล์ที่ \`experiments/flipbook-pilot/{index.html,pilot.css,pilot.js,spread-model.js}\`; ไม่มีการแก้ root \`index.html\`, Reader เดิม, \`sw.js\`, version, cache และไฟล์เสียง.
- โหลดหนังสือ Public จริงจาก path สัมพัทธ์ภายใน Pages เดิม; ปฏิเสธหากหนังสือไม่ใช่ \`published\`.
- มีปก แยกบท สารบัญ เปลี่ยนหน้า/ปัด/คีย์บอร์ด, หน้าคู่หรือหน้าเดี่ยวตาม viewport, กำหนดตัวอักษร 90–160%, ตรวจพื้นที่ก่อนใส่บล็อกข้อความ และแบ่งบล็อกยาวข้ามหน้า.
- เคารพ \`prefers-reduced-motion\` และปุ่มปิดการเคลื่อนไหว; ไม่มีการเขียน \`wd-manual-reader-v2\` หรือ key ใหม่.
- ไม่เพิ่ม CDN / backend / login / analytics / SW / custom GitHub Actions / PWA version. การเข้า Preview ออนไลน์ครั้งแรกต้องมีเครือข่าย; **ไม่รับรอง offline**.

## Validation

Run on a local checkout:

\`\`\`bash
node tests/flipbook-pilot.smoke.cjs
\`\`\`

**Static smoke only** ตรวจโครงสร้างและสัญญาความปลอดภัยของ preview; **ไม่อาจใช้แทน real-browser rendering QA**. ต้องตรวจด้วยตาบน GitHub Pages หลังเผยแพร่ พร้อมบันทึกผลจริงในรอบถัดไป.

### Device checklist (ยังไม่ผ่านจนตรวจจริง)

| Device | Action | Acceptance |
|---|---|---|
| iPhone Safari + PWA | เปิด URL, ปัดซ้ายขวา, เลื่อนแนวตั้ง | หน้าเดี่ยว ไม่ลาก viewport ผิด ไม่ตัดข้อความ |
| iPad Portrait / Landscape / Split View | พลิกหน้า, ย่อ/ขยาย split | ปรับ 1/2 หน้าได้, คำครบ, ไม่ชนขอบ |
| Chrome/Edge Desktop | คลิกก่อน/ถัดไป, ← →, เปลี่ยนบท | หน้าคู่ ไม่ข้ามบท/หน้า, เลขหน้าตรง |
| ทุกขนาด | font 90/120/140/160, พลิกหน้าสุดท้าย | re-pagination ไม่ตัดข้อมูลและไม่มีหน้าว่างผิด |
| ทุกขนาด | Reduce motion + OS setting | ไม่มี animation เมื่อปิด, ใช้งานต่อได้ |
| แอปหลัก | กลับไปหน้าเดิม, เปิดเล่มเดิม | bookmark, reading progress, favorites, podcast, lock screen, offline, cache ไม่เปลี่ยน |
| Accessibility | Tab, screen reader, touch | ปุ่มมีชื่อ, focus มองเห็น, รายงานเลขหน้า |

### Known limits / non-goals

1. ภาพพลิกเป็น CSS 3D หลังการปัดหรือกดปุ่ม ไม่ใช่ corner drag ตามปลายนิ้วแบบ Heyzine; ต้องทดลอง StPageFlip ในรอบถัดไปหากผลทดสอบคุ้มค่า.
2. แสดงเฉพาะข้อความประเภท \`title,kicker,paragraphs,bullets,tip\` ที่ตรวจจาก **หนังสือตัวอย่างเล่มนี้**; ไม่ใช่ renderer ทั่วไปสำหรับทุกเล่ม.
3. เมื่อเปลี่ยนขนาดหน้าจอหรือฟอนต์ ตำแหน่งจะย้อนมาที่ต้นบทที่กำลังเปิด ไม่รับรองอักษรตำแหน่งเดิม.
4. ไม่มี TTS, audiobook sync, bookmark, local progress, offline preview หรือ integration สู่ Reader หลัก. **ห้ามตีความว่าฟีเจอร์เหล่านั้นผ่าน Gate**.
5. การทดสอบบนหน้าจอจริงและการตรวจความครบถ้วนทีละหน้าต้องทำก่อนอนุมัติ integration; fallback คือ Reader เดิมทั้งระบบ.

## Rollout and rollback

- เปิด PR แยกจาก \`main\`; ตรวจ changed files ต้องเป็น **preview 4 files + docs + smoke** เท่านั้น.
- เมื่อ Merge เฉพาะ preview แล้ว URL \`/manual/experiments/flipbook-pilot/\` จึงจะใช้งานได้บน GitHub Pages. Root \`/manual/\` ยังคงเดิม. Preview ไม่ถูกเพิ่มใน SW shell และไม่ bump PWA version.
- Rollback: revert PR commit เท่านั้นและลบ pilot URL; อย่าลบ/รีเซ็ต localStorage/PWA caches ของผู้ใช้.
- **Go/No-Go:** หลัง device QA ให้ตัดสินว่าจะใช้ StPageFlip self-hosted หรือคง lightweight 3D animation; จากนั้นทำ integration Reader แยก PR ภายใต้ UI-MIG-04. ห้ามแทน Reader เดิมใน PR นี้.

## References

- https://heyzine.com/flip-book — reference experience only.
- https://github.com/Nodlik/StPageFlip — MIT library under consideration, not yet installed.
