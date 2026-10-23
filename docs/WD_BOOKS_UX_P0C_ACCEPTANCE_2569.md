# WD Books — UX-P0C Swipe & Reading Focus Acceptance (ปี 2569)

**วันที่:** 23 ตุลาคม 2569  
**Roadmap:** [WD_BOOKS_READER_UX_ROADMAP_2569.md](WD_BOOKS_READER_UX_ROADMAP_2569.md)  
**สถานะ:** IMPLEMENTED IN FEATURE BRANCH · AWAITING REAL-DEVICE QA / OWNER ACCEPTANCE  
**อ้างอิง:** UX-P0A (PR #8) และ UX-P0B (PR #9) ถูก Merge เข้า `main` แล้ว

## 1. ขอบเขต UX-P0C

- บนมือถือและหน้าจอ Reader **ไม่เกิน 850 CSS px**: ปัดซ้าย → หน้าถัดไป, ปัดขวา → หน้าก่อน และแตะพื้นที่ขอบกระดาษซ้าย/ขวาเพื่อเปลี่ยนหน้า
- แตะบริเวณ **กลางกระดาษ** เพื่อซ่อน/แสดงแถบเครื่องมืออ่าน; มีปุ่มที่โฟกัสได้ด้วยคีย์บอร์ด “ซ่อนเมนู / แสดงเมนู” พร้อม `aria-pressed`
- ขณะซ่อนเครื่องมือ: คงปุ่ม **✕ ปิดอ่าน** ด้านขวาล่างไว้เสมอ และจัดให้อยู่ในแถวของตัวเอง ไม่ลอยทับย่อหน้า; ปุ่มแสดงเมนูยังมองเห็นและใช้งานได้
- ปุ่มหน้าก่อน/ถัดไปและ ArrowLeft/ArrowRight ไม่ถูกนำออก; เมื่อโหมดอ่านเปิดอยู่ กด Escape/Back ก่อนหนึ่งครั้งเพื่อแสดงเครื่องมือ (แทนปิดหนังสือทันที)
- ป้องกันการเริ่ม Swipe จากขอบหน้าจอ 32 CSS px เพื่อลดความขัดแย้งกับ iOS Back; ไม่ใช้ `preventDefault()` จึงยังเลื่อนแนวตั้งและ pinch zoom ได้
- ต้องขยับแนวนอน **อย่างน้อย 60 CSS px** และมากกว่าระยะแนวตั้ง 1.45 เท่า; ถ้าระหว่าง gesture เห็นการเลื่อนแนวตั้งชัดเจนจะไม่ถือเป็น Swipe
- ไม่สั่งเปลี่ยนหน้าจากลิงก์/ปุ่ม/ช่องกรอก/ข้อความที่กำลังเลือก, เมื่อเปิดสารบัญ, เมื่อออกจาก Reader หรือเมื่อถูกยกเลิก gesture
- ยับยั้ง click ที่เบราว์เซอร์อาจสังเคราะห์หลัง Swipe หรือการเลื่อน เพื่อลดการเปลี่ยนหน้าซ้ำ
- ลดการเคลื่อนไหวเมื่อระบบตั้ง `prefers-reduced-motion` และป้องกันการสั่งพลิกหน้ารัวระหว่าง transition 105 ms
- เพิ่ม `assets/reader-p0c.css` และอัปเดต `sw.js` เป็น cache v8 สำหรับ PWA

**ไม่เปลี่ยน:** เนื้อหาคู่มือ, วิธีคำนวณหน้าปัจจุบัน, `localStorage` key `wd-manual-reader-v2`, รายการโปรด, โหมดถนอมสายตา, backend, hosting, GitHub Actions หรือข้อมูลนักเรียน

## 2. Acceptance Matrix

| ID | กรณี | ผลที่คาดหวัง | สถานะ |
|---|---|---|---|
| C01 | iPhone ปัดซ้าย/ขวา | ไปหน้าถัดไป/ก่อนหน้า 1 logical page; หน้าแรก/สุดท้ายไม่ล้น | PASS (จำลอง) |
| C02 | เลื่อนหน้าเนื้อหายาวในแนวตั้ง | ไม่พลิกหน้าผิด | PASS (จำลอง) |
| C03 | ท่าปัดเฉียง/เริ่มใกล้ขอบระบบ | ไม่แย่งการเลื่อนหรือ OS Back | PASS (จำลอง), ต้องทดสอบบน iPhone จริง |
| C04 | แตะขอบกระดาษซ้าย/ขวา | เปลี่ยนหน้าตามทิศทาง | PASS (จำลอง) |
| C05 | แตะกลางหน้ากระดาษ | ซ่อน/แสดง toolbar โดยไม่กระโดดหน้า | PASS (จำลอง) |
| C06 | ปุ่ม “แสดงเมนู” / Escape | คืนเครื่องมือและปุ่มคีย์บอร์ดโดยคงหน้าอ่าน | PASS (จำลอง) |
| C07 | โหมดอ่านเต็มจอ + ปิดอ่าน | ปุ่มปิดยังเห็นและไม่ทับข้อความ; ปิดแล้วกลับหน้าเดิมได้ | PASS เชิงโค้ด; รอตรวจ layout จริง |
| C08 | เปิดสารบัญ P0B ขณะอ่าน | ไม่พลิกหน้า/ไม่เปลี่ยนสถานะโดยไม่ตั้งใจ | PASS (จำลอง) |
| C09 | เลือกข้อความ, แตะลิงก์/ปุ่ม, pinch zoom | ไม่แทรกแซงหรือพลิกหน้าผิด | PASS ส่วน gesture (จำลอง); รอ QA จริง |
| C10 | Reduced Motion | เปลี่ยนหน้าได้โดยไม่ใช้เอฟเฟกต์; ปุ่มสำรองยังอยู่ | PASS (จำลอง) |
| C11 | อ่านต่อ / ประวัติ / Favorites หลังปิด-เปิด | ข้อมูล localStorage เดิมไม่หาย | PASS (จำลอง) |
| C12 | iPad portrait / landscape / Split View | จอแคบใช้ 1 หน้า, ไม่มีปุ่มทับเนื้อหา; Desktop ไม่ถูกกระทบ | รอ QA จริง |
| C13 | โหมด Light/Sepia/Night, 200% Zoom | ความเปรียบต่าง, safe-area, focus, controls ใช้งานได้ | รอ QA จริง |
| C14 | HTTPS Pages PWA online/offline upgrade v7→v8 | โหลด CSS ใหม่โดยไม่ลบข้อมูลในเครื่อง | รอ QA จริง |
| C15 | Screen Reader VoiceOver/TalkBack | ปุ่มแสดงเมนู, ปิดอ่าน, ปุ่มสำรอง และสารบัญเข้าถึงได้ | รอ QA จริง |

## 3. Test Evidence

ทดสอบ **ในสภาพแวดล้อม JavaScript/DOM จำลอง** จาก branch นี้แล้วผ่าน 5 ชุด:
```powershell
node tests/library.smoke.cjs
node tests/pwa-reader.smoke.cjs
node tests/home-p0a.smoke.cjs
node tests/mobile-toc-p0b.smoke.cjs
node tests/reader-p0c.smoke.cjs
```

- `tests/reader-p0c.smoke.cjs` ครอบคลุม swipe, ขอบหน้าจอ, vertical/diagonal gestures, selection, TOC, center tap, Escape, reduce motion, localStorage และ focus reset
- อัปเดต fixture ของ `tests/pwa-reader.smoke.cjs` และ `tests/home-p0a.smoke.cjs` ให้สถานะเริ่มต้นของ TOC เป็น hidden ตาม HTML จริง
- **ยังไม่ใช่ผลรัน Node บน Windows/iPhone/iPad จริง** และยังไม่รับรองผล PWA deployment

## 4. Local-First ขั้นตรวจรับ

จาก clone ของ `infobwd/manual` (ตรวจสอบก่อนว่า `D:\wd-books-p0c` ยังไม่มีและไม่มีงานค้าง):

```powershell
git fetch origin
git worktree add --detach D:\wd-books-p0c origin/feat/ux-p0c-swipe-reading-focus-25691023
cd D:\wd-books-p0c
node tests/library.smoke.cjs
node tests/pwa-reader.smoke.cjs
node tests/home-p0a.smoke.cjs
node tests/mobile-toc-p0b.smoke.cjs
node tests/reader-p0c.smoke.cjs
py -m http.server 4173 --bind 127.0.0.1
```

เปิด `http://127.0.0.1:4173/` บน Chrome/Edge แล้วจำลอง 375×812, 390×844, 768×1024 และ Zoom 200%. สำหรับ iPhone/iPad จริงใช้ HTTPS preview / Pages หลังอนุมัติ Merge เนื่องจาก PWA/Service Worker บน LAN HTTP ไม่รับประกัน secure context

### QA บนอุปกรณ์จริงก่อน Merge

1. **iPhone Safari / PWA:** เปิดคู่มือสาธิต 8 หน้าและ WD Growth 15 หน้า แล้วทดสอบ swipe กลางหน้าจอ, แตะขอบกระดาษ, แตะกลางหน้า, กลับไปอ่านต่อ
2. **เลื่อนขึ้น-ลง:** ในหน้าที่มีข้อความยาว กวาดนิ้วทแยง/เลื่อนแนวตั้ง แล้วตรวจว่าเลขหน้าไม่เปลี่ยนเอง
3. **iOS Edge Back/Select:** ปัดใกล้ขอบ Safari, เลือกข้อความ, สลับแอป; ทดสอบว่าจะไม่พลิกหน้าโดยไม่ตั้งใจ
4. **Reading Focus:** ซ่อน toolbar → ตรวจว่าปุ่มแสดงเมนู/ปิดอ่านมองเห็นแตะได้ ไม่ทับบรรทัดล่าง; กด Escape/Back (เครื่องที่รองรับ)
5. **TOC และ Reading Theme:** เปิดสารบัญแล้วพยายามปัด ไม่ต้องพลิกหน้าหนังสือ; Light/Sepia/Night และปรับอักษร
6. **iPad portrait/landscape:** ตรวจการเปลี่ยนขนาดและไม่ทำให้ปุ่มโฟกัส/ปิดบังเนื้อหา; UX-P0D จะรับผิดชอบการจัดหน้าคู่ละเอียด
7. **PWA:** ทดสอบปิด/เปิดแอป, Offline หลังใช้ออนไลน์ และอัปเดต SW v7→v8 หลัง Deploy

ภาพผลตรวจห้ามมีข้อมูลผู้เรียน ชื่อจริง คะแนนหรือความลับใน repository สาธารณะ

## 5. Release Gate / Next

- Branch และ PR นี้สำหรับตรวจรับ UX-P0C; **ยังไม่ Merge** จนกว่าจะอนุมัติและมีหลักฐาน QA ที่จำเป็น
- หากพบ gesture conflict หรือ focus accessibility regression ให้แก้บน branch ก่อน Merge และรันทดสอบ 5 ชุดซ้ำ
- หลัง Merge ตรวจหน้า Pages และแคช PWA รุ่น v8 บน iPhone/iPad โดยไม่ล้าง localStorage
- งานถัดไป **UX-P0D**: Tablet responsive logical-page mapping, iPad portrait/landscape, Split View, focus/zoom/accessibility; เปิด PR แยก
