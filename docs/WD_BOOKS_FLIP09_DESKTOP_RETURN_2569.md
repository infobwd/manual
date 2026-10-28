# WD Books FLIP-09 — Desktop Reading Layout & Reliable Mobile Return
วันที่: 28 ตุลาคม 2569
Version: 1.3.64 (candidate)
Repository: infobwd/manual

## หลักฐานและข้อสรุป

ภาพคอมพิวเตอร์ที่ผู้ใช้ส่งแสดงหน้าคู่เล็กเมื่อเทียบกับพื้นที่หน้าจอ ความกว้าง dialog ถูกจำกัดไว้ที่ `min(1240px,100vw-28px)` และ iframe มีพื้นที่มืดล้อมรอบมาก ผู้ใช้รายงานปุ่ม **“กลับไปอ่าน” ในแถบล่างบนมือถือกดแล้วไม่กลับ Reader** โดยโค้ด FLIP-08B ใช้ `postMessage` จาก iframe ไปยัง parent dialog. ยังไม่มี native Safari debug trace จึงไม่อ้างสาเหตุเดียวหรือผล browser PASS.

## FLIP-09 Desktop (Chrome/Edge, min-width 1101 CSS px)

- ขยาย dialog เป็น `min(94vw, 1760px)` สูง `min(94dvh,1120px)` จำกัดไม่ให้เกิน viewport.
- ซ่อนข้อความรองหัวที่กินพื้นที่ และจัด iframe เป็น flex full-height; ภายใน `corner.html?embed=1` ใช้ toolbar / หน้ากระดาษ / navigator ที่แบ่งพื้นที่อย่างชัดเจนไม่ต้อง scroll iframe ซ้อน.
- หน้าคู่อิงความสูง viewport และสัดส่วนกระดาษ; กำหนดความกว้างสูงสุด `min(100%, calc((100dvh - 146px)*1.54), 1380px)`.
- ตัวอักษรในกระดาษจริงและพื้นที่วัด `#measure` ใช้ 18.5 CSS px × font scale และ 17 px สำหรับหน้าจอสั้น; คง Sarabun แบบมีหัว, หรือ Google Sans เมื่อผู้ใช้เลือก desktop eligible ตามระบบเดิม.
- พฤติกรรมหน้าปกขวา การลากมุม สารบัญ และการปรับขนาดอักษรยังเป็น engine เดิม.

## FLIP-09 Return (iPhone PWA)

- เพิ่มปุ่ม `wdFlipbookReturnBottom` เป็น **DOM ของ parent** อยู่ทับช่องท้ายของ navigator iframe บน viewport ≤690 CSS px เท่านั้น. คลิกได้โดยตรงแม้ child iframe กำลังโหลดผิดพลาด.
- เพิ่มฟังก์ชัน `window.WD_BOOKS_FLIP_EXIT(sourceWindow, bookId, chapter)` ฝั่ง parent (same-origin only) ตรวจ frame identity, bookId, dialog state, chapter integer range. เมื่อปิดใช้ close event เดิมเพื่อคืน focus / progress และ unload iframe.
- ฝั่ง child กดปุ่มกลับ → เรียก function แบบ synchronous ก่อน, ถ้า parent รุ่นเก่าหรือเรียกไม่ได้ fallback เป็น `wd:flip08b:exit` ผ่าน postMessage ที่มี origin/source/book validation เดิม. Child เปิด `WD_BOOKS_FLIP_CURRENT_CHAPTER` เฉพาะเมื่อเปิดแบบ embedded.
- Parent header X ยังคงอยู่เป็น fallback. โหมดอ่านเดิมไม่เปลี่ยน ไม่รีเซ็ต stored progress, bookmarks, podcasts.

## Release/QA

- bump `assets/app-version.js`, `index.html`, `sw.js` เป็น v1.3.64; iframe CSS/JS URLs bust cache.
- JavaScript + behavior test:
  - `tests/flipbook-return-child.behavior.cjs` — direct exit / fallback / standalone / chapter validation
  - `tests/flipbook-reader-bridge.behavior.cjs` — parent button / stale child / frame validation / progress restore
  - `tests/flipbook-desktop-layout.smoke.cjs` — responsive CSS contract, parent control and version
  - regression: `tests/flipbook-reader-choice.smoke.cjs`, `tests/flipbook-corner.smoke.cjs`, `tests/flipbook-ios-embed.smoke.cjs`
- Manual device gate pending: iPhone PWA tap **bottom “กลับไปอ่าน”** from cover and middle chapter; test parent X; Desktop Chrome 100% browser zoom, landscape and window resize, page 1–last, font 100/140/160, navigation always visible; iPad portrait/landscape and keyboard.
- This is a limited rollout for the same published sample book; no general book rollout, no data migration, no new runtime CDN or Google font file distribution.

## Rollback

Revert only FLIP-09 release commit. Never clear PWA cache manually, browser/localStorage, saved progress, or uninstall the app to repair Flipbook.
