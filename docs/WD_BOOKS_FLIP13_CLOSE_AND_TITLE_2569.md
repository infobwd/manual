# WD Books — FLIP-13: ปิดหนังสือโดยตรง + แยกโหมดปกติ + ชื่อไม่มี /n

**วันที่:** 28 ตุลาคม 2569 · **Version:** 1.3.68 · **Repository:** `infobwd/manual`

## User acceptance หลัง FLIP-12

ผู้ใช้ยืนยัน PASS สองข้อ (ปกหลังเป็นหนังสือปิดเล่มเดียว และ Desktop เลือกหมวดแล้วเห็นผลลัพธ์ทันที) แล้วถามว่าเหตุใดบางเล่มเข้า Flipbook ไม่ได้ ปุ่ม ✕ ไม่ควรพาไป Reader ปกติ และบางชื่อมีข้อความ `/n`.

## Root cause — book coverage

แค็ตตาล็อก main ล่าสุดมี 21 รายการ: 15 published / 6 review or planned. ใน 15 published มี **13 เล่มที่ schema title/kicker/paragraphs/bullets/tip รองรับใน Flipbook**, อีก **2 เล่ม SAR** มี `chart` กับ `insight` ซึ่ง renderer Flipbook ยังไม่รองรับ จึง fallback Reader เดิมเพื่อไม่ให้เนื้อหา/กราฟหาย. อีก 6 รายการยังไม่มีหน้าคู่มือเผยแพร่พร้อมอ่าน. ไม่ใช่ปัญหาเครื่องผู้ใช้/สิทธิ์หรือการอัปเดต PWA.

หมายเหตุ: ภาพการ์ด “เตรียมรับนิเทศเปิดภาคเรียน 2” ในข้อความล่าสุดไม่ได้ตรงกับ title ของ 21 รายการใน `assets/manuals-data.js` ณ เวลาตรวจ จึงยังไม่กล่าวอ้างว่าเล่มนั้นถูกปิดกั้นด้วย gate เดียวกัน ต้องตรวจข้อมูลการนำเข้า/เส้นทางจากแหล่งที่แสดงการ์ดเพิ่มเติมหากต้องแก้เป็นรายเล่ม

## FLIP-13 — navigation semantics

- กด **✕ ปิดหนังสือ** จาก Flipbook: ปิดทั้ง Flipbook และ Reader ที่อยู่ด้านหลัง กลับชั้นหนังสือ (และคืน focus ไปยังรายการที่เปิด) โดย **บันทึกบทล่าสุดผ่าน `jumpTo` ก่อนปิด**
- เลือก **อ่านแบบปกติ**: desktop มีปุ่มแยกข้างปุ่มปิด; มือถือ/แท็บเล็ตอยู่ในเมนู `⋯` ฝั่ง Flipbook. ปิดเฉพาะ Flipbook และคง Reader เดิมเพื่ออ่านต่อ
- ปุ่ม 🎧 ยังคงกลับ Reader เดิมและเปิดแผงฟังหนังสือโดยไม่เล่นอัตโนมัติ
- Escape/การปิด native modal เทียบเท่า ✕ ปิดหนังสือ; ถ้า renderer โหลดล้มเหลวจะตกกลับ Reader เดิมแทนการปิดงานทิ้ง
- รับข้อความจาก iframe เฉพาะ same-origin + exact frame + bookId ตาม gate เดิม. เพิ่ม synchronous `WD_BOOKS_FLIP_CLASSIC` และ postMessage `wd:flip13:classic` สำหรับเปลี่ยนโหมดโดยชัดเจน
- **ไม่เปลี่ยน** localStorage schema, ชื่อหนังสือต้นฉบับ, audio/Podcast, online/offline gate หรือระบบข้อมูลผู้เรียน

## FLIP-13 — title rendering

- ในข้อมูลบางเล่มมีตัวแบ่งบรรทัดชื่อปก. บังคับเฉพาะ **rendering** ให้รองรับ newline จริง, literal `\n` และ typo `/n`
- ปกหนังสือใช้บรรทัดใหม่กับ CSS `white-space:pre-line` เดิม ส่วนชื่อรายการ/หัว Reader/Flipbook ใช้เว้นวรรคอย่างเหมาะสม
- เก็บสัญลักษณ์ทับจริงอย่าง `RT/NT` ไว้; ไม่ mutate canonical `assets/manuals-data.js` เพื่อไม่เปลี่ยนชื่อจริงใน metadata/search

## Tests & rollout

- `tests/flipbook-close-book-label.smoke.cjs`: ปิด vs. classic, labels, 13/15 schema, PWA 1.3.68
- `tests/flipbook-reader-bridge.behavior.cjs`: parent bottom/desktop close, classic, audio, Escape, error, chapter sync
- Regression: `flipbook-return-child.behavior`, `flipbook-native-mobile-controls`, `flipbook-desktop-layout`, `flipbook-default-paper`, `flipbook-closed-cover-category`, `flipbook-reader-choice`, `flipbook-corner`, `flipbook-ios-embed`
- **Real iPhone/iPad/Desktop browser testing pending after GitHub Pages deploy**. In particular confirm `✕` goes to shelf (not old Reader), `⋯ → อ่านแบบปกติ` keeps old Reader, and `🎧` opens legacy audio panel
- PWA version **1.3.68**; no uninstall/clear data required

## Next-phase (not in this PR)

Render `chart` and `insight` faithfully in Flipbook for two SAR manuals after confirming visual/data parity, then consider enabling them by updating shared `flipbook-capability.js`. Maintain manual original Reader fallback until gate PASS.

## Rollback

Revert FLIP-13 PR only; do not erase bookmarks, reading history or browser storage.
