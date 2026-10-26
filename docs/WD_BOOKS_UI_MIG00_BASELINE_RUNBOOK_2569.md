# WD Books — UI-MIG-00 Baseline & Read-Only Inspection Runbook

**Plan ID:** WD-BOOKS-UI-MIG-00  
**Version:** 1.0 · 26 ตุลาคม 2569  
**Status:** READY FOR EXECUTION / **ยังไม่ได้รันบน Windows/iPhone/iPad จริง**  
**Repository:** `infobwd/manual` (Public)  
**Parent technical plan (single source of truth):** [UI Stack Migration Plan](WD_BOOKS_UI_STACK_MIGRATION_TAILWIND_SHADCN_2569.md)  
**Master:** [Reader UX Roadmap](WD_BOOKS_READER_UX_ROADMAP_2569.md)

> เอกสารนี้เป็นขั้นตอนเตรียมข้อมูลจริงสำหรับ **Gate 0** เท่านั้น ไม่ใช่การเริ่มใช้ Tailwind CSS, React หรือ shadcn/ui และไม่อนุญาตให้แก้ Production PWA.

## 0. เป้าหมายและสิ่งส่งมอบ

เก็บหลักฐานก่อนเปลี่ยนเทคโนโลยีเพื่อเทียบ UI รุ่นเดิมกับต้นแบบ: ความสามารถการอ่าน, iPhone/iPad UX, catalog, ลักษณะ design tokens, local storage, audio, service worker, performance และข้อจำกัด. เมื่อครบแล้วจึงพิจารณา Gate 1 (ออกแบบหน้าตา) ใน PR ถัดไป.

**Deliverables Gate 0:**
1. `baseline_sha` ของ main, app version, ประเภทอุปกรณ์ และผลทดสอบลงบันทึก
2. ภาพ Home / Books / Reader / Settings / Audio ปัจจุบันตามขนาดหน้าจอที่มีจริง (ไม่ต้องอัปโหลดข้อมูลผู้ใช้/หนังสือส่วนตัว)
3. ตารางเทียบความเสี่ยงและรายการ DOM/CSS ที่จะได้รับผลกระทบ
4. ผลคำสั่ง Smoke tests พร้อม PASS/FAIL/NOT RUN ตามจริง
5. เกณฑ์เลือกต้นแบบ 3 หน้าจอสำหรับ UI-MIG-01; ยังไม่แก้หน้า Production

## 1. กฎก่อนแตะเครื่องและ Git

- **Local-First:** ห้ามสลับ branch ในโฟลเดอร์ที่มีงานยังไม่ commit หรือไปแก้ `D:\wd-standard` ของโครงการอื่น
- ใช้ clone ที่เป็น `infobwd/manual` เท่านั้น; สร้าง worktree แยกหลังตรวจว่าโฟลเดอร์ปลายทางยังไม่อยู่; **ห้ามรัน force / clean / reset hard**
- ปฏิบัติ read-only ต่อโค้ดและข้อมูลผู้ใช้, ไม่เปิด GitHub Actions / ไม่ติดตั้ง package ใหม่สำหรับ M0
- ไม่บันทึกชื่อ/รูป/คะแนนเด็ก, tokens, credential, log ส่วนตัว หรือ export localStorage ลง repo Public
- ถ้าทดสอบบนเครื่องที่มีข้อมูลอ่านจริง ให้สังเกตค่าที่แสดงได้ โดยไม่ล้าง site data หรือ uninstall PWA
- การทดสอบ Safari บน iPhone/iPad กับ `localhost` ของ Windows โดยตรงจะไม่ทำงาน; ให้ใช้ Production ที่เปิดได้อยู่แล้วสำหรับ device baseline หรือเปิดทดสอบ LAN ที่ได้รับอนุญาตแยกต่างหาก

## 2. Windows / VS Code — ขั้นตอนอ่านสถานะที่ทำซ้ำได้

