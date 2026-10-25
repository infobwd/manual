# WD Books — Reader Experience Roadmap (Mobile/Tablet-first) ปี 2569

**Plan ID:** WD-BOOKS-UX-2569  
**Version:** 1.1 · 23 ตุลาคม 2569 (Master Roadmap reconciliation)  
**Repository:** infobwd/manual (Public)  
**Status:** WD Books 1.3.3 merged (PR #41); QA-DEVICE-GATE เปิดเตรียมตรวจรับ ยังไม่มีหลักฐานอุปกรณ์จริงครบ  
**Product:** https://infobwd.github.io/manual/  
**กลุ่มใช้งานหลัก:** ครู/บุคลากรโรงเรียนบน iPhone และ iPad, รองลงมาคือ Android และ Desktop  
**Source of truth:** เอกสารนี้ใช้กำหนดลำดับงาน, acceptance และ rollout ของการปรับ UX ใน repo นี้ ไม่แก้เนื้อหาวิชาการหรือระบบ WD Growth ต้นทาง

## Hotfix reconciliation — 25 ต.ค. 2569 (ภายใต้ Master Roadmap เดิม)

**ข้อสรุป:** ไม่สร้าง roadmap คู่ขนาน; เพิ่ม defect follow-up ของ UX-P0C, UX-P0D และ QA-DEVICE-GATE เดิมเท่านั้น ห้ามถือว่า Merge = Device QA ผ่าน.

| Defect ID | หลักฐานปัญหา | ขอบเขตการแก้ | Gate |
| --- | --- | --- | --- |
| CARD-NEWLINE-FIX | ปก 4 เล่ม (AI & School Today, M1, M0, SAR 2568) มีอักขระ `\\n` แทนการขึ้นบรรทัด | แก้ `coverTitle` ใน `assets/manuals-data.js` เป็น newline จริง; ทดสอบทั้งคลัง ปก, อ่านต่อ, ไม่เปลี่ยน ID/เนื้อหา | หนังสือเปิดได้ทุกเล่ม; ทดสอบ syntax + literal backslash-n; ตรวจ iPhone/iPad/Desktop และ cache หลังปล่อย — **implementation candidate / QA pending** |
| UX-P0C-R | ปุ่ม “เต็มจอ” ในปัจจุบันเป็น Focus Mode, ผู้ใช้เข้าใจว่าเครื่องมือหาย | คง Focus Mode, ตั้งชื่อให้ตรงกับพฤติกรรม, เรียกเมนู/สารบัญ/เครื่องมือกลับได้เสมอ; ยังไม่เพิ่ม browser Fullscreen API | Desktop/iPad เข้าและออก Focus Mode แล้ว ค้นหา, Aa, Theme, TOC, close, page controls ยังทำงาน; Esc/focus ไม่ค้าง — **implementation candidate / device QA pending (UX-P0C-R)** |
| UX-P0D-R | iPad 1032×1376 modal เตี้ยและเสียพื้นที่; Desktop มีขอบว่างมาก | ปรับ reader dialog ให้เหมาะกับ viewport, ใช้จอแนวตั้งหน้าเดียวและจอกว้างหน้าคู่ตาม threshold ที่มีอยู่; คง safe area | iPad portrait/landscape/Split View, Desktop 1366/1712px, typography 90–160%, orientation/progress ไม่สูญหาย — **implementation candidate / device QA pending (UX-P0D-R)** |

**ลำดับ:** CARD-NEWLINE-FIX → UX-P0C-R → UX-P0D-R → QA-DEVICE-GATE ที่มีแล้ว ตรวจ regression `wd-manual-reader-v2`, การเข้าถึง, ออฟไลน์ และ Service Worker cache. ใช้ภาพและผลเครื่องจริงเท่านั้นในการปิด Device QA; เก็บ PR/commit แยกตาม defect เพื่อป้องกันงานซ้อนทับ.

---

## ภาพตรวจจริง iPad 13 นิ้ว / UX-P0D-R2 + UX-P0B-R2 — 25 ต.ค. 2569

**หลักฐาน:** ภาพ Chrome Device Emulation iPad Pro 13, viewport 1032×1376 หลัง Merge v1.3.34. หน้ากระดาษขนาดจำกัดชิดซ้าย มีช่องว่างด้านขวาและเลขหน้าขึ้นก่อนสุดกระดาษ; ขาดสารบัญทั้งสองรูปแบบในช่วง 851–1100px. เป็นข้อมูลจำลอง viewport ไม่ใช่การทดสอบบนเครื่อง iPad จริง.

| Defect ID | สาเหตุที่ตรวจจากโค้ด | การแก้ใน candidate | ตรวจรับ |
| --- | --- | --- | --- |
| UX-P0D-R2 | `.reader-stage` ใช้ `align-items:stretch` ขณะที่ `.book-spread` / `.reader-bottom` มี `max-width:780px` → ชิดซ้าย, พื้นที่ขวาว่าง | จำกัดความกว้างที่สมดุลและตั้งกึ่งกลาง, คงหน้าเดียวเมื่อกว้างไม่เกิน 1100px, คงพื้นที่ scroll เดิม; เลขหน้าชิดท้ายกระดาษเมื่อเนื้อหาสั้น | iPad 1032×1376: ช่องว่างซ้าย/ขวาใกล้เคียง, ไม่มี overflow ด้านข้าง, ควบคุมหน้า/เลื่อนได้, ฟอนต์ 90–160% ไม่ตัดเนื้อหา — **candidate, device QA pending** |
| UX-P0B-R2 | JS single-page/mobile TOC ใช้ ≤1100px แต่ `toc-p0b.css` แสดงปุ่ม/overlay เฉพาะ ≤850px; desktop TOC ก็ถูกซ่อนในช่วง iPad → เข้าสารบัญไม่ได้ | ให้ปุ่มสารบัญและ bottom sheet มี breakpoint ≤1100px ตรงกับ JS/reader layout เดิม | กดสารบัญ/เลือกหน้า/ปิด/คืน focus ได้ที่ 851, 1024, 1032, 1100px; iPhone ≤850px และ Desktop ≥1101px ไม่เปลี่ยนพฤติกรรม — **candidate, device QA pending** |

### UX-P3A — Audio Reading / ฟังหนังสือแบบพอดแคสต์ (ขยายขอบเขตแผนเดิม ไม่สร้างโปรเจ็กต์ใหม่)

**เป้าหมาย:** ผู้อ่านเลือกหนังสือสาธารณะที่มีเสียงบรรยายแล้วกด “ฟังหนังสือ” เพื่อฟังต่อเนื่อง ฟังขณะทำงานอื่น หรือกดล็อกหน้าจอและควบคุมจาก Lock Screen/Bluetooth ได้ **เมื่ออุปกรณ์และเบราว์เซอร์รองรับจริง**. ยังไม่มีไฟล์เสียงบรรยายพร้อมใช้ใน repo; **ไม่อ้างว่าเล่นเสียงขณะล็อกได้แล้ว**.

**Architecture decision:** แยกสองระดับอย่างชัดเจน
- **P3A-0 Feasibility & content approval (ก่อนขึ้น UI):** ตรวจ license/TTS เสียงไทย คุณภาพสำเนียง ต้นทุนขนาดไฟล์ แหล่งผลิตเสียง และสถานะเผยแพร่ `published`. ห้ามส่งเนื้อหาภายใน/ข้อมูลส่วนบุคคลไป TTS ภายนอกโดยไม่ได้อนุมัติ; ไม่ฝัง API key ใน Public PWA.
- **P3A-1 Foreground proof-of-concept (optional):** ทดลอง `speechSynthesis` แบบเริ่มด้วยการแตะ พร้อมควบคุมหยุด/เล่นใหม่/อัตราอ่านเฉพาะเมื่อรองรับ; แจ้งให้ทราบว่าเสียง TTS สด **อาจหยุดเมื่อหน้าจอล็อก**, ไม่ใช้เป็นเกณฑ์ว่ารองรับ podcast/background.
- **P3A-2 Real background audio:** ผลิตไฟล์เสียงไทยที่ได้รับอนุญาตของหนังสือ Public Edition (แนะนำเริ่มต้น 1 เล่ม) เป็น **audio resource ที่เล่นผ่าน `<audio>`**, จัดทำ 1 stream/file ต่อเล่มใน pilot เพื่อลดปัญหา autoplay เมื่อข้ามไฟล์หลังล็อก; เพิ่ม chapter cue time offsets สำหรับข้ามบท; `navigator.mediaSession` metadata/title/artwork/play/pause/seek เมื่อรองรับ; รักษาหน้าอ่านเดิมเมื่อสลับกลับ.
- **P3A-3 Offline & catalog management (หลังผ่าน Gate):** เพิ่ม `audio` metadata แบบ optional เช่น `src`, `durationSeconds`, `chapterOffsets`, `narrationVersion`, `license`; นับ content version ไม่ให้เสียงเก่าไม่ตรงหน้า; ดาวน์โหลดออฟไลน์ *เฉพาะเล่มที่ผู้ใช้เลือก* พร้อม quota/error handling ไม่ pre-cache เสียงทุกเล่มใน Service Worker shell.

**Acceptance gate:** iPhone Safari, PWA Home Screen และ iPad Safari/PWA ทดลองล็อกจอจริง ≥10 นาที; เล่น/พัก/เล่นต่อ, control center, หูฟัง/Bluetooth, รับสาย/สลับแอป, screen reader/VoiceOver, เลือกบทและความเร็ว, audio sync กับ edition, reconnect/network offline, การจำตำแหน่งเสียงโดยไม่ทับ `wd-manual-reader-v2` เดิม; บันทึก **PASS/FAIL แยกอุปกรณ์/เวอร์ชัน iOS** และ fallback เมื่อ lock-screen controls ไม่รองรับ.

**ข้อจำกัดที่ต้องบอกผู้ใช้:** Media Session API รองรับต่างกันในแต่ละ browser และ WebKit มีประวัติปัญหา PWA auto-advance / resume บน lock screen. แค่มี Media Session หรือ Web Speech API ไม่เท่ากับรับรอง background playback.
- MDN: https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
- MDN: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- WebKit: https://bugs.webkit.org/show_bug.cgi?id=261858

**สถานะ:** Feasibility planned under existing UX-P3A; **ไม่มีการเพิ่ม player/เสียง/ผู้ให้บริการ TTS ใน PR แก้ iPad นี้**. ตัดสิน Go/No-Go ก่อน PR implementation เพื่อลดผลกระทบ Reader/PWA ปัจจุบัน.

---

## MASTER EXECUTION PLAN — ลำดับเดียวสำหรับงานเดิมและงานใหม่ (ปรับ 23 ต.ค. 2569)

**หลักการ:** ใช้เอกสารนี้เป็น Master Roadmap เพียงฉบับเดียว ไม่สร้างแผนคู่ขนาน; แยกสถานะ **Merged (รวมโค้ด)**, **Device QA pending (รอตรวจรับจริง)**, **Planned (ยังไม่ทำ)** และ **Accepted (ตรวจรับแล้ว)** ให้ชัดเจน ห้ามถือว่า Merge = QA ผ่าน

### A. Current Baseline (main)

- **WD Books 1.3.1 — PR #38 Merged:** คั่นหน้าแยกตามคู่มือ ค้นหา ยุบ/ขยาย และเปิดตอนโดยตรง; QA Android/iOS/Desktop, คั่นหน้า 50+ รายการ, offline/VoiceOver ยังรอตรวจรับครบ
- **PR #37 Merged / 1.3.0:** Sarabun มีหัวบน Android/desktop, ฟอนต์ระบบบน iOS, แนะนำติดตั้ง PWA ตามอุปกรณ์; ยังต้องตรวจอุปกรณ์จริง
- **PR #36 Merged / 1.2.9:** Google Sans Flex เป็นงานก่อนหน้า **ถูกแทนที่** โดยนโยบาย Sarabun ใน PR #37; ไม่ใช่สิ่งที่ต้องกลับไปทำ
- **PR #35 Merged / 1.2.8:** รวมคั่นหน้าในหน้า ของฉัน; พัฒนาต่อด้วย PR #38
- งานเดิมที่มี implementation แล้ว: TOC mobile, reader typography/Aa, Continuous/Paged, ค้นหาในเล่มและ jump, bookmarks, PWA; **ยังไม่ถือว่า acceptance ครบ** จนบันทึกผล regression จริง
- ตาราง Work Packages เดิมใน §4 เป็น **historical baseline**; ให้ใช้ตารางลำดับด้านล่างตัดสินใจทำงานต่อ หากสถานะขัดกัน

### B. Prioritized Execution Queue

| คิว | ID | ผลลัพธ์ | เหตุผล/เงื่อนไขก่อนทำ | เกณฑ์ตรวจรับและสถานะ |
|---|---|---|---|---|
| 1 | UX-FULLCARD | แตะการ์ดคู่มือบริเวณหน้าปก/ชื่อ/พื้นที่ว่างเพื่อเปิดอ่าน; หัวใจทำงานแยก | ปัญหาการแตะบนมือถือที่เห็นจริง; ห้าม nested interactive elements | เปิดด้วยแตะ/Enter/Space, หัวใจไม่เปิดเล่ม, draft ไม่ถูกเปิด, focus/keyboard ถูกต้อง — **MERGED PR #40 / QA PENDING** |
| 2 | UX-READER-CONTRAST | เพิ่ม contrast ชื่อเล่ม/ชื่อตอนบนแถบ Reader Android ทุกธีม | ภาพ Android แสดงข้อความจางมาก; ห้ามลดพื้นที่อ่าน/ขนาดปุ่ม | light/sepia/night, ชื่อยาว/ellipsis, TalkBack, zoom 200% — **MERGED PR #41 / QA PENDING** |
| 3 | QA-DEVICE-GATE | ตรวจ regression บน iPhone Safari/PWA, Android Chrome/PWA, iPad/Tablet, Desktop | ตรวจผลจาก PR #35–#38 และงาน Reader ก่อนขยายฟีเจอร์ | bookmark 0/1/50+, install banner, theme, offline/cache, keyboard, VoiceOver/TalkBack, persisted localStorage, safe-area; บันทึกหลักฐาน — **QA RUNBOOK READY / EXECUTION PENDING** |
| 4 | UX-SEARCH-HIGHLIGHT | ไฮไลต์คำที่ตรงผลค้นภายในคู่มืออย่างปลอดภัย | ต่อจากค้นหาและ jump เดิม; ห้ามแสดง draft/private | คำไทย, คำหลายจุด, ไม่แก้เนื้อหาต้นฉบับ/ไม่ทำ HTML injection, Paged/Continuous — **PLANNED** |
| 5 | UX-DISCOVERY | ปรับค้นหา/ตัวกรองและการค้นพบคู่มือเมื่อคลังขยาย | ทำหลังงาน usability ที่กระทบผู้ใช้ปัจจุบัน | เข้าถึงเล่มเร็ว, filter สถานะ published, ทดสอบรายการจำนวนมาก, mobile scroll — **PLANNED** |
| 6 | ARCH-01 | แยก app.js เป็นโมดูลตามหน้าที่ (Home/Catalog/My Books/Reader) และแยกทะเบียนจากเนื้อหา | ต้องมี regression gate และ snapshot behavior; คง PWA เดียว | ไม่มี breaking change ต่อ bookId, progress, bookmarks, favorites, URLs, reader settings; rollback ได้ — **PLANNED** |
| 7 | CAT-01 | Catalog metadata + lazy-load คู่มือและนโยบาย offline รายเล่ม | ทำหลัง ARCH-01; วัดขนาด bundle และ latency ก่อน | metadata id/title/category/status/version/content path; ไม่ cache ทุกเล่มอัตโนมัติ; update/invalidation, offline และ fallback ผ่าน — **PLANNED** |
| 8 | UX-P3A | ศึกษา Thai TTS/reading focus/accessibility ขั้นสูง | feasibility/privacy/copyright/a11y review ก่อนลงมือ | มี prototype และตัดสินใจ go/no-go; **BACKLOG** |

**ลำดับการทำงาน:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8; งาน 1–2 แยก PR, งาน 3 เป็น QA gate (ไม่จำเป็นต้องมี PR โค้ด), งาน 6–7 ห้ามย้ายสถาปัตยกรรมพร้อมปรับ UX หลายอย่างใน PR เดียว หาก QA พบ regression ให้แก้ก่อนดำเนินคิวถัดไป

### C. Scale and Architecture Decision Rules

- **1–20 คู่มือ:** โครงสร้าง static/PWA เดิมยังใช้ได้เมื่อ performance ผ่าน; ไม่ใช่ hard limit
- **20–100 คู่มือ:** พิจารณาแยกเนื้อหาเป็นไฟล์ต่อคู่มือ และโหลดเมื่อเปิดอ่านตามผลวัดขนาด/เวลาโหลดจริง
- **มากกว่า 100 คู่มือ:** พิจารณาดัชนีค้นหาแบ่งส่วน, lazy rendering และการเก็บออฟไลน์แบบเลือกเล่ม; ตัดสินจากจำนวนหน้า รูปภาพ และอุปกรณ์จริง ไม่ใช่จำนวนเล่มอย่างเดียว
- **โครงสร้างเป้าหมาย:** PWA/HTML shell เดียว; โมดูล UI แยกหน้าที่; catalog เก็บ ID ถาวร/ชื่อ/หมวด/สถานะ/เวอร์ชัน/ที่อยู่เนื้อหา; เนื้อหาแยกตามเล่มหรือบท; localStorage เดิมเป็น source of truth สำหรับ progress/favorites/bookmarks จนมี migration ที่ทดสอบแล้ว
- **ไม่ทำโดยอัตโนมัติ:** สร้างหลายเว็บไซต์, เปลี่ยน GitHub Pages, เพิ่มบัญชี/ฐานข้อมูล/server, sync ข้ามอุปกรณ์, GitHub Actions หรือข้อมูลนักเรียนจริงใน repo Public

### D. Definition of Done / Governance

1. งานแต่ละรายการมี branch + PR แยก; **ไม่ Merge โดยไม่มีคำอนุมัติชัดเจน**
2. ก่อน Merge ต้องตรวจ smoke/regression ที่ทำได้ และระบุชัดว่า device QA ใดค้าง; ห้ามอ้างว่าได้ทดสอบเครื่องจริงโดยไม่มีหลักฐาน
3. ตรวจทั้ง light/sepia/night, Android/iPhone/iPad/Desktop, accessibility, PWA offline/cache update, เนื้อหา published/draft
4. ตรวจข้อมูลเดิมใน `wd-manual-reader-v2`: bookmarks, favorites, progress, history, typography ต้องไม่สูญหาย; หากเปลี่ยน schema ต้องมี migration/rollback ที่ทดสอบได้
5. หลัง Merge อัปเดตเวอร์ชัน, PR/commit, ผล QA และคิวถัดไปใน Master Roadmap; บันทึกสถานะ Merged กับ Accepted แยกกัน
6. ทุกไฟล์ใน public repository ต้องเป็นข้อมูลเผยแพร่ได้; ไม่ใช้ข้อมูลนักเรียนจริงหรือเอกสาร private

---

## 0. เป้าหมาย / ขอบเขต / สิ่งที่ไม่ทำ

**แนวทางผลิตภัณฑ์:** “อ่านสวยแบบ Apple Books — ค้นหาขั้นตอนเร็วแบบคู่มือปฏิบัติงาน — ใช้มือเดียวได้บน iPhone และเปิดหน้าคู่สบายตาบน iPad”

ผลลัพธ์ที่ต้องการ:
1. เปิดแอปแล้วเห็น **อ่านต่อ** และ **คู่มือพร้อมอ่าน** โดยไม่เลื่อนผ่านแบนเนอร์/สถิติหลายส่วน
2. เข้าถึง **สารบัญ** ได้แม้จอมือถือ, เปลี่ยนหน้าสะดวก, ไม่เสียตำแหน่งเมื่อหมุนหน้าจอหรือเปลี่ยนขนาด viewport ใน session เดียว (ยังไม่มีการซิงก์ข้ามอุปกรณ์)
3. อ่านภาษาไทยสบายตา: ฟอนต์ ระยะบรรทัด ขอบกระดาษ โหมดสี และทางเลือกพลิกหน้า/เลื่อนต่อเนื่อง
4. พฤติกรรมเหมือนแอปที่เรียบหรู แต่เข้าถึงด้วยคีย์บอร์ด/VoiceOver/TalkBack ได้ และไม่ปิดบังเนื้อหา
5. ทำงานภายใต้ static GitHub Pages/PWA; เก็บประวัติ/ความชอบในเครื่องโดยไม่ต้องล็อกอิน

**ไม่ทำในระยะ P0–P2:** ย้ายฐานข้อมูล, สร้างบัญชีผู้ใช้, sync ระหว่างอุปกรณ์, ส่งประวัติอ่านไป server, โหลดข้อมูลส่วนบุคคล/คะแนนเด็ก, แก้เอกสารใน repo Private, สร้าง GitHub Actions, เปลี่ยน Hosting/Domain, คัดลอกภาพ/UI/ฟอนต์ที่มีลิขสิทธิ์จากแอปคู่แข่ง

**กติกาข้อมูล:** ทำตาม docs/CONTENT_GOVERNANCE_2569.md อย่างเคร่งครัด ข้อมูลทุกอย่างใน repo/Pages เป็นสาธารณะ; ทดสอบคู่มือด้วยเนื้อหาที่ผ่านอนุมัติและข้อมูลสังเคราะห์เท่านั้น

## 1. หลักฐาน/บทเรียนจากแอปอ่าน e-book ชั้นนำ

แนวคิดที่นำมาประยุกต์ ไม่ใช่การคัดลอกหน้าจอ:
- **Apple Books:** หน้าหนังสือเรียบ การตั้งค่าธีม/ฟอนต์ ระยะตัวอักษร/ขอบกระดาษ โหมดเลื่อนอ่าน และตำแหน่งเมนูที่เอื้อต่อมือข้างถนัด
- **Amazon Kindle:** เมนู Aa, ปรับระยะห่างและขอบกระดาษ โหมดเลื่อนต่อเนื่อง และการอ่านแบบลดสิ่งรบกวน
- **Kobo:** ปรับฟอนต์/ระยะบรรทัด/แนวข้อความ และสัดส่วนหน้ากระดาษบนจอหลายขนาด
- **Google Play Books:** แนวคิดความต่อเนื่องของห้องสมุดส่วนตัวและการอ่านบนหลายขนาดหน้าจอ (ใช้เป็นแรงบันดาลใจเชิง UX เท่านั้น)
- **Libby:** หลักการให้ผู้ใช้พบสารบัญ/ตำแหน่งอ่าน/เครื่องมือขณะจำเป็น ไม่ปล่อย toolbar บังเนื้อหาตลอดเวลา

แหล่งเปรียบเทียบหลัก (เอกสารช่วยเหลือเจ้าของผลิตภัณฑ์ ตรวจทาน 23 ต.ค. 2569):
- Apple Books: https://support.apple.com/guide/iphone/read-books-iphc1af7c57/27/ios/27
- Kindle Reading Apps: https://digprjsurvey.amazon.com/csad/help/node/TABlJ4ot69emTO8jJG
- Kobo Books App: https://help.kobo.com/hc/en-us/articles/360017865293-Adjust-page-margins-line-spacing-and-more-on-the-Kobo-Books-app-iOS-Android
- Kobo Web Reader: https://help.kobo.com/hc/en-us/articles/35996239522967-Kobo-Web-Reader-Navigation-Reading-Features

## 2. ตรวจสภาพระบบจริงก่อนเริ่มงาน (baseline จาก main วันที่ 23 ต.ค. 2569)

| เรื่อง | มีแล้ว | ช่องว่างที่ต้องแก้ |
|---|---|---|
| หน้าแรก/คลังคู่มือ | Hero, summary strip, filter, search, การ์ดปก | การ์ด “อ่านต่อ” ยังไม่อยู่บนสุด; รายการรอตรวจรับปะปนกับพร้อมอ่าน; Hero กินพื้นที่มือถือ |
| Reader | Dialog, ชื่อเล่ม, หน้าเดียวมือถือ / หน้าคู่จอกว้าง | Toolbar และแถบเปลี่ยนหน้าปรากฏตลอด; โหมดอ่านสบายตายังปรับไม่ครบ |
| สารบัญ | Reader TOC และคลิกข้ามบทบน Desktop | CSS ซ่อน .reader-toc ที่ ≤850px ไม่มีปุ่มแทน |
| เปลี่ยนหน้า | ปุ่มก่อน/ถัดไป, ArrowLeft/ArrowRight, progress | ยังไม่มี Swipe; แถบ progress ยังคลิกข้ามหน้าไม่ได้ |
| หน้าจอขนาดต่าง ๆ | Responsive CSS, layout หน้าเดียว/หน้าคู่ | จุดตัด 850px ของ reader กับ 1000px ของ shell/nav อาจทำให้ tablet บางขนาดแคบเกิน |
| การอ่านสบายตา | light/sepia/night; font 90–160%; PWA | ยังไม่มีเลือกฟอนต์ไทย, ระยะบรรทัด/ขอบ, mode เลื่อนต่อเนื่อง |
| ความต่อเนื่อง | localStorage key wd-manual-reader-v2 เก็บ recent, progress, favorites, history, theme, font | ต้องรักษาค่าที่เคยบันทึก และแยกการตั้งค่าใหม่แบบไม่ทำข้อมูลเดิมสูญหาย |
| PWA/Offline | manifest.webmanifest, sw.js, shell cache, splash/pull-refresh | ต้องตรวจบน iPhone/iPad จริง; ทุก PR ที่แก้ asset ต้องตรวจ cache invalidation |
| เนื้อหา | คู่มือสาธิต 8 หน้า และคู่มือ WD Growth รายบุคคล 15 หน้า | คู่มือปฏิบัติงานควรค้นหาข้อความในเล่มและกลับหัวข้อที่ต้องการได้เร็ว |

ไฟล์ต้นทางที่เกี่ยวข้อง: index.html, assets/styles.css, assets/app-experience.css, assets/mobile-reader.css, assets/app.js, assets/experience.js, assets/manuals-data.js, assets/wd-growth-individual-guide.js, manifest.webmanifest, sw.js, tests/library.smoke.cjs, tests/pwa-reader.smoke.cjs

> ข้อค้นพบข้างต้นเป็นการตรวจโค้ด; **ไม่ใช่ผลทดสอบ UX บนเครื่องจริง**. ก่อนแก้ implementation ต้องเก็บ baseline ภาพหน้าจอของผู้ใช้ทดลองบนเครื่องจริง (ไม่มีข้อมูลนักเรียน) และลงผลใน QA log

**เอกสารตรวจรับ UX-00:** [Baseline & Design Review](WD_BOOKS_UX00_BASELINE_AND_DESIGN_REVIEW_2569.md) และ [ตัวอย่างหน้าจอ HTML](previews/WD_BOOKS_UX00_READER_PREVIEW_2569.html) — ไม่มีการเปลี่ยนแอปใน UX-00 และรอภาพ baseline จริง/อนุมัติ D01–D05 ก่อนลงมือ UX-P0A.

**การเริ่ม P0A:** เจ้าของงานสั่งให้ดำเนินการต่อหลัง Merge UX-00; จัดทำ implementation บน branch แยกสำหรับตรวจรับได้ โดย **ไม่ถือว่า Gate 0 ผ่านหรืออนุมัติ Merge production**. ดู [UX-P0A Acceptance & QA](WD_BOOKS_UX_P0A_ACCEPTANCE_2569.md).

## 3. รูปแบบ UX เป้าหมาย

### 3.1 หน้าแรก: “ไปถึงหนังสือเร็วที่สุด”
ลำดับบนมือถือ:
1. Header ขนาดกระชับ — WD Books + ปุ่มค้นหา/ตั้งค่าเท่าที่จำเป็น
2. Search ที่เข้าถึงง่าย พร้อมตัวกรองหมวดเมื่อจำเป็น
3. “อ่านต่อจากครั้งล่าสุด” เมื่อมี progress (ชื่อเล่ม, หน้าที่อ่าน, ความคืบหน้า, แตะเดียวเปิด)
4. “คู่มือพร้อมอ่าน” เรียงก่อนรายการรอตรวจรับ; หนังสือของฉัน/เล่มโปรดเข้าถึงได้
5. Hero แนะนำ, ตัวเลขรวม, เกี่ยวกับเว็บไซต์/สถานะเตรียมเผยแพร่ ย้ายลงด้านล่างหรือย่อเป็นรายละเอียดรอง

เมนูล่างบนโทรศัพท์เสนอ 3 รายการ: **หน้าหลัก / คลังคู่มือ / ของฉัน**; ย้าย “อ่านต่อ” เป็นการ์ดเด่น และ “ตั้งค่า” เป็นปุ่มหน้าอ่าน/แผงตั้งค่า. ต้องไม่ซ้ำปุ่มหรือเสียฟังก์ชันเดิม

### 3.2 หน้าอ่านบน iPhone
- หน้าหนังสือเป็นพื้นที่หลัก; เห็นชื่อเล่ม/หน้าปัจจุบันแบบกระชับ
- ปุ่ม “สารบัญ” เรียกเป็น Bottom Sheet ครบทุกบท รวมตำแหน่งหน้าปัจจุบัน, เลือกบทและกลับไปอ่านได้
- ปัดซ้ายไป **หน้าถัดไป**, ปัดขวาไป **หน้าก่อน** (ภาษาไทยแนว LTR); ปุ่มก่อน/ถัดไปยังคงเป็นทางเลือกสำรอง
- แตะบริเวณกลางหน้าที่ไม่ใช่ลิงก์/ปุ่ม/ข้อความเลือก เพื่อแสดง/ซ่อน toolbar; ต้องมีวิธีเรียก toolbar ที่เข้าถึงด้วยคีย์บอร์ดและ screen reader เทียบเท่า
- ปุ่มปิดอ่านด้านขวาล่างที่มีอยู่ต้อง **ไม่บังย่อหน้า/ลิงก์/ปุ่มเปลี่ยนหน้า**; พิจารณาฝังไว้ใน chrome ที่ย่อ/ขยายได้ ไม่ทำให้ตำแหน่งปิดหาไม่เจอ
- ระหว่างเลื่อนอ่านข้อความยาวตามแนวตั้ง ห้ามท่าปัดแนวนอนถูกเรียกผิด; หลีกเลี่ยงแย่ง iOS back gesture จากขอบจอ
- เมื่อปิด/เปิดอีกครั้ง กลับหน้าเดิม; สถานะ scroll ย่อย (หากเพิ่มในอนาคต) ไม่ควรทำตำแหน่งสับสน

### 3.3 หน้าอ่านบน iPad/Tablet
- เลือกหน้าเดียวหรือหน้าคู่ตาม **พื้นที่อ่านที่ใช้ได้จริงหลังหักสารบัญและขอบ** ไม่ใช้ viewport breakpoint เพียงตัวเดียว
- โหมดแนวตั้งต้องไม่ทำหนังสือ 2 หน้าแคบเกิน; แนวนอนเปิด 2 หน้าเมื่อความกว้างเพียงพอ
- สารบัญเป็น side panel เมื่อพื้นที่กว้างพอ; เมื่อแคบใช้ Bottom Sheet และสามารถปิดสารบัญเองได้
- เปลี่ยน orientation และเปลี่ยนขนาดฟอนต์แล้วต้องอยู่ **หน้าเนื้อหาเดียวเดิม** ไม่กระโดดไปบทอื่น

### 3.4 รูปแบบการอ่าน 2 แบบ
1. **พลิกหน้า (Paged):** ตาม logical pages ที่ผู้เขียนกำหนดไว้, คงปุ่มเปลี่ยนหน้าและเลขหน้า
2. **เลื่อนต่อเนื่อง (Continuous):** ต่อเนื้อหาแต่ละ logical page เป็น sections พร้อมสารบัญแบบ jump-to-heading และไฮไลต์ตอนที่กำลังอ่าน

**กติกาออกแบบ:** ปัจจุบัน “หน้า” เป็นหน้าเนื้อหาในข้อมูล ไม่ใช่การจัดหน้ากระดาษอัตโนมัติแบบ EPUB; ห้ามอ้างว่า reflow pagination สมบูรณ์โดยยังไม่พัฒนา. ทั้งสองโหมดอ้างตำแหน่งกลางเป็น {bookId, sectionIndex} เหมือนกันก่อน แล้วออกแบบ fine scroll position เพิ่มเฉพาะเมื่อทดสอบความเสถียรแล้ว

## 4. Work Packages (ทำ PR ย่อยทีละงาน ไม่แก้ทุกอย่างพร้อมกัน)

| ID | ระยะ | งาน/ผลลัพธ์ | เงื่อนไขตรวจรับสำคัญ | สถานะ |
|---|---|---|---|---|
| UX-00 | Gate 0 | เก็บ baseline, ยืนยัน QA device matrix และสถาปัตยกรรม Reader | มีภาพ/บันทึก QA จากข้อมูลสาธารณะ, smoke tests เดิมผ่าน | IN PROGRESS — เอกสาร/Preview พร้อม; รอ QA จริง |
| UX-P0A | P0 | ลด Hero/สถิติ, นำ “อ่านต่อ” ขึ้นบน, พร้อมอ่านก่อน draft, tab bar 3 รายการ | อ่านเล่มล่าสุดได้ใน 1 แตะจาก Home; ไม่มีเมนูเดิมเสีย | MERGED PR #8 — รอ QA บนอุปกรณ์จริง |
| UX-P0B | P0 | Mobile TOC แบบ Bottom Sheet, ชี้ current section, คืน focus เมื่อปิด | มือถือเข้าบทที่เลือกได้ภายใน 2 แตะ; VoiceOver/keyboard ใช้ได้ | IMPLEMENTED — ตรวจ source และ smoke จำลองผ่าน; รอ QA จริง |
| UX-P0C | P0 | Swipe/แตะเปลี่ยนหน้า + reading chrome ที่แสดงเมื่อเรียกใช้ | ปัดแนวตั้งไม่เปลี่ยนหน้า; ปุ่มสำรอง/close ยังใช้งานได้; ไม่ปะทะ pull-refresh/OS edge | TODO |
| UX-P0D | P0 | ปรับพฤติกรรมหน้าคู่ tablet และ regression ก่อนปล่อย | portrait/landscape, safe area, iPad Split View, 200% zoom ไม่ตัดเนื้อหา | TODO |
| UX-P1A | P1 | แผง Aa + ฟอนต์ไทย/ขนาด/ระยะบรรทัด/ระยะขอบ | อ่านไทยทุกธีมได้ ไม่มี clipping; จำค่าเดิมและ rollback settings ได้ | TODO |
| UX-P1B | P1 | โหมด Continuous Scroll แยกจาก Paged | สลับโหมดไม่เปลี่ยนบท; progress/counter ถูกต้อง; ทางเลือกเดิมยังอยู่ | TODO |
| UX-P2A | P2 | ค้นหาข้อความภายในเล่มและ jump ผลค้น | ค้นภาษาไทยได้, highlight ปลอดภัย, ไม่ค้นเอกสาร draft/private | TODO |
| UX-P2B | P2 | Bookmark ตำแหน่ง/หัวข้อ, jump ตามสารบัญ/แถบเวลา | บันทึกในเครื่อง; ไม่กระทบ favorites หรือ history เดิม | TODO |
| UX-P3A | P3 | ศึกษา TTS ภาษาไทย/ตัวช่วยโฟกัสข้อความ/reader accessibility ขั้นสูง | ต้องทำ feasibility + privacy/copyright/a11y review ก่อนอนุมัติพัฒนา | BACKLOG |

**สำคัญ:** P0 คือความสะดวกในการใช้งาน ไม่ใช่ความจำเป็นต้องทำ animation พลิกกระดาษ 3D. ให้คง UI เรียบ สวย รวดเร็ว และทำงานได้แม้ Reduced Motion

## 5. เกณฑ์ Acceptance ที่ใช้เป็น Release Gate

### 5.1 Functional / Regression (ต้องผ่านทุกข้อก่อน Merge implementation)
- [ ] เปิดหนังสือสาธิต 8 หน้าและ WD Growth 15 หน้าได้ครบ ทั้งทุกตอนและหน้าสุดท้าย; ข้อความไม่สูญหาย
- [ ] หน้าแรกแสดง “อ่านต่อ” เฉพาะเมื่อมี progress และเปิดจากการ์ดได้ด้วยการแตะครั้งเดียว
- [ ] มือถือเปิด TOC ได้ เลือกหัวข้อได้ กลับมายัง reader ได้; บทปัจจุบันถูกเลือกถูกต้อง
- [ ] Swipe ซ้าย/ขวาเปลี่ยนหน้าได้; เลื่อนข้อความแนวตั้งไม่เผลอเปลี่ยนหน้า; iOS back gesture ไม่ถูกแย่ง
- [ ] กดปุ่มก่อน/ถัดไป, Keyboard ArrowLeft/ArrowRight/Esc และปุ่มปิดยังทำงาน ไม่ต้องใช้ gesture เท่านั้น
- [ ] ปรับขนาดฟอนต์/หมุนจอ/สลับหน้าเดียวหน้าคู่แล้วกลับบทเดิม; ไม่แสดงเลขหน้าที่เกินเนื้อหาจริง
- [ ] โหมดสว่าง/sepia/night, Splash, Pull-to-refresh, Favorites, Recent, PWA Install/Offline ยังทำงานตามเดิม
- [ ] ไม่มีข้อมูลผู้เรียนจริงหรือ asset จาก private repo ใน site build/cache/console

### 5.2 Accessibility / Visual
- [ ] อักษรภาษาไทยอ่านได้จริงทุกธีม พร้อมความต่างสีตาม WCAG 2.2 AA ที่เกี่ยวข้อง (ข้อความทั่วไปเป้าหมาย ≥4.5:1)
- [ ] ตรวจ text resize 200%, browser zoom/reflow, การตัดบรรทัดไทยและคำยาว ไม่ตัด/ซ่อนข้อความหรือปุ่ม
- [ ] Interactive targets ออกแบบเป้าหมาย ≥44×44 CSS px เมื่อทำได้ และมีระยะห่างป้องกันการแตะผิด
- [ ] โฟกัสคีย์บอร์ดเห็นชัด, native dialog focus return, aria-label ของ controls, VoiceOver/TalkBack ข้ามหัวข้อได้
- [ ] prefers-reduced-motion ลด/ปิด transition, ไม่มีเอฟเฟกต์บังคับ, การอ่านไม่ขึ้นกับ animation
- [ ] Safe-area (notch/home indicator) ไม่ทับปุ่ม; ปุ่มขวาล่างไม่ทับข้อความหรือลิงก์

### 5.3 Device Matrix / หลักฐาน
| อุปกรณ์/โหมด | ตรวจบังคับ |
|---|---|
| iPhone Safari และ Add to Home Screen | Portrait; มือเดียวขวา; safe area; Swipe vs Scroll; TOC; กลับมาอ่านต่อ; Reload |
| iPad Safari/PWA | Portrait, Landscape, Split View; หน้าคู่/หน้าเดียว; สารบัญ; เพิ่มอักษร |
| Android Chrome/PWA | Gesture, offline, install, ความต่อเนื่องของ storage |
| Windows Chrome/Edge | Keyboard, zoom 200%, sidebar, print fallback, console |
| ทุกอุปกรณ์ (อย่างน้อย 1 รุ่นจริงต่อแพลตฟอร์ม) | ลดการเคลื่อนไหว, รูปแบบธีม, ไม่เห็นเอกสาร private |

หลักฐานต่อ PR: บันทึกผล PASS/FAIL/NOT TESTED แยกตามเครื่อง + browser/OS version, screenshot **ข้อมูลสมมติเท่านั้น**, ระบุข้อบกพร่องและวิธีทดสอบซ้ำ. ให้ผู้ใช้งานโรงเรียนตรวจรับก่อน Merge implementation ทุกครั้ง

## 6. การออกแบบทางเทคนิค (Guardrails)

1. **Local-First:** ทดสอบ Windows + VS Code ผ่าน static localhost; ไม่เพิ่ม npm build requirement โดยไม่จำเป็น; ยังไม่ใช้ GitHub Actions สำหรับ QA
2. **ไฟล์แตะต้องน้อยที่สุด:** ใช้ index.html + assets/app.js/experience.js/CSS เป็นหลัก; แยกโมดูลใหม่เฉพาะเมื่อมีความจำเป็นและทดสอบแล้ว ลด CSS overrides ซ้ำซ้อนโดยค่อย ๆ รวมเมื่อปลอดภัย
3. **State compatibility:** เก็บ key เดิม **wd-manual-reader-v2** และ schema ปัจจุบัน (recent, progress, favorites, history, theme, font). หากเพิ่ม readerMode/spacing/margins/sectionBookmarks ต้องมีค่า default, migration แบบ additive, validation, fallback หาก localStorage ถูกปิด; ห้าม reset รายการเดิมเงียบ ๆ
4. **Interaction precedence:** ถ้า reader เปิดอยู่ gesture ภายใน reader ต้องไม่ไปเรียก Pull-to-refresh; ไม่ทำ swipe เมื่อผู้ใช้ scroll แนวตั้ง กดปุ่ม/ลิงก์ เลือกข้อความ หรือเรียก OS gesture; เห็นผลเท่าเทียมด้วย controls ที่ใช้มือหรือคีย์บอร์ด
5. **PWA:** Service Worker cache เฉพาะไฟล์สาธารณะ, version bump เมื่อ asset เปลี่ยน, ตรวจ cold start/offline/refresh/multi-tab update, ไม่แคชเอกสารไม่ผ่านอนุมัติ
6. **No PII:** ไม่มี analytics/cookies ใหม่; ไม่มี server sync; Local Favorites/Bookmarks เป็น preference ของผู้ใช้อุปกรณ์นั้นเท่านั้น และต้องบอกข้อจำกัดเมื่อ Clear Site Data
7. **Print:** การเพิ่ม Continuous mode ห้ามทำให้เอกสารพิมพ์/แบบฟอร์มแตกหรือเนื้อหาขาด; ไม่ทำ PDF iframe เป็น reader หลัก

## 7. ลำดับ Rollout / PR Gates

- **Gate 0 / UX-00:** QA baseline ผ่าน + ผู้บริหารเห็นชอบจุดเปลี่ยนของหน้า Home/Reader ก่อนแก้
- **P0:** เปิด PR แยก UX-P0A, UX-P0B, UX-P0C, UX-P0D; แต่ละ PR มีภาพ Before/After, smoke tests, accessibility evidence. Merge ทีละ PR หลังรับรอง; ไม่ Merge รวดเดียว
- **P1:** เริ่มหลัง P0 stable บน iPhone/iPad; ปรับข้อความและโหมดอ่านทีละส่วน; จัดเก็บ setting additive
- **P2:** เพิ่มเครื่องมือค้น/Bookmark เมื่อมีคู่มือจริงเพิ่มและครูเห็นความจำเป็น
- **P3:** รอการตัดสินใจใหม่; TTS/Highlight ภาษาต้องประเมินก่อนนำขึ้น Public PWA

**การทดสอบในเครื่องหลัก Windows อย่างปลอดภัย:** ใช้ worktree หรือ clone แยก; อย่าล้าง uncommitted work/เปลี่ยน branch ของเครื่องที่ทำงานอื่นอยู่

คำสั่งอ้างอิงเมื่อเริ่ม QA ในอนาคต (ใช้เฉพาะโฟลเดอร์ clone ที่ตรวจว่าปลอดภัยแล้ว):

    node tests/library.smoke.cjs
    node tests/pwa-reader.smoke.cjs
    py -m http.server 4173 --bind 127.0.0.1

**Deployment:** Pages จาก main/root ตามตั้งค่าปัจจุบัน; หลีกเลี่ยงการแก้ Production เพื่อดูตัวอย่างก่อนตรวจรับ. ใช้ localhost/แยก branch สำหรับ QA. ก่อน Merge ต้องยืนยัน preview ผ่านวิธีที่ปลอดภัยซึ่งไม่เปิดข้อมูล private

**Rollback:** หากหน้าเว็บจริงผิดปกติ ให้ revert เฉพาะ implementation PR ล่าสุดบน main + re-deploy, เก็บ localStorage เดิมไว้; เมื่อ schema เพิ่ม field ใหม่ให้ reader รุ่นเก่าเพิกเฉย field เพิ่มได้. Document-only PR นี้ไม่มีการเปลี่ยน runtime

## 8. Definition of Done ต่อหนึ่ง PR

- [ ] ระบุ scope และ acceptance ID ที่แก้, จุดที่ยังไม่ได้ทำ และเหตุผล
- [ ] มี automated local smoke tests ผ่าน (พร้อมบันทึกคำสั่งและผลจริง ไม่เขียน PASS ล่วงหน้า)
- [ ] ทดสอบ manual device matrix ที่เกี่ยวข้อง พร้อม screenshot/test notes ที่ปลอด PII
- [ ] ทำ Accessibility/Reduced Motion/Keyboard/Touch validation
- [ ] ตรวจว่าค่า localStorage เดิมไม่สูญหายและ PWA cache/update/offline ไม่ถอยหลัง
- [ ] อัปเดตเอกสาร README และ QA log; version/changelog ถ้าหน้า public เปลี่ยน
- [ ] ได้รับอนุมัติ Merge แยกจากการอนุมัติแผน และตรวจ Pages หลัง deploy จริง

## 9. Decisions / Open Questions

**กำหนดเพื่อใช้เริ่มออกแบบ แต่ยังแก้ได้ก่อน implementation:**
- เริ่มด้วย P0, ไม่เพิ่ม effect 3D หนัก, ใช้สีเขียว WD และไทยเป็นภาษา UI หลัก
- เก็บหน้าปก, favorites, progress, PWA, กติกาสาธารณะ และการอ่านหน้าเดี่ยว/หน้าคู่
- ให้ครูเข้าถึงหัวข้อในคู่มือได้เร็วกว่าเน้นภาพเหมือนกระดาษ

**ต้องทดสอบ/ตกลงใน Gate 0:** threshold หน้าคู่จาก usable width, ปุ่มปิดถาวรหรือ contextual, tap-edge vs swipe (โดยไม่ทำให้ iOS system navigation ขัดกัน), ตัวเลือกฟอนต์ไทยที่ใช้ได้แบบ offline, ความหมายของ progress ใน Continuous mode, วิธีแสดงหมวด draft และตัวกรองเมื่อจำนวนคู่มือเพิ่ม

**สถานะ UX-00 ณ 23 ต.ค. 2569:** สร้างต้นแบบและ checklist บน branch สำหรับตรวจรับแล้ว (ดูเอกสาร UX-00); ยังไม่มี UX implementation ตาม Roadmap นี้ ไม่มีการแก้ตัวแอปจริง และยังต้องทดสอบ iPhone/iPad กับยืนยัน Decision Register ก่อนเริ่ม P0.

**อัปเดต 23 ต.ค. 2569:** PR #8 Merge UX-P0A แล้ว และเริ่ม UX-P0B; ดู [UX-P0B Acceptance & QA](WD_BOOKS_UX_P0B_ACCEPTANCE_2569.md). การ Merge ไม่ได้หมายถึงการทดสอบอุปกรณ์จริงผ่านโดยอัตโนมัติ


## อัปเดต 23 ต.ค. 2569 — Zoom guard

- PR #11 merged to main (commit ac6439ebabb4dd64af47100e5b0ab6882a1b0075): จำกัดการซูมหน้าแอป โดยคงการซูมภายใน reader และการปรับฟอนต์
- ยังรอ QA จริง iPhone/iPad/Android และตรวจ Service Worker cache (v7 ยังไม่รวมไฟล์ app-zoom-guard.js ในรายการ offline shell)
- UX-P0C ยังไม่ผ่าน Gate: ต้องพัฒนา swipe และ reading focus โดยไม่รบกวน pinch zoom, TOC, pull refresh หรือ gesture ระบบ
- ก่อน Merge P0C ต้องทดสอบด้วยเครื่องจริงและบันทึกผล UX-00/P0B/P0C


## UX-P0C implementation candidate (PR pending)

Swipe left/right is scoped to the active book page. It ignores multi-touch, vertical movement, interactive controls, TOC, and screen-edge gestures. Focus mode hides secondary reader hints and desktop TOC while retaining navigation and close controls. Device QA, accessibility, zoom regression, and offline cache update are required before merge. This is not a completed release gate.


### UX-P0C QA checklist (release blocker)
- [ ] iPhone Safari/PWA: horizontal swipe changes one page; vertical scroll does not; pinch zoom still works inside reader; OS edge back remains usable
- [ ] iPad portrait/landscape: both visible pages accept swipe; orientation retains reading position
- [ ] Mobile TOC and pull-to-refresh: no gesture collision; closing reader returns focus
- [ ] Focus toggle: accessible name and pressed state; navigation/close always visible; screen reader and keyboard tested
- [ ] Offline update: v8 to v9 service worker activation and all published books accessible; no localStorage loss
- [ ] Windows: run Node smoke tests and inspect browser console before approval


## PWA Update Notice — 23 ต.ค. 2569

- Detect a waiting Service Worker and show a Thai update notice with **อัปเดตตอนนี้** and **ไว้ภายหลัง**.
- Do not auto-activate a newly installed worker: activate only on user confirmation, then reload once after controller change.
- Check for updates when returning to the app; preserve localStorage bookshelf, reading progress and preferences.
- Acceptance pending: test iPhone Home Screen PWA, iPad Safari/PWA, Android Chrome/PWA; verify update from v9 to v10, Later behavior, offline reload, and preservation of open-reader state (reload can close a book, but saved progress must persist).


## Mobile polish — Splash v1.1.0, book-cover theme, reader close (23 ต.ค. 2569)

- Show `เวอร์ชัน 1.1.0` on splash screen; version number is an explicit UI release label, with Service Worker cache bumped to v11.
- Move the sun/eye-comfort toggle from the catalog header onto each published book cover; it toggles the same local reading theme setting, synchronized across visible covers.
- Remove the floating bottom-right `ปิดอ่าน` button that obscured text on iPhone. Use the persistent top-right close control, minimum 44px touch target; maintain focus restoration and reading progress.
- Pending acceptance: iPhone screenshot widths, thumb reach and reader toolbar crowding, iPad landscape, VoiceOver labels, update prompt v10→v11, saved favorites and progress.


## UI refinement after iPhone feedback — 23 ต.ค. 2569

- Restore global sun/eye-comfort button to the app header; retain the reader eye-comfort control.
- Replace per-book cover sun with a heart button to add/remove from **หนังสือของฉัน**. No separate favorite button in card footer. Keep `aria-pressed`, clear accessible label, 46px touch target.
- Move `ปิดอ่าน` to the bottom reader controls adjacent to `หน้าถัดไป` without overlapping book text. Distinguish close visually from the primary next-page button; preserve focus restoration and progress.
- Offline cache v12. Pending iPhone/iPad layout and PWA upgrade verification.


## UX-P0D tablet candidate — 23 ต.ค. 2569

- Portrait tablet and narrow Split View (reader viewport up to 1100px): single-page reading; wider layouts keep two pages and desktop TOC.
- Align JavaScript page stepping and CSS breakpoint so there is no blank second page; preserve page progress when rotating or resizing (current paired-page logic may align to the preceding even page when entering spread mode).
- Improve tablet page padding and reduced-motion page transitions; PWA cache v15.
- QA pending: iPad portrait/landscape, 50/50 and 1/3 Split View, font 200%, chapter TOC, last odd page, rotation mid-book, safe area, VoiceOver, offline update v14→v15. Do not mark P0D complete until device tests pass.


## UX-P1A candidate — Aa Thai reader typography

- Reader Aa panel adds font family (system/serif/sans), line spacing (normal/relaxed/wide), and page margins (normal/compact/wide) with a reset button.
- Persist values under the existing `wd-manual-reader-v2` object as `typography`; validate all values on load, preserve favorites/history/progress/theme/font. No external fonts or network calls.
- Offline cache v16. QA pending: Thai glyph clipping across three themes, small iPhone, tablet split view, 160% text scale, screen reader and keyboard, PWA upgrade and legacy localStorage migration.


## UX-P1B candidate — Continuous Scroll

- Reader ⇵ switches paged/continuous mode; persisted in existing localStorage object as `readingMode`, default paged for legacy users.
- Continuous mode renders each authored logical page as a section, preserves typography, supports TOC jumps, tracks section progress with IntersectionObserver, and hides paged-only arrows; switching back restores the logical section (paired-page alignment on wide screens).
- No EPUB repagination, cloud sync, or private data. Cache v17.
- QA pending: real iPhone/iPad long-scroll behavior, accurate active section when quickly scrolling, rotation, TOC jump, closing/reopening at same section, accessibility, older browsers, memory/performance, offline upgrade.


## UX-P2A candidate — ค้นหาภายในเล่ม

- Search is scoped to the currently opened `published` manual, searching title, kicker, paragraphs, bullets and tips per logical page; results display chapter title and short snippet and jump to that chapter.
- Uses textContent-only DOM, no HTML injection, external search index, remote requests or localStorage of queries; resets on closing/changing book. Works with paged and continuous reader modes.
- Current candidate finds matching *sections* and does not yet highlight the exact term within a page. Exact-term highlighting remains an acceptance gap to resolve before marking P2A complete.
- QA pending: Thai spacing/diacritics, empty/no results, long queries, PWA offline, mobile keyboard, VoiceOver, continuous/paged jumps, and no draft/private exposure.


## UX-P2B candidate — คั่นหน้าตามตอน

- Bookmark current logical section via ◇/◆ and revisit bookmarked chapters from a per-book list; supports paged and continuous modes.
- Saved as `bookmarks` in existing `wd-manual-reader-v2` localStorage. Book IDs and page indices are validated; older localStorage remains compatible. Favorites, progress, history and typography are untouched.
- PWA cache v19. QA pending: iPhone/iPad tap targets, switching books, rotation, persisted bookmarks after restart, invalid legacy data, accessibility and offline updates.
- Future refinement: allow removing a different bookmarked chapter directly from the list; current toggle removes the current chapter.


## UX-P0E candidate — Reader Scroll Lock & Single Scroll Area

- Lock body background only while native reader dialog is open, restoring it on close.
- Keep reader top and bottom controls fixed; paged mode scrolls only `#pageLeft`, continuous mode scrolls only `#continuousPages`.
- Forward vertical gestures starting on stage gutter to active reading scroll surface, without stealing controls or horizontal gestures. CSS contains overscroll, and PWA cache v21.
- Real-device QA required before merge: iPhone Safari/PWA portrait and landscape, top/bottom scroll boundaries, gutter swipes, iPad Split View, paged horizontal swipes, continuous progress, TOC and Aa overlays, zoom, keyboard and VoiceOver, closing restores page scrolling.


## UX-P0I candidate — ปิดเครื่องมือเมื่อแตะด้านนอก / ปุ่มล่าง / โหลดเนื้อหา

- แตะพื้นที่อ่านหรือพื้นที่ว่างของหน้าต่างเพื่อปิดเมนู ⋯ และแผงค้นหา คั่นหน้า และตัวอักษร โดยไม่ขัดจังหวะการอ่าน; กด Escape ปิดแผงก่อนปิดหนังสือ
- ปรับแถบปุ่มล่างให้เคารพ safe-area ของ iPhone และจอแคบ พร้อมขนาดสัมผัสขั้นต่ำ
- แสดง skeleton ขณะเตรียมรายการคู่มือและหน้าอ่าน โดยรองรับ prefers-reduced-motion
- ปรับคำภาษาอังกฤษและศัพท์เชิงพัฒนาในส่วนที่ผู้ใช้ทั่วไปเห็นให้เป็นภาษาไทยอ่านง่าย
- QA ค้าง: iPhone Safari/PWA, ปุ่มย้อน/ถัดไปทุกขนาดจอ, safe-area, VoiceOver, เลื่อนอ่าน, แตะนอกเมนู, Esc, skeleton ขณะโหลดช้าและโหมดลดการเคลื่อนไหว


## UX-P2B-R1 candidate — คั่นหน้าจากจุดเดียว (1.2.5)

- รวมปุ่มคั่นหน้ากับรายการที่คั่นไว้เป็นเครื่องมือเดียวในเมนู ⋯
- เปิดแผงแล้วบันทึก/นำคั่นหน้าปัจจุบันออกได้ทันที พร้อมสถานะที่เข้าใจง่าย
- รายการแต่ละตอนมีปุ่ม “ลบ” แยก ไม่ต้องย้อนกลับไปยังตอนนั้น
- คงข้อมูลคั่นหน้าเดิมใน localStorage โดยไม่เปลี่ยน schema หรือรายการโปรด
- **ยังไม่ทำ:** รายการคั่นหน้ารวมในหน้า “ของฉัน” และการจำตำแหน่งระดับบรรทัด (วางแผนหลังตรวจรับ)
- QA ก่อน Merge: iPhone Safari/PWA และ iPad, บันทึกหลายตอน, ลบรายตอน, กดไปตอน, สลับโหมดพลิกหน้า/เลื่อนต่อเนื่อง, ปิดเปิดแอปแล้วข้อมูลอยู่, VoiceOver, offline, ไม่มีแผงซ้อนกัน

## UX-P2B-R2 candidate — Bookmark Bottom Sheet (1.2.6)

- เปลี่ยนแผงคั่นหน้าบนมือถือและแท็บเล็ตแนวแคบเป็น bottom sheet แบบลอย เพื่อไม่ลดพื้นที่อ่าน
- เพิ่มปุ่มปิด 48px, แตะฉากหลังเพื่อปิด, Escape, คืน focus ให้ปุ่มเปิด, trap Tab ในแผงบนจอแคบ
- รายการคั่นหน้ามากเลื่อนภายในแผงได้ พร้อมรองรับ safe area ของ iPhone
- คงข้อมูลและกลไกการนำทางไปยังตอนที่ผู้ใช้ตรวจรับแล้ว ไม่เปลี่ยน localStorage schema
- QA ค้างก่อน Merge: iPhone PWA/Safari, iPad portrait/Split View, scroll หลายรายการ, เปิด/ปิด/กดฉากหลัง, keyboard/VoiceOver, scroll เนื้อหาหลังปิด, offline/cache update

## UX-P2B-R3 candidate — ขนาดแผงคั่นหน้าและชื่อคู่มือ (1.2.7)

- ลดความสูงของ Bottom Sheet ให้สัมพันธ์กับจำนวนรายการ; จำกัดความสูงและให้รายการภายในเลื่อนได้เมื่อมีคั่นหน้ามาก
- แสดงชื่อคู่มือที่กำลังอ่านบนแถบบนระหว่างปุ่มสารบัญกับ ⋯ บนมือถือ โดยตัดชื่อยาวเป็น … ไม่ลดขนาดปุ่มสัมผัส
- แสดงชื่อคู่มือเต็มในหัวแผงคั่นหน้าเพื่อยืนยันว่ากำลังจัดการคั่นหน้าของเล่มใด
- ไม่เปลี่ยน schema ข้อมูล การคั่นหน้า การลบ หรือการกระโดดไปยังตอนที่ผ่านการตรวจรับแล้ว
- QA ก่อน Merge: iPhone จอเล็ก/จอใหญ่, ชื่อเล่มยาว, แผง 0/1/3/40 รายการ, เปิด/ปิด, scroll, safe area, iPad Split View, VoiceOver, PWA offline

## UX-P2B-R4 — ที่คั่นไว้ในหน้า ของฉัน (1.2.8)

- เพิ่มรายการคั่นหน้ารวมจากข้อมูลในเครื่อง แสดงชื่อคู่มือและตอนที่บันทึก
- เปิดคู่มือที่เผยแพร่แล้วตรงตอนที่เลือกโดยตรง และไม่แสดงรายการที่ไม่เผยแพร่
- อัปเดตรายการเมื่อบันทึกหรือลบคั่นหน้า ไม่เปลี่ยนโครงสร้างข้อมูลเดิม
- รอตรวจรับ: เปิดจากหน้า ของฉัน หลายเล่ม, ปิดเปิดแอป, ใช้งานออฟไลน์, iPhone/iPad/Android และ VoiceOver
- ขั้นต่อไป: ไฮไลต์คำค้นหา ตรวจ PWA และปรับสถานะ Roadmap

## 1.3.0 — ฟอนต์ไทยมีหัวและคำแนะนำติดตั้งตามอุปกรณ์

- คอมพิวเตอร์และ Android ใช้ Sarabun ซึ่งเป็นฟอนต์ไทยมีหัว; iPhone/iPad ใช้ฟอนต์ระบบ Apple
- หน้าเว็บในเบราว์เซอร์แสดงคำแนะนำติดตั้งที่ปิดได้; iOS Safari/เบราว์เซอร์อื่น, Android และคอมพิวเตอร์มีขั้นตอนต่างกัน
- โหมด standalone ไม่แสดงคำแนะนำ; ปุ่มติดตั้งอัตโนมัติแสดงเฉพาะเมื่อเบราว์เซอร์ส่ง beforeinstallprompt
- ใช้ฟอนต์สำรองเมื่อออฟไลน์ ไม่เปลี่ยนข้อมูลการอ่านและการตั้งค่าฟอนต์เฉพาะเล่ม
- รอตรวจรับจริง: iOS Safari/Chrome/PWA, Android Chrome/PWA, Windows Chrome/Edge, Mac Safari/Chrome, การปิดแบนเนอร์, แป้นพิมพ์/VoiceOver และ PWA offline

## UX-P2B-R5 — Grouped Bookmarks (candidate 1.3.1)

- แสดงคั่นหน้าแยกตามคู่มือ; ยุบ/ขยายได้ เปิดกลุ่มที่อ่านล่าสุดเป็นค่าเริ่มต้น
- ค้นชื่อคู่มือและชื่อตอนแบบทันที; แสดง 5 ตอนแรกพร้อมปุ่มดูทั้งหมด
- เรียงกลุ่มตามประวัติการอ่านล่าสุดจากข้อมูลเดิม (ไม่เพิ่ม timestamp หรือเปลี่ยน localStorage schema)
- แตะชื่อตอนแล้วเปิดไปยังตำแหน่งเดิม; สองคอลัมน์บนจอกว้างและคอลัมน์เดียวบนมือถือ
- QA ก่อน Merge: 0/1/หลายคู่มือ, 50+ ตอน, ค้นหา, โหมดมืด/ถนอมสายตา, iPhone/Android/desktop, VoiceOver, ปิดเปิด PWA, ออฟไลน์
- หมายเหตุ: ลำดับตามประวัติการเปิดอ่านคู่มือ ไม่ใช่เวลาคั่นหน้าแต่ละตอน เพราะ schema เดิมไม่บันทึกเวลา

## UX-FULLCARD — candidate 1.3.2 (PR pending)

- Published cards with readable pages open by tapping cover, title, description, or card whitespace; existing Open button remains.
- Favorite button is an independent action and must never open the reader; review/draft cards are not clickable.
- Card is keyboard-focusable (Enter/Space) with focus ring and descriptive label; reduced-motion respected.
- Acceptance pending: Android/iPhone touch, keyboard and screen readers, favorite button, published/review state, reader focus return, PWA/offline regression. Mark Accepted only after evidence.

## UX-READER-CONTRAST — candidate 1.3.3 (PR pending)

- แก้ชื่อคู่มือบนแถบด้านบน Reader มือถือ/Android ให้สีตัดพื้นหลังชัดเจนใน light/night/sepia โดยไม่เปลี่ยนธีมส่วนอื่น
- ป้องกันการถูกสีจางเดิม override; ชื่อยาวยัง ellipsis และไม่บังปุ่ม TOC/เมนู
- ยืนยัน title จากคู่มือปัจจุบัน; ไม่แก้เนื้อหาหนังสือ, ขนาดหน้า หรือข้อมูลการอ่านเดิม
- **QA pending:** Android Chrome/PWA ภาพก่อน-หลัง, iPhone/iPad, light/night/sepia, zoom 200%, TalkBack/VoiceOver, ชื่อยาว, ปุ่มข้างเคียง และ PWA offline

## QA-DEVICE-GATE — Execution Record (23 ต.ค. 2569)

- สถานะ: **RUNBOOK READY; DEVICE QA NOT EXECUTED**. ไม่มีการอ้างว่า iPhone/Android/iPad/Windows ผ่านแล้ว
- เอกสารทดสอบและบันทึกผล: [WD_BOOKS_QA_DEVICE_GATE_133.md](WD_BOOKS_QA_DEVICE_GATE_133.md)
- Baseline: `main` v1.3.3, PR #35–#41; ให้ผู้ทดสอบระบุ build/version จริงที่เห็นและ OS/browser ก่อนกรอกผล
- Gate สำหรับคิว 4 (UX-SEARCH-HIGHLIGHT): ต้องบันทึกผล critical flows, ข้อบกพร่อง และการตัดสินใจ GO/NO-GO พร้อมผู้ตรวจรับ; หากมี critical FAIL ให้แก้ก่อน
- การแก้ QA findings ให้เปิด PR แยก; ไม่ Merge การเปลี่ยนฟีเจอร์ใน PR เอกสารนี้

## UX-READER-CONTRAST-R1 — iPhone visual FAIL (23 ต.ค. 2569)

- **FAIL confirmed from user screenshot:** light-theme reader topbar on iPhone is pale/white but book title text from PR #41 is near-white; title almost invisible. The previous fix incorrectly assumed dark header in light mode.
- **Correction candidate 1.3.4:** dark green title on light header; high-lightness title only in night mode; dark brown in sepia. Keep ellipsis and existing buttons.
- **Acceptance status: FAIL / FIX IN PR / RETEST PENDING.** Verify iPhone Safari/PWA, Android, all three themes, 200% zoom, long title, TalkBack/VoiceOver, offline cache update. No real-device PASS claimed.

## UX-HEART-R1 — Android cover favorite icon (candidate 1.3.5)

- User confirms UX-READER-CONTRAST **PASS** on device (23 ต.ค. 2569); QA-DEVICE-GATE other checks remain pending.
- User screenshot shows font-glyph heart distorted on Android cover cards. **Prioritize this fix before other roadmap items.**
- Replace font-dependent ♡/♥ with a 24px SVG heart centered in existing touch target; outlined when unsaved, filled when saved.
- Preserve existing favorite state, localStorage schema, aria-label/aria-pressed and separate tap behavior from full-card open.
- QA pending: Android Chrome/PWA, iPhone, selected/unselected, multiple covers, light/sepia/night, TalkBack/VoiceOver, offline/cache update.

## Gate decision and UX-SEARCH-HIGHLIGHT — 23 ต.ค. 2569

- ผู้ใช้ยืนยัน **UX-READER-CONTRAST PASS** และ **UX-HEART PASS**; QA-DEVICE-GATE ปิดการติดตามตามคำสั่งผู้ใช้แบบ **CONDITIONAL GO** โดยคงรายการที่ยังไม่ได้ทดสอบเป็น NOT TESTED (รายละเอียดใน WD_BOOKS_QA_DEVICE_GATE_133.md)
- เริ่มคิว 4: **UX-SEARCH-HIGHLIGHT candidate v1.3.7**. ค้นหาในเล่มและไฮไลต์ข้อความด้วย DOM Text/mark เท่านั้น ไม่มี innerHTML; รองรับ Paged/Continuous และสามธีม; ค้นหาเฉพาะ published
- QA candidate ยังไม่ผ่าน: ตรวจคำไทย, คำหลายจุด, ล้างคำค้น, เปลี่ยนเล่ม, PWA, screen reader, ไฮไลต์ไม่ทำลายเนื้อหาเดิม และไม่ทำให้การอ่านต่อเนื่องสะดุด

## UX-SEARCH-HIGHLIGHT-R1 — iPhone screenshot findings (23 ต.ค. 2569)

- ผู้ใช้ยืนยันจากภาพว่าคำว่า “ครู” ถูกไฮไลต์ในหน้าอ่านแล้ว (partial visual PASS); ผลค้นหาแบบรายการกินพื้นที่จอมาก, ไม่มีนำทางผลก่อนหน้า/ถัดไป, ตัวอย่างข้อความมีอักขระผิดปกติ
- Candidate v1.3.8: จำกัดความสูงแผงผลค้นหา, ยุบรายการอัตโนมัติหลังเลือกตอนแต่คงช่องค้นหาและแถบนำทาง, ปุ่มยุบ/แสดง, แสดงตำแหน่งตอนที่เลือก, ก่อนหน้า/ถัดไป, ทำความสะอาด zero-width/replacement character ใน snippet เท่านั้น, ทำกรอบรายการที่เลือก
- ค้นหายังเป็นระดับ **ตอน** (ไม่ใช่ทุก occurrence); ไม่อ้างว่าปุ่มก่อนหน้า/ถัดไปนำทางแต่ละคำภายในตอน; ไม่เปลี่ยน schema localStorage
- **QA PENDING:** iPhone Safari/PWA, Android, iPad, แสดงผลหลังเลือกตอน, เลื่อนต่อเนื่อง, ค้นคำไทย, เปิด/ปิดแผง, ปุ่มนำทาง, ความคงอยู่ของไฮไลต์, การอ่านด้วย screen reader
- หลังตรวจรับ R1 จึงกลับสู่ UX-DISCOVERY

## HOME-LOAD-STALL-R1 — iPhone screenshot (23 ต.ค. 2569)

- User screenshot: home catalog remains on two skeleton cards and category loading bar; this is **FAIL**, not UX-DISCOVERY readiness.
- Root cause **not confirmed**: JavaScript bootstrap failure, partial deploy, or PWA cache version mismatch are hypotheses.
- Candidate 1.3.9 adds a 6.5s stalled-skeleton detection, visible retry button, and cache-busted document navigation. Never clear localStorage, favorites, history or bookmarks; include guard in SW app shell.
- QA pending: reproduce on iPhone Safari/PWA, test offline and online, confirm error recovery and that saved books survive; inspect browser console and deployed asset versions if stall persists.
- Block UX-DISCOVERY until catalog reliably renders.

## HOME-LOAD-STALL-R2 — confirmed JavaScript parser failure (23 ต.ค. 2569)

- Root cause confirmed by parsing production main `assets/app.js`: `SyntaxError: missing ) after argument list` at search result snippet append added in PR #48. Because the entire app script failed to parse, the home catalog skeleton remained and the PR #49 recovery button appeared.
- Fix candidate 1.3.10: restore the missing closing parenthesis and bump app version so SW refreshes assets. The updated `app.js` passes JavaScript syntax parsing; browser/device functional QA is still pending.
- Prevent recurrence: add JS syntax validation before merging changes to `assets/app.js`, particularly search UI code; don't rely on visual screenshot alone.

## UX-DISCOVERY P1 — Status filters (23 ต.ค. 2569)

- User confirms home catalog renders and works again after PR #50 (home display PASS; device-wide regression checks remain pending).
- Candidate v1.3.11: independent catalog status chips **ทั้งหมด / พร้อมอ่าน / เตรียมเผยแพร่**; combine with existing category and text search; preserve current published-first ordering and existing reading/localStorage behavior.
- Ready = published with nonempty pages; upcoming = other catalog entries. No private/draft content made readable.
- JavaScript syntax validation performed before PR. QA pending: iPhone Safari/PWA, Android, iPad, 0/1/many matches, combinations with categories and search, keyboard/screen reader, themes and offline cache.
- Next: UX-DISCOVERY P2 sort/search scalability after P1 device acceptance; no automatic merge.

## UX-DISCOVERY P2 — clarity and reset (23 ต.ค. 2569)

- User iPhone screenshots verify ready filter shows 2 of 7 manuals, zero-results state, and reading progress 13/15 persists; other device QA remains pending.
- Candidate v1.3.12: label status vs category filter groups, horizontal category-scroll hint, contextual zero-result text, one-tap reset of search/category/status without touching localStorage or reading history.
- Pre-PR JS syntax parsing passed; QA pending on iPhone Safari/PWA, Android, iPad, night/light/sepia, zero results and reset, focus/VoiceOver, long category list and offline.
- Continue scalable sorting/indexing only after P2 acceptance; no auto merge.

## UX-DISCOVERY P3 — sort and indexed catalog search (23 ต.ค. 2569)

- User reports P2 PASS on iPhone. Candidate v1.3.13 adds sort **พร้อมอ่านก่อน / ชื่อ ก–ฮ / อ่านล่าสุดก่อน** (history-based, books never read follow published-first order), combined with current status/category/search filters.
- Build normalized searchable strings once per catalog book (title, subtitle, description, audience, category and tags); keep in-memory only; do not index unpublished page bodies or store user data remotely. Thai title ordering uses Intl.Collator('th-TH').
- Reset-all also resets sort; history, favorites, bookmarks, progress, localStorage schema remain unchanged.
- Pre-PR JavaScript syntax parse PASS. QA pending: iPhone Safari/PWA, Android/iPad, sorting order, mixed filters, empty state reset, 0/1/100+ synthetic items, offline and accessibility. Avoid claiming performance gains until measured.
- After device acceptance, consider measured catalog rendering limits before pagination or architectural modularization.

## UX-DISCOVERY P3 accepted → ARCH-01A start (23 ต.ค. 2569)

- Owner confirms P3 (PR #53, v1.3.13) **ACCEPTED on tested device**; wider Android/iPad/offline/accessibility checks remain unverified.
- Queue 5 UX-DISCOVERY P1–P3 delivered; next queue 6 **ARCH-01**. Start with non-runtime **ARCH-01A** baseline/contract and JS parser/offline-shell gate, then small separately approved module extraction PRs.
- Detailed source of truth for extraction: [WD_BOOKS_ARCH01_BASELINE_2569.md](WD_BOOKS_ARCH01_BASELINE_2569.md). No version bump needed for docs/tests-only PR.

## ARCH-01B — catalog core extraction candidate (23 ต.ค. 2569)

- PR #54 ARCH-01A merged at `f59096281017add86ec9166f19db862bd658b36e`.
- Candidate v1.3.14 extracts pure in-memory search/filter/sort into `assets/catalog-core.js`, loaded before `app.js`, added to SW app shell. `app.js` retains DOM and reader responsibilities. No localStorage schema changes.
- Tests: parser/offline-shell gate, existing smoke harnesses updated to load new script, synthetic catalog filter/sort tests. **Execution of tests and real-device QA still to be confirmed**; merge only after verification and explicit approval.
- Rollback: revert ARCH-01B only, restoring old app.js selection and script order; keep user storage intact.

## ARCH-01C — catalog UI extraction candidate (23 ต.ค. 2569)

- Stacked on unmerged ARCH-01B PR #55, not main. Candidate v1.3.15: move catalog rendering and discovery event binding into `assets/catalog-ui.js`; app.js retains card creation, Reader, My Books, and app orchestration.
- New script loaded after catalog-core.js and before app.js; SW app shell includes both; smoke harness script order updated.
- JavaScript syntax parse checked for app.js and catalog-ui.js before PR. Full local Node tests and device regression **not yet executed/verified**. Do not merge stacked PR until ARCH-01B and tests PASS; preserve storage and rollback ability.

## ARCH-01D1 — read-only My Books selectors candidate (23 ต.ค. 2569)

- Owner confirmed basic home/catalog/open-book behavior after ARCH-01C PR #57; not a complete offline/a11y/device QA pass.
- Candidate 1.3.16 extracts **read-only selection** of recent books, favorites, resume and valid grouped bookmarks to `assets/mybooks-selectors.js`. Reader rendering, My Books DOM, event handlers and `wd-manual-reader-v2` remain unchanged.
- Adds synthetic selector tests and registers new script in PWA offline shell and existing smoke harnesses. Full Node tests and real-device regression remain pending. Merge only after explicit approval; next step ARCH-01D2 reader coordination after acceptance.

## ARCH-01D2 — Reader coordination candidate (23 ต.ค. 2569)

- Owner confirmed ARCH-01D1 behavior after PR #58. Candidate v1.3.17 isolates My Books refresh subscription and published-only Reader opening adapter into `assets/reader-coordinator.js`.
- No storage writes, schema migrations or Reader UI redesign; preserves existing `openBook` and renderers. Includes synthetic smoke test and PWA shell registration.
- JavaScript syntax checked; complete Node suite and iPhone/iPad offline regression pending. PR remains unmerged until explicit approval.

## ARCH-01E — performance/offline baseline candidate (23 ต.ค. 2569)

- Owner confirmed normal operation after ARCH-01D2 PR #59 merged (v1.3.17). Begin measurement-only gate; no production code or version change.
- Add local static app-shell asset measurement and real-device 3-run cold/warm, search, Reader, offline, and optional heap runbook: [WD_BOOKS_ARCH01E_PERFORMANCE_BASELINE_2569.md](WD_BOOKS_ARCH01E_PERFORMANCE_BASELINE_2569.md).
- No measured runtime values yet; do not claim a speed improvement. CAT-01 lazy loading remains gated on actual results and separate approval.

## CAT-01 preflight — no computer available (23 ต.ค. 2569)

- ARCH-01E PR #60 merged, but local command execution and device performance measurements are pending.
- Source inspection shows catalog and public guide scripts loaded before app.js and precached by SW; lazy loading must preserve this dependency and offline behavior.
- Documented phased design and compatibility gates in [WD_BOOKS_CAT01_LOADING_DESIGN_2569.md](WD_BOOKS_CAT01_LOADING_DESIGN_2569.md). Documentation-only PR, no version bump, no runtime change; proceed to CAT-01A contract tests after approval.

## CAT-01A — public catalog/content contract candidate (23 ต.ค. 2569)

- CAT-01 design PR #61 merged at `a0e65e8ce6fb050e864d76ce6e71bca3e20abd50`. While no computer is available, prepare read-only synthetic/current catalog contract gate and documented stable ID/offline policy: [WD_BOOKS_CAT01A_CONTENT_CONTRACT_2569.md](WD_BOOKS_CAT01A_CONTENT_CONTRACT_2569.md).
- Adds `tests/cat01-contract.smoke.cjs` only; no production code/version/storage changes. Syntax parsed; Node execution and real-device QA pending. Explicit approval required before merge.
