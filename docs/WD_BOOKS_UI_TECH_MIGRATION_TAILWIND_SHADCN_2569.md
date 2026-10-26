# WD Books — แผนเปลี่ยนเทคโนโลยี UI สู่ Tailwind CSS + shadcn/ui (ปี 2569–2570)

**Plan ID:** WD-BOOKS-UI-TECH-01  
**สถานะ:** APPROVED FOR PLANNING / ยังไม่อนุมัติ Production Migration  
**จัดทำ:** 26 ตุลาคม 2569 · Repository: `infobwd/manual` (Public)  
**เอกสารแม่:** [WD Books — Reader Experience Roadmap](WD_BOOKS_READER_UX_ROADMAP_2569.md)  
**ฐานตรวจโค้ด:** `main` commit `20c02315fd07dfbaca0093cc044428b6f39f47a1` · บันทึกเพื่อออกแบบ ไม่ใช่ผลทดสอบอุปกรณ์จริง

> **ข้อยุติเชิงสถาปัตยกรรม:** ใช้ **React + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui** เป็น *target สำหรับ UI รุ่นถัดไป* แต่ดำเนินงานแบบ **incremental / gated migration**; ระบบอ่านเดิมและ Production GitHub Pages ต้องไม่ถูกแทนที่ก่อนผ่านเกณฑ์ทดสอบและผู้รับผิดชอบอนุมัติแยกต่างหาก. การปรับ CSS เดิมอย่างเดียวเป็น fallback ที่ยอมรับได้หากต้นทุนย้ายสูงกว่าประโยชน์.

## 1. ผลวิเคราะห์จาก Repository จริง

| หัวข้อ | หลักฐาน/สถานะปัจจุบัน | ผลต่อแผน |
|---|---|---|
| Runtime | `index.html` โหลดไฟล์ `assets/*.js` แบบลำดับ, Vanilla JS IIFE; ไม่มี React/Vite/package.json ใน root ณ วันตรวจ | shadcn/ui ติดตั้งแทน CSS แบบ drop-in ไม่ได้ ต้องเพิ่ม toolchain ในโฟลเดอร์ทดลอง |
| สไตล์ | `styles.css`, `app-experience.css`, `home-p0a.css`, `mobile-reader.css`, `toc-p0b.css`, `audio-reader.css` เป็น CSS หลายส่วน | ต้องทำ Design Tokens, ป้องกัน global reset / class collision และวัดผลก่อนย้าย |
| เนื้อหา | `assets/manuals-data.js` มี ID และข้อมูลหน้าหนังสือที่ระบบอ่านใช้งานอยู่; เป็นข้อมูล Public เท่านั้น | ต้องรักษา schema, published filter, สารบัญ/ลำดับหน้า, bookmark, ID เดิม และเส้นทางอ้างอิง |
| Reader | `assets/app.js`, `reader-coordinator.js` มี behavior หน้าเดียว/หน้าคู่/continuous, keyboard, TOC, focus, reading progress | แยก shell/UI ก่อน, ห้าม reimplement Reader ทีเดียว |
| Audio | `audio-reader.js`, `audio-listening-lock.js`, MediaSession/TTS ใช้พฤติกรรมต่างกันระหว่าง iOS/Chrome | เป็น high-risk; ย้ายหลังพิสูจน์ compatibility บนอุปกรณ์จริงเท่านั้น |
| ข้อมูลเครื่อง | `wd-manual-reader-v2` (localStorage) ใช้เก็บอ่านต่อ, ความคืบหน้า, รายการโปรด, bookmarks, theme, font, reading mode | เป้าหมาย zero data loss; ห้ามเปลี่ยนชื่อ key หรือเขียนทับ schema โดยไม่ migration/rollback plan |
| PWA | `sw.js` cache-first JS/CSS, `assets/app-version.js` เป็น release version; GitHub Pages อยู่ที่ `/manual/` | การเปลี่ยน build/URL/cache ต้องมี lifecycle tests และ unique cache version; มีประวัติ stale catalog จาก cache |
| Hosting | GitHub Pages จาก branch `main` root; แนวทาง Local-First ไม่เพิ่ม GitHub Actions เอง | Build ใน Windows/local ก่อน; preview เป็น static files คนละ path; deployment production ต้องออกแบบ artifact cutover แยก |
| Tests | มี Node smoke suites: catalog, Reader, iPad, audio, PWA update, performance | ใช้เป็น regression gates และเพิ่ม contract tests ของ React bridge ไม่ย้ายทิ้ง |