เปิด PowerShell ในเครื่องที่มี clone `manual` โดยตรวจ `git remote -v` ก่อน แล้วใช้คำสั่ง **ตัวอย่าง**:

```powershell
# รันในโฟลเดอร์ clone ของ infobwd/manual
git remote -v
git status --short
git fetch origin
git rev-parse origin/main
git worktree list

# ใช้เฉพาะเมื่อ D:\wd-books-ui-mig00 ยังไม่มีอยู่
git worktree add --detach D:\wd-books-ui-mig00 origin/main
Set-Location D:\wd-books-ui-mig00

git rev-parse HEAD
Get-Content .\assets\app-version.js
node --version
node .\tests\js-syntax-gate.cjs
node .\tests\manuals-data-syntax.smoke.cjs
node .\tests\library.smoke.cjs
node .\tests\pwa-reader.smoke.cjs
node .\tests\pwa-update-lifecycle.smoke.cjs
node .\tests\ipad-reader-layout.smoke.cjs
node .\tests\audio-reader-integration.smoke.cjs
node .\tests\listening-now-playing.smoke.cjs

# ปิด/หยุดเซิร์ฟเวอร์หลังตรวจในเบราว์เซอร์ด้วย Ctrl+C
py -m http.server 4173 --bind 127.0.0.1
```

เปิด `http://127.0.0.1:4173/` บน Windows เพื่อสังเกต Home, Reader และ Console. ถ้าบาง test ใช้เวอร์ชัน Node ใหม่กว่า ให้บันทึก FAIL/NOT RUN พร้อมเวอร์ชันและเหตุผล ไม่แก้ test เพื่อทำให้ผ่านใน Gate 0. อย่าอ้างว่าขั้นตอนนี้รันผ่านแล้วเพียงเพราะมีคำสั่งอยู่ในเอกสาร.

## 3. Inventory ที่ต้องบันทึกก่อนออกแบบใหม่

| Area | อ่านไฟล์/องค์ประกอบ | รายการที่ห้ามหายในการย้าย |
|---|---|---|
| Entry/Assets | `index.html` + ลำดับ defer scripts/CSS | Bootstrap order, script errors, routing หน้าเดิม |
| Design Tokens | `assets/styles.css`, `app-experience.css`, `home-p0a.css`, `mobile-reader.css` | สี pine/paper/ink, theme light/sepia/night, ไทย readability |
| Catalog | `assets/manuals-data.js`, `catalog-core.js`, `catalog-ui.js` | published filter, book IDs, search/order, coverTitle และข้อความ |
| Reading State | `assets/experience.js`, key `wd-manual-reader-v2` | recent, favorites, progress, bookmarks, typography, reading mode |
| Reader | `assets/app.js`, `reader-coordinator.js`, `toc-p0b.css` | หน้าเดียว/หน้าคู่, สารบัญ, Escape, focus return, continuous |
| Audio | `audio-reader-core.js`, `audio-reader.js`, `audio-listening-lock.js` | สถานะเล่นเสียง, Now Playing, lock screen และข้อจำกัด browser |
| PWA | `sw.js`, `assets/app-version.js`, `manifest.webmanifest` | offline shell, waiting update, เวอร์ชันไม่ซ้ำ, ไม่ลบ preferences |

**Initial tokens ที่เห็นจากโค้ดเดิม (ไม่ใช่ Design System ฉบับอนุมัติ):**
`--pine:#174f47`, `--pine-deep:#103e36`, `--paper:#f8f7f2`, `--ink:#213d39`, `--surface:#fff`.

ตรวจ selector ที่กำหนดปุ่ม/การ์ด/Modal ซ้ำใน CSS หลายไฟล์ก่อนเริ่ม Tailwind; ระบุแต่ละจุดว่าอยู่ใน global root หรือ Reader subtree เพื่อป้องกัน reset และ specificity collision. M0 ห้ามเปลี่ยน CSS เหล่านี้.

