# WD Books — FLIP-07 iOS iframe layout recovery + Sarabun typography (28 ต.ค. 2569)

**สถานะ:** Fix for iPhone PWA embedded Flipbook + Thai reading font; **post-deployment handset acceptance pending**  
**Branch:** `fix/flip07-ios-embed-layout-sarabun` · **Target version:** `1.3.58`  
**Scope:** `infobwd/manual` — ไม่แก้แค็ตตาล็อก เนื้อหาคู่มือ ความคืบหน้า / bookmark / Podcast หรือโหมดอ่านเดิม

## หลักฐานผู้ใช้

ภาพ iPhone แสดง FLIP-05 dialog, ชื่อหนังสือ / สารบัญ / ปุ่มนำทางครบ แต่หน้าเล่มว่าง พร้อมข้อความ `จัดหน้ากระดาษไม่สำเร็จ กรุณาลองปรับขนาดหน้าจอใหม่`; คอมพิวเตอร์เปิดได้. ผู้ใช้ต้องการเปลี่ยนเนื้อหาคู่มือบนคอมพิวเตอร์เป็น **Sarabun หรือ Google Sans ภาษาไทยแบบมีหัว**.

## Root cause / hypothesis

โค้ด FLIP-03/04 เรียก `paginate()` ขณะเริ่ม iframe และอ่าน `cornerFrame.getBoundingClientRect()` ทันที; FLIP-05 กำหนด `iframe.src` ก่อน `flipDialog.showModal()` และยังตั้ง `loading="lazy"`. บน WebKit/iOS nested iframe อาจถูก parse ก่อน layout ของ dialog/parent พร้อมใช้งาน; หน้ากระดาษที่มีความสูงหรือกว้างไม่เพียงพอทำให้ pagination ล้มได้. **ยังไม่สามารถยืนยัน stack trace จริงจาก iPhone** จึงถือเป็นสาเหตุที่มีน้ำหนัก ไม่ใช่การพิสูจน์ว่ามีเพียงสาเหตุเดียว.

## Implementation

1. เปลี่ยนลำดับเป็น **showModal → navigate iframe**, iframe `loading=eager`; จากฝั่งเอกสารลูกเริ่ม paginate หลัง **2 animation frames**.
2. ก่อนจัดหน้า ตรวจขนาด `cornerFrame` (width ≥120px, height ≥300px) และพื้นที่ `measure .page-content` (clientWidth ≥90, clientHeight ≥100). หากยังวัดไม่ได้ให้ลองใหม่ไม่เกิน 20 ครั้ง ×130 ms โดยไม่แสดง error prematurely; เมื่อ recovery ผ่าน จะล้าง error state.
3. เพิ่ม `ResizeObserver` ฟังขนาด stage ที่อาจเปลี่ยนโดยไม่มี window resize; re-pagination เมื่อโหลดฟอนต์เสร็จ. เมื่อ fail ไม่ซ่อน frame จนไม่มีโอกาสวัดขนาดอีก.
4. ปรับ page-height, padding และ toolbar เฉพาะ embedded iPhone ไม่กระทบ standalone `corner.html`. ยังคง StPageFlip, page turn, chapter anchor, keyboard, reduced motion, online-only preview และ fallback Reader แบบเดิม.
5. โหลด **Google Fonts Sarabun** (แบบไทยมีหัว) ใน `corner.html`; ตั้ง font-family ของเนื้อหา/หัวข้อ/ปกเป็น `Sarabun` ตามด้วย `TH Sarabun New`, `Noto Sans Thai`, `Tahoma`. หากบริการฟอนต์ไม่พร้อม จะใช้ fallback, ไม่ปิดการอ่าน. **ไม่ได้อ้างว่า Google Sans เป็นฟอนต์มีหัว** และไม่ได้แก้ฟอนต์ระบบ WD Books หลัก.
6. ออก PWA **v1.3.58** เพื่ออัปเดต HTML/app script/Service Worker; heavy Flipbook รวมถึงฟอนต์ยังไม่ถูก precache offline.

## Verification before merge

- `node tests/flipbook-ios-embed.smoke.cjs` — จำลอง iframe ที่วัดขนาดไม่ได้ 3 ครั้งก่อน recovery, และกรณีวัดไม่ได้ตลอดต้องหยุด retry ที่ 20 ครั้ง, ตรวจ Sarabun, async init, font/resize reflow, stage CSS.
- `node tests/flipbook-reader-choice.smoke.cjs` — ปุ่มเฉพาะหนังสือ, PWA 1.3.58, same-origin bridge และไม่มี stored reading mode ใหม่.
- `node tests/flipbook-reader-bridge.behavior.cjs` — เปิด/ปิด dialog, ตรวจ origin/frame/book/chapter, ฟื้นตำแหน่งอ่าน, offline fallback.
- `node tests/flipbook-corner.smoke.cjs` — StPageFlip, pagination, mobile page model; ยอมรับ Remote CSS เฉพาะ Google Fonts Sarabun แต่ไม่มี CDN JavaScript.

## Acceptance checklist — รอทดสอบบนเครื่องจริงหลัง Merge

| Device | Test | Expected |
|---|---|---|
| iPhone PWA v1.3.58 | เปิดคู่มือที่รองรับ → ⋯ → พลิกกระดาษ | เห็นหน้าปก ไม่ขึ้นข้อความ error และปุ่มตอบสนอง |
| iPhone PWA | พลิกจากหน้าปก → หน้าแรก → กลางบท; 100% → 140% | ข้อความไม่ตัด ไม่หลุดบท และ scroll แนวตั้งทำงาน |
| iPhone PWA | กดกลับไปอ่าน, เปิด Podcast แล้วเข้า/ออก Flipbook | กลับสู่ Reader/ตำแหน่งบท/เสียงอ่านตามสัญญาเดิม |
| Browser desktop | เปิด standalone + embedded, ทดสอบ 90/140/160% | หน้าคู่/หน้าปกทำงาน ฟอนต์ภาษาไทยมีหัว Sarabun |
| iPad Safari | portrait/landscape + Split View | จัดหน้าใหม่ได้ ไม่แสดง blank/error และไม่ข้ามหน้า |
| Offline | เปิดเล่มใน Reader หลัก | อ่านจาก cache เดิมได้; Flipbook ถูกปิดเมื่อออฟไลน์ |
| ทุกเครื่อง | เปิดหนังสืออื่น | ไม่มีการเปิด Flipbook ที่ยังไม่รองรับ |

**Rollback:** revert PR เฉพาะ FLIP-07; ห้าม clear localStorage, PWA caches หรือถอนแอปเพื่อแก้ปัญหา.