**ข้อสรุป:** การเปลี่ยน Framework อาจช่วยบำรุงรักษาและความสม่ำเสมอ แต่ **ความสวยงามเกิดจาก Design System และงาน UX** ไม่ได้เกิดจากชื่อ Framework โดยอัตโนมัติ การโยกทั้งแอปใน PR เดียวมีความเสี่ยงไม่สมเหตุสมผล.

## 2. เทคโนโลยีเป้าหมายและขอบเขต

- **Tailwind CSS v4** ผ่าน local build; กำหนด Design Tokens เป็นสี WD Books/WD Growth, typography ไทย, spacing, radii, shadows, focus-ring, motion, safe areas. ไม่ใช้ CDN runtime เป็น production styling. ระวัง preflight reset บน DOM เดิม.
- **shadcn/ui** ใช้ component source ที่ทีมตรวจแก้ไขได้ภายใน React/TypeScript เช่น Button, Input, Card, Tabs, Dialog, Sheet, Dropdown, Tooltip; เน้น keyboard focus, touch target และ Thai text. ไม่ใช่ CSS theme ที่แปะกับ Vanilla JS แล้วทำงานครบ.
- **React + TypeScript + Vite** สำหรับ shell/หน้าค้นหา/ชั้นหนังสือ/ตั้งค่า รุ่นถัดไป โดยเริ่มจาก frontend preview แยก; ไม่เปลี่ยน backend (ไม่มี backend), ไม่ย้ายไป Next.js และไม่สร้าง authentication ใหม่.
- **Reader/เสียง/PWA:** ระยะแรก reuse contract/logic ที่ตรวจรับแล้ว ไม่ย้ายส่วน high-risk จน M3/M4 PASS. ไม่สร้าง Service Worker ชุดที่สองมาแย่ง root scope.
- **การเผยแพร่:** ต้นแบบ build locally; ยังคง GitHub Pages static hosting. Vite preview ใช้ `base` ตาม path ที่เผยแพร่จริง เช่น `/manual/docs/previews/ui-next/`; production target เป็น `/manual/` เฉพาะเมื่อมีแผน cutover ที่ผู้รับผิดชอบอนุมัติ.
- **Version pinning:** เมื่อเริ่ม scaffold ให้ pin เวอร์ชัน runtime/dependency ผ่าน lockfile; เช็ก official docs และ compatibility อีกครั้งก่อนติดตั้งจริง ไม่ใช้ `latest` แบบไร้การตรวจรับตลอดวงจร.

## 3. ขอบเขตห้ามแตะและข้อกำหนดร่วม

1. **Production unchanged during discovery/preview:** ไม่แก้ `index.html`, `sw.js`, `assets/app.js`, `assets/manuals-data.js`, `assets/app-version.js` หรือ UX runtime ที่ใช้งานจริงใน M0–M2. Documentation-only PR ไม่ต้อง bump PWA version.
2. **Data contract:** คง book IDs, จำนวนหน้า, category, status/published, search semantics, recent/favorites/bookmarks/progress; migration ของสถานะต้องตรวจความเข้ากันได้ก่อน/หลังด้วย test fixtures ที่ไม่ใช่ข้อมูลเด็ก.
3. **Security:** Repository/Pages เป็นสาธารณะ; ไม่ฝัง key, credentials, student/personnel records, host admin URLs หรือไฟล์ภายใน; ไม่เปิด analytics/tracking โดยพลการ.
4. **Interaction:** รองรับจอมือถือ/iPad/desktop, safe-area, ปุ่มนิ้วโป้งขวา, VoiceOver/keyboard, Focus Mode, theme light/sepia/night, Thai TTS และ listening lock ที่ยังใช้งานได้จริง.
5. **Single offline model:** ขณะทดลอง preview *ไม่ register SW ใหม่*; ทดสอบเส้นทาง static preview โดยไม่เปลี่ยน app shell ของ Production. ตอน cutover ต้องกำหนด migration ของ SW scope/cache และ rollback.
6. **Local-First:** ใช้ Windows + VS Code + Node สำหรับ build, ทดสอบ local, upload commit ตามปกติ; ไม่เพิ่ม GitHub Actions/workflows ชั่วคราว. ไฟล์ build ที่จะเผยแพร่ต้องมาจากกระบวนการซ้ำได้และบันทึก source commit.
7. **No claim without evidence:** การผ่าน smoke tests, merge หรือ screenshot emulator ไม่เท่ากับผ่าน QA บน iPhone/iPad จริง.

