# WD Books — Reader Experience Roadmap (Mobile/Tablet-first) ปี 2569

**Plan ID:** WD-BOOKS-UX-2569  
**Version:** 1.0 · 23 ตุลาคม 2569  
**Repository:** infobwd/manual (Public)  
**Status:** UX-P0A MERGED / UX-P0B IMPLEMENTED — UX-00 มีต้นแบบ; อุปกรณ์จริงยังต้องตรวจรับก่อนปิด Gate  
**Product:** https://infobwd.github.io/manual/  
**กลุ่มใช้งานหลัก:** ครู/บุคลากรโรงเรียนบน iPhone และ iPad, รองลงมาคือ Android และ Desktop  
**Source of truth:** เอกสารนี้ใช้กำหนดลำดับงาน, acceptance และ rollout ของการปรับ UX ใน repo นี้ ไม่แก้เนื้อหาวิชาการหรือระบบ WD Growth ต้นทาง

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