## 4. Device & Visual Baseline Matrix

ใช้หนังสือ **published และสาธารณะ** เท่านั้น; เก็บวันที่ เวลา device/OS/browser viewport/theme และอัตราขยาย. คำว่า **NOT TESTED** ดีกว่าการเดาว่าผ่าน.

| รหัส | Device/Mode | ดูสิ่งใด | สถานะเริ่มต้น |
|---|---|---|---|
| V01 | iPhone Safari portrait | ค้นหา เปิดหนังสือ แตะอ่านต่อ/ปิดด้วยนิ้วโป้ง ตัวอักษร 90–160% | NOT TESTED |
| V02 | iPhone Installed PWA | เปิดใหม่/อ่านค้าง offline/กลับออนไลน์ และปุ่ม Update | NOT TESTED |
| V03 | iPad Safari/PWA portrait | ความกว้างหน้าหนังสือ หน้ากระดาษเดียว สารบัญ/ปุ่มปิด | NOT TESTED |
| V04 | iPad landscape/Split View ถ้ามี | หน้าเดียว/หน้าคู่ สารบัญ scroll อิสระ safe-area | NOT TESTED |
| V05 | Windows Chrome/Edge 1366/1440px | Catalog, Reader, keyboard/Tab/Esc, 200% zoom | NOT TESTED |
| V06 | Android Chrome/PWA ถ้ามี | Catalog/Reader/offline และ touch targets | NOT TESTED |
| V07 | Audio (อุปกรณ์ที่รองรับ) | Play/pause, Thai TTS, lock screen, online fallback, media session | NOT TESTED |
| V08 | Accessibility | Contrast, focus outline, VoiceOver หรือ screen-reader เมื่อมี | NOT TESTED |

**เทมเพลตหลักฐาน (ไม่ใช่ผลจริง):**

```text
ID:
Date/time:
Repository SHA:
WD Books visible PWA version:
Device / OS / browser:
Viewport CSS px / orientation / theme:
Test steps:
Result: PASS | FAIL | NOT TESTED
Observed issue (facts only):
Public-safe screenshot filename:
Tester:
Next action:
```

ภาพประกอบก่อนอัปโหลดต้องตรวจว่าไม่มีชื่อ/หน้าเด็ก, ข้อมูลบุคคล หรือการแจ้งเตือนที่เป็นส่วนตัว และต้องแยกว่า **ภาพบน emulator** กับ **ภาพเครื่องจริง**.

## 5. ตัวชี้วัดก่อนและหลัง (ยังไม่มีค่าที่วัดแล้ว)

| Metric | วิธี/เงื่อนไข | Baseline | Prototype | Gate |
|---|---|---|---|---|
| cold load / warm load | 3 รอบต่ออุปกรณ์และเครือข่ายใกล้เคียง | NOT MEASURED | NOT MEASURED | ไม่ถดถอยโดยไม่มีเหตุผล |
| search response | คำค้นไทยเดิม + รายการผลที่ตรวจด้วยสายตา | NOT MEASURED | NOT MEASURED | ผลเหมือนเดิม |
| first book open | เล่มเดียวกัน 3 รอบ วัดตอนเปิดเนื้อหา | NOT MEASURED | NOT MEASURED | ไม่ช้าลงอย่างมีนัยสำคัญ |
| asset transfer size | DevTools Network transfer / resource | NOT MEASURED | NOT MEASURED | บันทึกเพิ่ม/ลดพร้อมเหตุผล |
| memory / battery proxy | ดู memory เมื่อเครื่องรองรับ; ประเมินการเล่นเสียงเป็นกิจกรรมเฉพาะ | NOT MEASURED | NOT MEASURED | ไม่อ้างความประหยัดแบตหากยังไม่มีข้อมูล |
| offline & update | PWA ที่ใช้งานจริงกับ cache รุ่นเก่าตามขั้นตอนที่ปลอดภัย | NOT TESTED | NOT TESTED | ห้ามข้อมูลหาย |