## 4. แผนดำเนินการแบบ Gates (PR ย่อยและหยุดได้ทุกระยะ)

| ระยะ / PR | Deliverable | เกณฑ์ผ่านและจุดตัดสินใจ | ผลต่อ Production |
|---|---|---|---|
| **UI-M0 Discovery** | UX inventory, CSS token map, screenshot baseline iPhone/iPad/desktop, PWA/audio/Reader behavior baseline; บันทึก current main SHA | ผู้รับผิดชอบเลือกหน้าจอต้นแบบและ baseline metrics; ห้ามอนุมานว่า QA ผ่านจาก code review | ไม่มี |
| **UI-M1 Design System** | `docs/` visual spec + accessible tokens, typography ไทย, components anatomy และ mockups Home/Books/Settings/Reader shell | รีวิว light/sepia/night, 90–160% fonts, touch ≥44×44 CSS px ตามแนวปฏิบัติที่กำหนด, contrast, safe-area | ไม่มี |
| **UI-M2 Isolated Lab** | โฟลเดอร์ทดลอง `experiments/wd-books-ui-next/` ใช้ Vite/React/TS/Tailwind/shadcn; preview static แยก path; sample data เท่านั้น | `npm ci`, lint/typecheck/build ผ่าน Windows; preview ไม่อ่าน/เขียน `wd-manual-reader-v2`; ไม่มี SW ใหม่; diff ไม่แก้ runtime เดิม | ไม่มี |
| **UI-M3 Catalog/UI parity** | Home, Search, Shelves, Filters, My Books แบบ read-only/mock bridge; source mapping/catalog contract | รายการหนังสือ/ชื่อ/สถานะ/ค้นหา/ลำดับตรงเดิม; responsive/a11y/performance parity; ไม่มี duplicated catalog ที่เผยแพร่สวนกัน | ไม่มี |
| **UI-M4 Reader integration spike** | Adapter proof-of-concept เปิดอ่านและสารบัญใน sandbox; map progress/bookmarks/typography เป็น read-only ก่อน | Functional parity reader paged/continuous, back/close/focus/keyboard/TOC, dynamic Thai long text; เปิดเกตด้านเสียงแยก | ไม่มี |
| **UI-M5 Audio + PWA validation** | Evidence iPhone/iPad actual, Chrome desktop, Android เมื่อมีเครื่อง; audio/lock/PWA/offline regression plan | ตรวจ listening lock, pause/resume, cache update, reading state; rollback drills และ data-compatibility pass | ไม่มี |
| **UI-M6 Release Decision** | Decision Record: Option A keep hybrid, Option B cutover UI shell with legacy Reader, Option C full migration **only if proven** | ผู้รับผิดชอบอนุมัติราย scope; deploy/rollback/backup plan approved; no silent production switch | ยังไม่สลับจนอนุมัติ |
| **UI-M7 Controlled Cutover (conditional)** | Local reproducible build, static artifact review, release manifest, smoke & real-device acceptance | หาก Fail ให้ revert commit ที่เผยแพร่โดยไม่ล้าง localStorage/หนังสือของฉัน; after-merge monitoring | เปลี่ยน Production เฉพาะที่อนุมัติ |

**ลำดับความเสี่ยง:** Design Tokens → Navbar/Cards/Search → Settings/Dialogs → Reader Shell → Progress/Bookmarks → Audio/MediaSession → Offline PWA. เลือกเส้นทางเริ่มที่ UI shell ไม่จำเป็นต้องทำทุกระยะหากผล M2/M3 ไม่คุ้มค่า.

## 5. ข้อเสนอ Design Tokens และ UI anatomy

| พื้นที่ | เป้าหมาย | ห้ามเสีย |
|---|---|---|
| Home | Search เด่น, อ่านต่อ 1 แตะ, หมวดหมู่และหนังสือใหม่อย่างชัด, กระชับบนมือถือ | ไม่เพิ่ม scroll ยาว, ไม่ซ่อนหนังสือ published |
| Books/Shelf | Book cover สัดส่วนคงที่, subtitle/read time ไม่ล้น, category chips, loading/empty state | ค้นหาไทย, favorites, recent order, accessible labels |
| Reader | Typography ไทย, page width, line height, page navigation, TOC sticky/bottom sheet | Focus Mode, single/dual, continuous, progress/bookmark, thumb-close, keyboard |
| Settings | Sheet/Dialog ที่จัดหมวด theme/font/reading/audio/update, ปุ่มสัมผัสใหญ่ | ไม่มี false fullscreen, theme light/sepia/night, slider 90–160% |
| Audio | Compact dock / Now Playing ที่ไม่บังเนื้อหา, ปุ่มเล่นหยุด, mode labels | เสียงไทย/ออฟไลน์/lock screen ตามข้อจำกัดของแพลตฟอร์มและพฤติกรรมเดิม |
| PWA | Consistent splash/version/update notice, loading & error recovery | SW/cache version unique, no mixed JS revisions, ไม่ลบ local preferences |

