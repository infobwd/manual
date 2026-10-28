# FLIP-08 — iPhone PWA navigation & compact reader (28 ต.ค. 2569)

**Production target:** WD Books `1.3.60`, `infobwd/manual`
**Evidence:** รูปจาก iPhone ที่ผู้ใช้ส่ง: โหมดพลิกกระดาษ, หน้า 3/38, ปุ่ม “ก่อนหน้า” ไม่ตอบสนอง, หัวจอและแถบควบคุมใช้พื้นที่มาก
**Scope:** เฉพาะโหมดพลิกกระดาษที่เปิดใน nested iframe; ไม่แตะโหมดอ่านเดิม, พอดแคสต์, เสียงอ่าน, PIN, bookmarks หรือข้อมูลหนังสือ

## วิเคราะห์ปัญหา

- `corner.js.move(-1)` เรียก `engine.flipPrev("bottom")` เมื่อเปิดแอนิเมชัน ซึ่งอาศัยสถานะของ StPageFlip และมีโอกาสไม่ยอมรับการกดย้อนใน WebKit ขณะพับแผ่น/เปลี่ยนสถานะ จึงแยกการกดปุ่มออกจากแอนิเมชันการลาก
- เครื่องมือใน screenshot อยู่สองแถวร่วมกับชื่อหนังสือซ้ำ ทั้งที่ชื่อเล่มมีอยู่ใน Reader แม่; หน้า embedded ยัง `overflow-y:auto` ทำให้ scroll ทั้ง iframe ขณะที่ navigation ไปอยู่ท้ายเอกสาร
- `corner-model` มี `spreadStart` และ `sourceToEngine` เดิม; การเดินหน้า/ถอยหลังต้องรองรับหน้าปกเดี่ยวและ spread บนจอใหญ่

## แก้ไข

1. เพิ่ม pure `cornerModel.adjacent(current,direction,pageCount,single)` เพื่อให้การเดินหน้าถอยหลังครบทุกกรณี โดยไม่มีเลขหน้าติดลบ/กระโดดข้าม
2. ปุ่มและลูกศรคีย์บอร์ดใช้ `engine.turnToPage(target)` และ `renderStatus()` ทันที แทน `flipPrev/flipNext`; gesture การลากกระดาษยังคงใช้ StPageFlip แอนิเมชันตามเดิม
3. ใน iframe แบบ `flip-embedded` บนมือถือ <=690px เปลี่ยนเป็น layout สูง 100dvh: แสดงหน้ากระดาษใน flex stage; navigation ตรึงไว้ในโครงสร้างด้านล่างของ viewport (ไม่ใช่ fixed ทับเนื้อหา)
4. ตัดชื่อเล่มซ้ำใน iframe, แสดงสารบัญ/ขนาดตัวอักษร/ปุ่มลดการเคลื่อนไหวในแถวเดียว (ปุ่ม icon มี aria-label), ซ่อน help ยาวใน embedded mobile เท่านั้น
5. แถบ header ของ modal แม่บนมือถือเหลือชื่อและปุ่มกลับ Reader; เคารพ safe area ขอบจอ iPhone
6. โหมด standalone preview, desktop spread, แผ่นกระดาษที่ใช้จัดหน้า, ตัวเลือกฟอนต์ของผู้อ่าน และ responsive >690px คงเดิม
7. Update version `1.3.60` ใน `index.html`, `assets/app-version.js`, `sw.js` เพื่อกระตุ้นอัปเดต PWA โดยไม่ลบ storage

## QA แบ่งสองชั้น

**ตรวจอัตโนมัติ:** `node tests/flip08-pwa-navigation.smoke.cjs` ครอบคลุม walking forward/backward 12 ชุด, behavior ของ `move()`, CSS viewport และเวอร์ชัน; รันคู่กับ `flipbook-corner.smoke.cjs`, `flipbook-reader-choice.smoke.cjs`, `flipbook-reader-bridge.behavior.cjs`

**ตรวจเครื่องจริง (ยังต้องทำหลัง deploy):**
- iPhone PWA 390×844 / 393×852: หน้า 3→2→1→ปก, ถัดไปกลับได้, ปุ่มด้านล่างมองเห็นเสมอ และไม่มี scroll 2 ชั้น
- เลือกบท/ฟอนต์ 90, 100, 120, 160%: ตรวจข้อความไทยไม่หาย, จำนวนหน้าเปลี่ยนตามการแบ่งใหม่, ยังคง chapter ใกล้เดิม
- iPhone landscape/keyboard open, iPad portrait/landscape, desktop >1100px: ไม่มี clipping, ปกด้านขวาบน desktop, หน้าคู่ไม่มี blank phantom
- เปิด/ปิด reduce motion, ลากมุมหน้าแล้วกลับด้วยปุ่ม, exit กลับ Reader เดิม, ตรวจการอัปเดตและเวอร์ชันใหม่ใน PWA
- Offline: Reader เดิมยังใช้งานและไม่แตะข้อมูลผู้ใช้; flipbook เป็น online-only ตาม FLIP-06

## แผนปรับต่อหลังเก็บ feedback

- FLIP-09: เพิ่ม bottom sheet “ตั้งค่าการอ่าน” ถ้าสารบัญบนหน้าจอเล็กยังแน่น
- FLIP-10: เก็บภาพหน้าจอและทดสอบความสูง responsive หลายเครื่องก่อนขยายรองรับทุกเล่ม
- Gate: อย่าแทนที่ Reader เดิมเป็นค่าเริ่มต้นจนกว่า navigation/scroll/font/reflow/voice/offline จะผ่าน QA เครื่องจริง

**Rollback:** revert เฉพาะ PR FLIP-08; ไม่ล้าง service-worker storage หรือประวัติการอ่าน
