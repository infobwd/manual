# WD Books FLIP-12 — ปกหลังเป็นหนังสือปิดเล่มเดียว + การเลือกหมวดหมู่ Desktop

**วันที่:** 28 ตุลาคม 2569 · **Version:** 1.3.67 · **Repository:** `infobwd/manual`

## Evidence

ภาพ Desktop ของผู้ใช้แสดงปกหลัง/หนังสือที่ปิดแล้วยังมีหน้าคู่หรือพื้นที่หน้ากระดาษฝั่งตรงข้าม และเมื่อเลือกหมวดหมู่จากแถบซ้าย รายการคู่มือที่กรองแล้วอยู่ต่ำกว่าพื้นที่มองเห็น ต้องเลื่อนลงด้วยตนเอง

## FLIP-12A — Physical closed back cover

- เก็บ `corner-model.js` และ StPageFlip order เดิมไว้ เพื่อคงการจับมุม, page mapping, front cover on right, chapter progress, font scaling และ iPhone/iPad gestures
- เฉพาะเมื่อ `cornerModel.status(...).label === "ปกหลัง"` แสดง `closedBackCover` เป็น *หนังสือปิดเล่มเดียว* กลางเวทีอ่าน ไม่แสดง spread/หน้าคู่อีก
- วัสดุปกหลังสีเขียวเข้ม, ตัว W สีทอง, เงาความหนาของปึกหน้า; ไม่ใช้ bitmap หรือทรัพยากรภายนอก
- ใช้ `visibility:hidden` กับ engine ขณะปิด (ไม่ใช้ `display:none`) เพื่อรักษาขนาดสำหรับ WebKit/การกลับหน้าก่อนหน้า และปุ่ม `↶ เปิดกลับหน้าสุดท้าย` เรียก `move(-1)`
- เมื่อกลับสู่หน้าเนื้อหา `renderStatus()` ต้องซ่อนปกหลังและคืน engine ตามปกติ; ปุ่มก่อนหน้า/ถัดไปและการกลับไป Reader เดิมไม่เปลี่ยน

## FLIP-12B — Desktop category follow-through (scoped hotfix)

- ที่ `assets/app.js` การกดรายการหมวดจาก sidebar (nav) กรอง catalog ตามเดิม แล้วเลื่อนไปยัง `#library` โดยอัตโนมัติเมื่อ Desktop ≥1001px; ไม่บังคับการเลื่อนเมื่อแตะ category chips บนมือถือ/แท็บเล็ต
- เคารพ `prefers-reduced-motion` และ offset 90px เพื่อไม่ให้หัวชั้นหนังสือถูก header ทับ
- **ยังไม่ใช่การจัดหน้า Home ครั้งใหญ่**: layout/navigation/shell เป้าหมาย Tailwind/shadcn ใน `WD_BOOKS_UI_STACK_MIGRATION_TAILWIND_SHADCN_2569.md` ต้องผ่าน design/migration gates ของแผนหลักก่อน
- แผนถัดไปควรทำแบบ desktop category-first view ที่แสดงหัวหมวดและผลลัพธ์ใน viewport พร้อมกันโดยไม่ต้อง scroll ทั้งหน้า พร้อมทดสอบสภาวะ empty results และ keyboard/assistive technologies

## Tests & acceptance

- `node tests/flipbook-closed-cover-category.smoke.cjs`: front/back ordering หลายความยาว, ปกหลังแผ่นเดียว, ปุ่มกลับหน้า, CSS visibility, auto-focus results, PWA version
- Regression: `flipbook-default-paper`, `flipbook-corner`, `flipbook-reader-bridge.behavior`, `flipbook-ios-embed`, `flipbook-native-mobile-controls`, `flipbook-desktop-layout`, `flipbook-reader-choice`
- Manual post-deploy: Desktop Chrome ที่ Zoom 100% → เปิดไปถึงปกหลัง เห็นปิดเล่มเดียว กดกลับหน้าสุดท้าย; iPhone PWA / iPad → ปกหลังเดียวและกดกลับได้, theme light/night
- Desktop click all/academic/administration/empty category from sidebar → รายการผลลัพธ์ถูกนำเข้าสู่มุมมองทันที; mobile chips ไม่กระโดดจอเอง
- ยืนยัน `v1.3.67` ใน PWA ก่อนทดสอบจริง; ไม่มี storage migration หรือข้อมูลอ่านหาย

## Rollback

Revert เฉพาะ FLIP-12 PR เพื่อย้อนสู่สไตล์และการนำทางเดิม โดยไม่ล้าง bookmark, history, audio หรือถอน PWA