**Token mapping เบื้องต้น:** `--pine:#174f47`, `--pine-deep:#103e36`, `--paper:#f8f7f2`, `--ink:#213d39`, `--surface:#fff`; ใช้ semantic tokens และตรวจสีจริงทั้งสาม theme ก่อนประกาศเป็น design system. ไม่บังคับทุกหน้ามี shadcn Cards จนหน้าอ่านรู้สึกเหมือน dashboard.

## 6. Build / Preview / Release Architecture โดยไม่ใช้ GitHub Actions

```text
main root (PRODUCTION เดิม)
├── index.html / assets/* / sw.js          <- ไม่เปลี่ยนจน UI-M6/M7
├── docs/WD_BOOKS_READER_UX_ROADMAP_2569.md
├── docs/WD_BOOKS_UI_TECH_MIGRATION_TAILWIND_SHADCN_2569.md
├── docs/previews/ui-next/                 <- built preview artifact เฉพาะเมื่อ UI-M2 ผ่าน
└── experiments/wd-books-ui-next/          <- source React/TS/Vite (future PR)
```

- UI-M2 ให้ทำงานแยก worktree/clone บน Windows ไม่ทับโฟลเดอร์หลัก แล้วสร้างโครงใน `experiments/` เท่านั้น. Static preview artifact ต้องระบุ SHA source และจัดการ license/dependencies อย่างชัดเจน.
- Vite ต้องตั้ง `base` เป็น path preview จริง `/manual/docs/previews/ui-next/` สำหรับ GitHub Pages repo site; production หลัง cutover ใช้ `/manual/`. **ห้าม build production URL โดยใช้ preview base**.
- เนื่องจาก GitHub Pages ปัจจุบัน Deploy from a branch ที่ root และแนวทางโครงการไม่ใช้ custom Actions การใช้ Vite ต้อง **Build ภายในเครื่อง** และตรวจ/commit static output อย่างตั้งใจ. หากย้ายมาทับ root จำเป็นต้องออกแบบการจัดการ output/root pages อื่น ๆ และ atomic rollback ไม่ใช่สั่ง `npm run build` แล้วหวังว่า Pages จะ build ให้อัตโนมัติ.
- Preview ไม่ใช้ Service Worker อีกตัว. หาก preview อยู่ใต้ scope ของ SW เดิม ต้องตรวจว่า root SW intercept เฉพาะ permitted shell resources จึงไม่ขัดกับ preview path; ห้ามแก้ scope เพื่อทดลอง.
- ขออนุมัติ Infrastructure Deployment Decision ใหม่หากต้องการเปลี่ยน GitHub Pages source หรือเปิด Actions ภายหลัง.

## 7. Test Gate และการวัดว่า “คุ้ม” จริงหรือไม่

**Baseline before & after** บันทึกบนเครื่อง/เครือข่ายใกล้เคียงกัน 3 รอบ: cold/warm load, initial UI ready, search response, first Reader open, memory footprint, bytes transferred, offline success, PWA update time. **ยังไม่มีตัวเลข performance ที่ตรวจด้วยเครื่องจริง**; ห้ามใส่ผลเร็วขึ้นเป็นเปอร์เซ็นต์โดยไม่มีข้อมูล.

**Node QA ขั้นต่ำที่สัมพันธ์กับงานเดิม:** 
`tests/js-syntax-gate.cjs`, `tests/library.smoke.cjs`, `tests/manuals-data-syntax.smoke.cjs`, `tests/cat01-contract.smoke.cjs`, `tests/pwa-reader.smoke.cjs`, `tests/pwa-update-lifecycle.smoke.cjs`, `tests/mobile-toc-p0b.smoke.cjs`, `tests/reader-wide-toc.smoke.cjs`, `tests/ipad-reader-layout.smoke.cjs`, `tests/audio-reader-playback.smoke.cjs`, `tests/listening-now-playing.smoke.cjs`, `tests/performance-baseline.cjs` (ให้รันตาม scope และตรวจชื่อไฟล์ก่อนใช้เสมอ).
   