อย่าตั้งข้อความว่า “เร็วขึ้น x%” หรือ “UI ใหม่ดีกว่าแน่นอน” ก่อนมีผลก่อน/หลังครบ; ให้บันทึกความแปรปรวน และรายงานทั้งความรู้สึกของผู้ใช้กับเวลาที่วัดได้.

## 6. Gate 0 Acceptance / Handoff → UI-MIG-01

| Checklist | สถานะเริ่มต้น |
|---|---|
| [ ] มี HEAD SHA, version, เวลาและอุปกรณ์ที่ใช้จริง | NOT STARTED |
| [ ] มีผล Node smoke suite พร้อม log โดยไม่มี secrets | NOT STARTED |
| [ ] มี screenshot ก่อนปรับ Home, Books, Settings, Reader ในมือถือและแท็บเล็ต | NOT STARTED |
| [ ] มี inventory CSS/component/DOM ownership และรายการ regression | NOT STARTED |
| [ ] ตรวจ book IDs, published, storage, Reader, Audio, PWA constraints | NOT STARTED |
| [ ] ระบุปัญหา UX สำคัญ 3–5 จุดและภาพต้นแบบที่ต้องแก้ | NOT STARTED |
| [ ] Owner ตรวจรับว่าจะเปิดงาน UI-MIG-01 หรือหยุดไว้ก่อน | NOT STARTED |

**นิยาม “จบ UI-MIG-00”:** ได้หลักฐาน baseline และความเสี่ยงเพียงพอที่จะเริ่มออกแบบต้นแบบ **โดยไม่แตะ Production**. ห้ามถือว่าการ Merge เอกสารนี้คือ Gate 0 PASS; ผู้รับผิดชอบต้องตรวจรับจากหลักฐานจริงก่อน.

## 7. Decision / Rollback / Multi-chat Coordination

- งานนี้เป็น child of `WD-BOOKS-UI-STACK-01` ไม่ตั้ง roadmap หรือ architecture decision แข่งกับแผนเดิม; ใช้ `UI-MIG-00` เป็นรหัสงานเดียว.
- ก่อนสร้าง PR ใหม่ ให้ตรวจ HEAD `main`, PR ที่แตะ UI/PWA และ link แผนแม่; ไม่อนุญาตให้ branch หลายแชท bump PWA release version เดียวกัน.
- ถ้าทดลอง React ภายหลัง ให้ทำ **UI-MIG-02** หลัง Gate 1; preview ต้องอยู่แยกจาก DOM Reader และ Service Worker ของ Production.
- หากเกิดข้อขัดข้องใน M0 ให้หยุดการเก็บหลักฐานและกลับไปใช้เว็บปกติ; M0 ไม่ควรมีไฟล์ Production ที่ต้อง revert.
- ห้ามล้าง `wd-manual-reader-v2`, ถอนติดตั้ง PWA หรือลบ user data เพื่อให้ผลการทดลองดูดี.

## 8. Links and sources of truth

- [UI Stack Migration Plan (single plan)](WD_BOOKS_UI_STACK_MIGRATION_TAILWIND_SHADCN_2569.md)
- [Master Reader UX Roadmap](WD_BOOKS_READER_UX_ROADMAP_2569.md)
- [ARCH-01 Nonbreaking Contracts](WD_BOOKS_ARCH01_BASELINE_2569.md)
- [ARCH-01E Performance Baseline](WD_BOOKS_ARCH01E_PERFORMANCE_BASELINE_2569.md)
- [PWA Incident / Release Gate](WD_BOOKS_PWA_INCIDENT_25691025.md)
- [Tailwind + Vite Official Docs](https://tailwindcss.com/docs/installation/using-vite)
- [shadcn/ui + Vite Official Docs](https://ui.shadcn.com/docs/installation/vite)
