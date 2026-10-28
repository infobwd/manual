# FLIP-10 — Unified Reader Controls (มือถือ/แท็บเล็ต) · 28 ตุลาคม 2569

**Repository:** `infobwd/manual` · **Version:** `1.3.65` · **Status:** coded / device QA pending

## ข้อเสนอที่ได้รับการยืนยันจากภาพ

ผู้ใช้ต้องการให้ **โหมดพลิกกระดาษบน iPhone และ iPad มีชุดปุ่มหน้าตาและตำแหน่งเหมือน Reader ปกติ** มากกว่าการมีตัวเลือกหนังสือใน iframe และปุ่มกลับไปอ่านแยกกัน ภาพประกอบแสดง Reader ปกติ: แถบบนมีสารบัญ ชื่อหนังสือ ฟังหนังสือ เมนู ⋯ และแถบล่างมี ก่อนหน้า เลขหน้า ถัดไป และ ✕.

## Implementation

- **≤1100 CSS px:** แสดง header ที่ parent dialog เป็น `สารบัญ · ชื่อหนังสือ · 🎧 · ⋯`, ปุ่มที่ขนาดสัมผัสอย่างน้อย 45–49px. ชื่อหนังสือตัดด้วย ellipsis ไม่ทับปุ่ม
- **สารบัญ:** เปิดแผงรายการบทจริงใน iframe; แต่ละรายการกระโดดไปหน้าต้นบทและปิดแผง, ไฮไลต์บทปัจจุบัน
- **⋯:** เปิดเครื่องมืออ่านใน iframe สำหรับการเลือกบท, ปรับอักษร 90–160%, เปลี่ยนโหมดสีและ Motion; กดปิดหรือ Escape ได้
- **🎧:** ปิด Flipbook แล้วเปิดแผงเสียงเดิมใน Reader ไม่เล่นเสียงอัตโนมัติและไม่มีเครื่องเล่นเสียงจำลอง
- **แถบล่าง:** `← ก่อนหน้า | หน้า… / พลิกทีละหน้า | ถัดไป → | ✕`; parent เป็นเจ้าของปุ่ม ✕ เพื่อความเสถียรบน iOS, child ยังมี fallback direct exit / postMessage
- **iPad portrait/landscape ≤1100px:** ใช้แถบเครื่องมือเดียวกันกับ iPhone, หนังสือหน้าเดี่ยวตาม engine เดิม, navigator อยู่ล่างไม่ต้องเลื่อนเพื่อหา
- **Desktop >1100px:** รักษา FLIP-09 หน้าคู่ fullscreen และชุดเครื่องมือเดิมทั้งหมด
- **หนังสือ:** เปิดเพียงเล่มสาธารณะที่ทดสอบไว้; ไม่มีการเปลี่ยน Reader/PWA storage schema, Podcast, content catalog หรือฟอนต์หลัก

## Gate

- Static test `tests/flipbook-native-mobile-controls.smoke.cjs`
- Behavior `tests/flipbook-reader-bridge.behavior.cjs` (TOC/tools/audio/close/message validation)
- Regression `tests/flipbook-corner.smoke.cjs`, `tests/flipbook-return-child.behavior.cjs`, `tests/flipbook-ios-embed.smoke.cjs`, `tests/flipbook-desktop-layout.smoke.cjs`.
- **Must test on device after deploy:** iPhone PWA top TOC/list navigation; tools font/theme; 🎧 returns to Reader and opens audio; bottom ✕ closes; small viewport/landscape; iPad portrait/landscape and split view. Desktop verify unchanged. Verify reader audio still doesn't autoplay.
- **PWA:** v1.3.65 changes shell and asset version; user should update through Settings → ตรวจสอบอัปเดต. Avoid resetting progress/cache.

## Rollback

Revert only FLIP-10 PR; original Reader and FLIP-09 remain. Never delete user bookmarks or uninstall the PWA as a workaround.