**Real-device matrix:** iPhone Safari + Installed PWA, iPad portrait/landscape/Split View, Windows Chrome/Edge keyboard, Android Chrome หากมีเครื่อง; zoom 200%, font 90–160%, VoiceOver/a11y เท่าที่มีอุปกรณ์จริง, offline → online, background/lock screen audio เฉพาะสถานการณ์ที่รองรับ.

**Hard-stop / rollback triggers:** หน้าอ่านเปิดไม่ได้; published book หาย; local reading state สูญ; reader/TOC/เสียงใช้งานถดถอย; update loop/worker stuck; focus trap/ปุ่มปิดไม่ถึงบนมือถือ; build มี JS syntax error; deploy ลิงก์ assets แตก; โหลดช้าลงอย่างมีนัยสำคัญโดยไม่มีประโยชน์ UX ที่ชัด.

## 8. Acceptance & Governance

| เกต | ใครยืนยัน | ข้อกำหนด |
|---|---|---|
| G0 | ผู้รับผิดชอบ UX/ผู้บริหาร | เห็นชอบ design direction, 3 หน้าจอทดลอง, baseline |
| G1 | ผู้พัฒนา + ผู้ตรวจโค้ด | M2 isolated build reproducible; มี lockfile และ security review |
| G2 | ครูผู้ใช้ + ผู้พัฒนา | Catalog/Reader parity บน preview, งานจริงไม่เสีย, ไทยอ่านง่าย |
| G3 | ผู้ทดสอบอุปกรณ์จริง | iPhone/iPad/PWA/Offline/Audio ผ่านตาม scope; เก็บหลักฐานไม่ระบุตัวบุคคล |
| G4 | เจ้าของระบบ | แยกอนุมัติ Production cutover หลังพิจารณาประโยชน์ เทียบต้นทุน และแผน rollback |

**Merge policy:** Documentation-only PR สามารถ Merge แผนเข้าหลักได้หลังตรวจรูปแบบ/ลิงก์; การ Merge แผน **ไม่เท่ากับอนุมัติลงมือแก้ Production**. Feature PR ต้องมี baseline evidence, QA และ approval เฉพาะงาน. ไม่ใช้ GitHub Actions เพิ่มเอง.

## 9. Decision Log / งานรอเริ่ม

- **Decision D-01 (26 ต.ค. 2569):** สถาปัตยกรรมเป้าหมายเป็น Tailwind v4 + shadcn/ui + React/TypeScript/Vite; เริ่มจาก isolated prototype; **ยังไม่อนุมัติ cutover**.
- **Decision D-02:** ไม่ยกเลิก CSS เดิมก่อนผ่าน visual comparison. สามารถเลือกกลับไป Design Tokens + CSS เดิมได้ถ้าต้นทุนสูง/ยังไม่แก้ปัญหาผู้ใช้.
- **Decision D-03:** ใช้ master roadmap เดิมเป็นคิวหลัก รหัสงาน `UI-M0..M7` เป็น workstream ย่อย ไม่ตั้ง roadmap แข่งขันกับ ARCH-01, UX-P0–P3, CAT-01.
- **Next Action (พร้อมทำแยก PR):** UI-M0 Discovery + screenshots บนเครื่องจริง + จัด Design Tokens v0 + wireframe Home/Library/Settings โดยไม่แตะ Reader runtime.
- **Unresolved:** ผู้ดูแลต้องพิจารณาว่าจะใช้ build artifact ใน repo เดิมตลอดไป หรืออนุมัติ hosting/deployment pipeline ใหม่ในอนาคต ก่อน UI-M6.

## 10. Official technical references (ตรวจความเข้ากันได้ก่อน scaffold)

- Tailwind CSS + Vite: https://tailwindcss.com/docs/installation/using-vite
- shadcn/ui + Vite: https://ui.shadcn.com/docs/installation/vite
- Vite Static Deploy / GitHub Pages base: https://vite.dev/guide/static-deploy
- Master WD Books: [WD_BOOKS_READER_UX_ROADMAP_2569.md](WD_BOOKS_READER_UX_ROADMAP_2569.md)
- Original architecture guardrails: [WD_BOOKS_ARCH01_BASELINE_2569.md](WD_BOOKS_ARCH01_BASELINE_2569.md)
- Historical incident: [WD_BOOKS_PWA_INCIDENT_25691025.md](WD_BOOKS_PWA_INCIDENT_25691025.md)
