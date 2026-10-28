# FLIP-11 — เปิดอ่านแบบหนังสือเป็นหลัก + ผิวกระดาษสมจริงขึ้น

**วันที่:** 28 ตุลาคม 2569 · **Repository:** `infobwd/manual` · **Release candidate:** `1.3.66`

## เป้าหมาย

เมื่อเลือกหนังสือที่เผยแพร่แล้ว ให้เข้า **Flipbook โดยอัตโนมัติ** เป็นการอ่านหลัก พร้อมพื้นผิวกระดาษ ปึกหน้า เงาขอบ และสันกลางคล้ายหนังสือจริง แต่ต้องไม่ทำให้ข้อมูลถูกตัดหรือผู้ใช้สูญเสีย Reader เดิม/เสียงอ่าน/การอ่านออฟไลน์.

## ขอบเขตและเงื่อนไข

- มีหนังสือเผยแพร่ 15 เล่ม ณ จุดตั้งต้น. 13 เล่มประกอบด้วย `title, kicker, paragraphs, bullets, tip` เท่านั้น. ระบบจัดหน้า Flipbook รองรับและเปิดเป็นค่าเริ่มต้นเมื่อออนไลน์
- อีก 2 เล่ม `sar-2568-basic-education` และ `sar-info02-national-assessments-2568` มี `chart` และ `insight`; **ต้องเปิด Reader เดิม** เพื่อรักษากราฟและเนื้อหาครบ ห้ามแสดง Flipbook ที่ตัดข้อมูลพิเศษออก
- ใช้โมดูลตรวจความสามารถร่วม `assets/flipbook-capability.js` ฝั่งแอปและฝั่ง renderer, fail-closed สำหรับเนื้อหาที่ยังไม่รองรับหรือประเภทข้อมูลที่ไม่ถูกต้อง
- โหมด **เปิดจากชั้นหนังสือ/อ่านต่อ** เมื่อออนไลน์และเป็นเล่มที่รองรับ → เปิด Reader เดิมอยู่ด้านหลังเพื่อเป็น fallback และเปิด Flipbook ทับอัตโนมัติ. เมื่อแตะ ✕ / อ่านแบบปกติ จะกลับ Reader เดิมพร้อมตำแหน่งบทล่าสุด โดยไม่เปิด Flipbook ซ้ำ
- **ออฟไลน์** → Reader เดิมตามปกติ. **เปิดจาก audio mini-player** → Reader เดิมโดยตรงเพื่อให้การติดตามบท/เสียงอ่านถูกต้อง. ปุ่ม 🎧 ใน Flipbook ยังคงกลับไปเปิดแผงเสียงเดิม ไม่เล่นอัตโนมัติ
- ถ้า renderer ตรวจพบหนังสือผิดประเภท, จัดหน้าไม่ได้ หรือโหลดเป็นหน้าเอกสารแต่ไม่มีตัวควบคุม ให้กลับ Reader เดิมโดยไม่ล้างความคืบหน้า
- **ยังไม่**เปลี่ยน `wd-manual-reader-v2` schema, localStorage, Podcast, กฎการเปิดเผยหนังสือ, permissions, offline precache ของ StPageFlip หรือเนื้อหาใน catalog
- Desktop: หน้าคู่ + ปกด้านขวา; iPhone/iPad: หน้าเดี่ยว + ชุดปุ่ม Reader แบบ FLIP-10

## วัสดุหน้ากระดาษ

- CSS เท่านั้น: ผิวโทนอุ่นละเอียดระดับต่ำ, แสงจากกระดาษ, ขอบหน้า, เงาความหนาและรอยพับตามแนวสัน. แยกการแสดงผล night/sepia, เก็บ Sarabun ตัวอักษรไทยมีหัว
- ใช้ `pointer-events:none` ในชั้นตกแต่ง, ไม่มีภาพ texture CDN, ไม่มี canvas หรือเฟรมแอนิเมชันใหม่. StPageFlip เป็นเจ้าของการเคลื่อนไหวจริงตามการลากมุมต่อไป
- ทดสอบ `prefers-reduced-motion`, ขนาด font 90–160%, โทรศัพท์และ iPad แนวตั้ง/แนวนอน, Desktop 100% zoom.

## Tests

- `node tests/flipbook-default-paper.smoke.cjs`: public 13/15 + chart fallback + audio/offline routing + CSS material + version
- `node tests/flipbook-reader-choice.smoke.cjs`, `node tests/flipbook-reader-bridge.behavior.cjs`: ปุ่ม/ข้อความกับ iframe และ origin validation
- `node tests/flipbook-native-mobile-controls.smoke.cjs`, `node tests/flipbook-desktop-layout.smoke.cjs`
- `node tests/flipbook-corner.smoke.cjs`, `node tests/flipbook-ios-embed.smoke.cjs`
- Real browser/device QA pending after Pages deploy. **Do not claim 13 books all visually accepted solely from static schema checks**.

## Manual acceptance หลัง deploy

1. เปิดหนังสือ AI จำนวน 2–3 เล่มจากชั้นหนังสือ → Flipbook เปิดเอง, หน้าแรก/หน้าสุดท้ายแสดงครบ, เปลี่ยนบท/ขนาดอักษร
2. กด ✕ → กลับ Reader เดิม, bookmark/บทไม่หาย, จาก Reader กด 📖 เปิด Flipbook อีกครั้งได้
3. เปิด SAR ทั้งสองเล่ม → เข้า Reader เดิม และเห็นกราฟ/insight ที่ไม่ถูกตัด
4. ปิดอินเทอร์เน็ต → ยังคงอ่านเนื้อหาที่ cache ไว้ใน Reader เดิมได้; ไม่มี Flipbook บัง
5. เปิดจากเครื่องเล่นเสียง/Podcast → อยู่ Reader เดิม, ไม่มีการเล่นซ้อน; กด 🎧 ใน Flipbook → กลับแผงเสียง
6. Desktop: หน้าคู่/สันพับ/เงาปึกหน้า + Sarabun; Phone/Tablet: กระดาษไม่ทึบ/ไม่ตัดข้อความ, ปุ่ม FLIP-10 ยังคงกดได้
7. PWA v1.3.66: อัปเดตผ่านการตั้งค่าตามกลไกเดิม ไม่ล้าง localStorage หรือถอนแอป

## Rollback

Revert FLIP-11 PR เพียงชุดเดียวจะกลับไปใช้ Reader เดิมเป็นหลักและเหลือโหมดพลิกกระดาษเป็นทางเลือก. ไม่ลบข้อมูลการอ่านใด ๆ
