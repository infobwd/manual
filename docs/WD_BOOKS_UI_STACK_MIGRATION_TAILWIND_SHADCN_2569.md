# WD Books — UI Stack Migration Plan: Tailwind CSS + shadcn/ui (2569)

**Plan ID:** WD-BOOKS-UI-STACK-01  
**Version:** 1.0 — 26 ตุลาคม 2569  
**Status:** ARCHITECTURE PLAN / DOCUMENTATION-ONLY — ยังไม่อนุมัติ implementation, ยังไม่เปลี่ยนเว็บ Production  
**Repository:** \`infobwd/manual\` (Public)  
**Production:** https://infobwd.github.io/manual/  
**Master roadmap:** [WD_BOOKS_READER_UX_ROADMAP_2569.md](WD_BOOKS_READER_UX_ROADMAP_2569.md)  
**Related contracts:** [ARCH-01](WD_BOOKS_ARCH01_BASELINE_2569.md), [ARCH-01E baseline](WD_BOOKS_ARCH01E_PERFORMANCE_BASELINE_2569.md), [CAT-01](WD_BOOKS_CAT01_LOADING_DESIGN_2569.md), [QA device gate](WD_BOOKS_QA_DEVICE_GATE_133.md)

> **ตัดสินใจเชิงทิศทาง:** ให้ React + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui เป็น **target UI architecture ที่ต้องพิสูจน์ผ่าน prototype** ไม่ใช่คำสั่งให้ย้ายทั้งระบบทันที. ใช้ **parallel / strangler migration** ทีละส่วน, ไม่ย้าย Reader/Audio/PWA พร้อมกัน, และคงระบบ Production เดิมระหว่างทดลอง. ถ้า prototype ไม่ดีกว่าระบบเดิมจริง สามารถปิดแผนหลังขั้น proof-of-concept และใช้ Design Tokens/CSS เดิมต่อได้

## 1. เหตุผลและเป้าหมายที่วัดได้

ปัญหาที่ต้องแก้ **ไม่ใช่ “CSS เดิมไม่สวยเพราะไม่มี Tailwind”** แต่เป็นงาน UI ที่กระจายหลายไฟล์ มี selector ซ้อนกัน และความเสี่ยง regression ทุกครั้งที่แก้ Responsive, Reader, Audio dock หรือ Safe Area. เป้าหมายคือได้หน้าตาอ่านสบายคล้ายแอปหนังสือชั้นนำ โดยคุม consistency, accessibility และต้นทุนดูแลระยะยาว

ผลลัพธ์ที่ต้องพิสูจน์:
1. หน้า Home / ชั้นหนังสือ / ค้นหา / ตั้งค่า มี UI components, spacing, typography, colors, interaction states และ dark/sepia ที่สม่ำเสมอ
2. iPhone ใช้นิ้วโป้งขวาเข้าถึงการอ่าน/ปิด/สารบัญได้; iPad portrait/landscape/Split View ไม่เกิดช่องว่างหรือขอบทับ, Desktop ยังอ่านหน้าคู่ตามเงื่อนไขเดิม
3. ความเร็ว cold/warm start, catalog search, open book, audio, battery/network usage และ offline **ไม่ถดถอย** จาก baseline ที่วัดจริง; ห้ามรายงานเปอร์เซ็นต์เพิ่มขึ้นก่อนวัด
4. อ่านหนังสือทุกเล่มด้วย book IDs/metadata/หน้า/links เดิม, ไม่เสีย progress, favorites, bookmarks, themes, font sizes, audio control และข้อมูลบนเครื่อง
5. การพัฒนาเป็น Local-First: Windows + VS Code + Node สำหรับ build/test; ไม่ใช้ GitHub Actions ใหม่, ไม่ต้องมี backend/login, production เป็น Static GitHub Pages เหมือนเดิม

**Non-goals:** ไม่เปลี่ยนระบบเนื้อหา/ข้อสอบหรือ WD Growth Production, ไม่เก็บข้อมูลผู้ใช้บน server, ไม่เพิ่ม TDRS login, ไม่ย้ายไฟล์หนังสือสาธารณะไป SaaS ภายนอก, ไม่แปลงทุกหน้าเป็น React โดยไม่มีผลทดลองรองรับ

## 2. ตรวจสภาพจริงก่อนตัดสินใจ (source baseline 26 ต.ค. 2569)

| ส่วน | สภาพ repo ปัจจุบัน | ข้อผูกพัน |
| --- | --- | --- |
| Runtime | \`index.html\` โหลด JS script แบบ deferred และ CSS แยกหลายไฟล์, ไม่มี \`package.json\` / React / Vite app ใน root | อย่าลบ runtime เดิมจน production candidate ผ่าน |
| CSS | \`assets/styles.css\`, \`app-experience.css\`, \`mobile-reader.css\`, \`home-p0a.css\`, \`toc-p0b.css\`, \`audio-reader.css\` และอื่น ๆ | แยก style ของ prototype, หลีกเลี่ยง Tailwind preflight/reset ชน selector เก่า |
| Data | \`assets/manuals-data.js\` ให้ \`window.WD_LIBRARY_DATA\`; \`assets/wd-growth-individual-guide.js\` และ \`assets/catalog-core.js\` เป็น dependency สำคัญ | ห้ามแก้ book ID, status=published filter, public-only contract โดยไม่ผ่าน CAT-01 |
| Reader | \`assets/app.js\` เป็นตัวประสาน DOM และ reader; มี TOC, focus, 1/2 pages, reading mode, zoom, theme | ไม่ React-mount ทับ DOM node เดียวกับ legacy reader ในเวลาเดียวกัน |
| Local state | \`assets/experience.js\` ใช้ key \`wd-manual-reader-v2\` และ schema ปัจจุบัน (theme, font, progress, recent, favorites, history, bookmarks, readingMode, typography) | backward-compatible read/write, ไม่ลบ/รีเซ็ต progress |
| Audio | \`audio-reader.js\`, \`audio-reader-core.js\`, \`audio-listening-lock.js\`, CSS audio dock | ทดสอบ media session/lock screen ไทย/Chrome/iOS และไม่แตะ TDRS authentication |
| PWA | \`sw.js\` import \`assets/app-version.js\`, preload app shell แล้วรอผู้ใช้กดยืนยันอัปเดต; cache JS/CSS first | ห้ามเปลี่ยน cache scope/strategy โดยไม่มี migration plan และ real-device proof |
| Hosting | GitHub Pages จาก \`main\` + \`/(root)\`; offline static | ต้องมี build artifacts อยู่ใน Pages root ภายหลัง build local; ห้ามพึ่ง CDN ที่ runtime |
| QA | มี Node smoke tests หลายชุดและแผน device gate, บาง real-device gate ยังต้องเก็บหลักฐาน | เพิ่ม browser/device contract tests ของ stack ใหม่ ไม่ถือ simulation = ผ่านบน iPhone จริง |

สภาพและเวอร์ชันที่ระบุในเอกสารนี้เป็น snapshot วันที่วิเคราะห์ **ทุก implementation PR ต้องอ่าน HEAD ล่าสุดของ \`main\` อีกครั้ง** และเทียบกับงานจากแชท/PR อื่นก่อนแก้ Production

## 3. วิเคราะห์ทางเลือกและ Architecture Decision Record (ADR)

| ตัวเลือก | ได้อะไร | ข้อจำกัด | ข้อสรุป |
| --- | --- | --- | --- |
| A — CSS เดิม + Design Tokens | ความเสี่ยงต่ำ, ไม่เพิ่ม runtime, ปรับหน้าตาเร็ว | ส่วนประกอบและ state ยังคงกระจายอยู่ | **Fallback ที่รักษาไว้** |
| B — Tailwind v4 build เป็น CSS + vanilla JS | consistency และ utility styling โดยยัง static | ไม่ได้ใช้ React components ของ shadcn/ui อย่างเต็มรูปแบบ, ต้องดูแล JS interactions เอง | **ใช้เฉพาะกรณี prototype React ไม่คุ้ม** |
| C — React + TS + Vite + Tailwind v4 + shadcn/ui | component ownership ชัด, dialog/sheet/tabs และ design system สม่ำเสมอ, บำรุงรักษา UI ระยะยาวได้ | ต้องมี build tooling, rewrite adapter/reader บางส่วน, เพิ่ม bundle และ QA risk | **Target สำหรับทดสอบและย้ายแบบค่อยเป็นค่อยไป** |

**Decision:** ทดลอง C ในพื้นที่แยกให้เห็นผลจริงก่อน. ยืนยันว่าคำว่า *shadcn/ui* คือ **โค้ด component ที่ CLI นำเข้า project** ไม่ใช่การเพิ่ม CSS theme อย่างเดียว; การใช้แบบเต็มรูปแบบต้องมี React และเลือก component primitives/versions ให้เข้ากัน. รุ่น/คำสั่งติดตั้งให้ตรวจจาก upstream อีกครั้งเมื่อเริ่ม WP2 ไม่ copy version ล็อกจากเอกสารเก่า

Official references:
- Tailwind v4 Vite integration: https://tailwindcss.com/docs/installation/using-vite
- shadcn/ui Vite existing project: https://ui.shadcn.com/docs/installation/vite
- shadcn/ui introduction: https://ui.shadcn.com/docs
- shadcn/ui CLI and presets: https://ui.shadcn.com/docs/cli

### ภาพ Target Architecture ที่จะพิสูจน์

\`\`\`text
repository infobwd/manual
├── index.html + assets/*       # WD Books legacy Production — คงเดิมช่วงทดลอง
├── sw.js                       # SW ของเว็บจริง ยังไม่แตะช่วง prototype
├── docs/
│   ├── WD_BOOKS_READER_UX_ROADMAP_2569.md
│   ├── WD_BOOKS_UI_STACK_MIGRATION_TAILWIND_SHADCN_2569.md
│   └── previews/ui-next/       # optional generated static preview หลังผ่าน public-content QA
└── experiments/wd-books-ui-next/  # proposed source workspace, ยังไม่มีใน repo
    ├── package.json / lockfile
    ├── vite.config.ts          # static build, base path ตรวจใน nested preview/Pages
    ├── src/
    │   ├── app/               # React shell / navigation (prototype only)
    │   ├── components/ui/     # shadcn/ui copied, audited source
    │   ├── components/books/  # Book cards, search, catalog filters
    │   ├── lib/catalog/       # readonly adapter to PUBLIC catalog contract
    │   ├── lib/storage/       # legacy-compatible adapter tested before writes
    │   └── styles/            # Tailwind v4 + WD Books tokens, locally scoped
    └── tests/                 # isolated browser + contract smoke
\`\`\`

ข้อกำหนด path เป็น **เป้าหมายร่าง**: ค่อยสร้างตอน WP2 และทบทวนเมื่ออ่าน repo ล่าสุด. Preview ใน \`docs/previews/ui-next/\` ต้องไม่มี SW ที่ scope เป็น \`/manual/\`, ไม่ override cache/manifest ของ Production และไม่เปิดเนื้อหาภายใน. Production ถ้าย้ายจริงต้อง build locally แล้วเผยแพร่ **compiled static output ที่เส้นทาง GitHub Pages รองรับ** ไม่เรียก \`vite dev\` ใน production, ไม่บังคับ Actions และไม่ฝาก dependencies ไว้ที่ CDN ขณะรัน

## 4. WD Books Design System — เกณฑ์ความสวยที่ตรวจได้

### Design tokens และการอ่าน

- Brand: \`pine\` และ \`pine-deep\`, neutral/paper/line อิงตัวแปรสีปัจจุบัน; map เข้า Tailwind theme tokens อย่างเป็นระบบ ห้ามแทนสีแบบ ad hoc หลายสิบค่า
- Theme: \`light\`, \`sepia\`, \`night\` ต้องรักษาทั้ง 3; contrast อย่างน้อย WCAG 2.2 AA สำหรับข้อความสำคัญ, ไม่ใช้เพียงสีบอกสถานะ
- Type: เลือก Thai type scale ที่อ่านสบายทั้ง iPhone/iPad; ปรับฟอนต์ 90–160% แล้วไม่ตัดเนื้อหา; จัด line height, paragraph width และ page margins ให้เหมาะกับภาษาไทย
- Spacing/radius/shadow/icon: token เดียวสำหรับปุ่ม การ์ด book cover dialog sheet tab badge search field และรายการอ่านต่อ; focus visible และสถานะ disabled ชัดเจน
- Touch targets: ตั้งเป้าใช้งานด้วยนิ้วโป้งอย่างน้อยราว **44×44 CSS px** เมื่อทำได้; รองรับ safe-area iOS และ landscape
- Reduced motion, keyboard Tab/Shift-Tab/Arrows/Escape, screen reader announcements และ focus restoration ต้องคง/ดีขึ้น
- Homepage: อ่านต่อ > ค้นหา > หมวดหมู่ > หนังสือ; Reader: เนื้อหามาก่อน chrome; Audio player ต้องไม่กินพื้นที่อ่านเมื่อไม่ได้ใช้งาน

### เปรียบเทียบหน้าจอที่จะตรวจแบบ A/B ก่อนแตะ Production

1. iPhone: Home + Search + Continue + Bottom Nav, book details และ Sheet
2. iPad: Home grid + Sidebar และ Reader portrait/landscape/Split View
3. Desktop: Catalog grid + Reader two-page + independent TOC scroll
4. Settings: theme/typography, navigation/focus/VoiceOver
5. Audio/PWA: Now Playing / listening lock / update waiting / offline

**เกณฑ์รับแบบ:** ผู้ทดสอบเปิดหนังสือเล่มเดิมจากหน้าแรกได้อย่างน้อยไม่ยากกว่า UI เดิม, ไม่พบ blocking overlay, ตัวหนังสืออ่านสบายขึ้นจากภาพคู่เทียบและ feedback จริง. ห้ามใช้ความเห็นว่า “ดูทันสมัย” อย่างเดียวเป็น release gate

## 5. Execution Plan — ห้ามข้าม Gate

| WP | ขอบเขต PR | สิ่งส่งมอบ | Go/No-Go gate |
| --- | --- | --- | --- |
| **UI-MIG-00** | Inventory + baseline read-only | รายการ legacy contracts, screenshots iPhone/iPad/desktop, cold/warm/offline/audio measurements, accessibility defects, UI component inventory | **Gate 0:** baseline มีหลักฐานและเจ้าของตรวจรับ; ถ้าไม่มีเครื่องจริงให้บันทึก NOT TESTED |
| **UI-MIG-01** | Design Tokens + Figma/HTML preview (ไม่แตะ reader) | CSS token map, typography/theme variants, Home/Catalog/Settings prototypes A/B | **Gate 1:** visual review บนขนาดหน้าจอหลัก และไม่เปลี่ยน production assets |
| **UI-MIG-02** | React + TS + Vite + Tailwind v4 + shadcn/ui **isolated spike** | workspace source, lockfile, audited components (Button, Card, Sheet, Dialog, Tabs), built static preview, no SW root scope | **Gate 2:** build reproducible local, no runtime CDN/API, compatible Pages subpath, keyboard/focus/a11y smoke; **decide C vs B/A** |
| **UI-MIG-03** | Shell + Catalog adapters ใน preview | search/filter/sort/book cards/continue/favorites + read-only typed catalog adapter; preserve book IDs and published-only rules | **Gate 3:** parity เทียบ legacy, พิสูจน์ read-only localStorage ก่อนเปิด write และไม่ React/legacy ownership ชน DOM |
| **UI-MIG-04** | Reader integration **separate decision** | Reader prototype ทีละ capability: open, TOC, paged/continuous, bookmark/progress, themes, iPad/desktop | **Gate 4:** ทุก regression ผ่าน iPhone/iPad/Desktop; หากไม่ได้ parity ให้ใช้ legacy Reader ต่อ อย่าฝืน convert พร้อม Shell |
| **UI-MIG-05** | Audio + offline + PWA update isolated QA | compatible audio dock/MediaSession, TTS fallbacks, version/cache migration and rollout test plan | **Gate 5:** real-device background/foreground, PWA install, waiting update, offline, no storage loss, no TDRS login regression |
| **UI-MIG-06** | Controlled root cutover after explicit approval | locally compiled static build, documented release checklist, rollback commit/ref, monitored QA after Pages deployment | **Gate 6:** parity + signed acceptance; rollback reachable; increment single PWA version from latest main, not guessed |

**ห้ามให้ WP2–WP5 บังคับย้ายทุกชิ้นใน PR เดียว.** แต่ละ WP แยก PR, root scripts/index/SW เปลี่ยนเฉพาะเมื่อครบ gate. ถ้าการทดสอบแสดงว่า UI ดีขึ้นแต่ Reader regress ให้เลือก React Shell+legacy Reader แบบ isolated boundary ที่มี ownership ชัด หรือเลิกย้าย Reader แล้วคง CSS เดิม

### WP2 Spike: component ownership

- React เป็นเจ้าของเฉพาะ DOM subtree ใน preview; ไม่ \`createRoot\` ครอบ DOM ที่ \`app.js\` เดิมกำลังแก้
- ใช้ shadcn components แบบ “copy source into project”, commit source ที่จำเป็นจริง, ตรวจ license/dependencies และ lockfile
- เลือก UI primitive flavor (Radix/Base UI ฯลฯ) หลัง smoke ด้าน iOS/keyboard; ไม่สลับภายหลังโดยไม่บันทึก ADR ใหม่
- Tailwind utilities จำกัดอยู่ใน preview workspace; ป้องกัน preflight/reset เปลี่ยนหน้าหนังสือเก่าทั้งไซต์
- Static deployment: preview จะอยู่ใต้ path เฉพาะ, ไม่มี root-scoped SW และไม่มี browser history routing ที่ GitHub Pages ให้ 404 เมื่อ refresh; เริ่มด้วย relative URLs/hash navigation

## 6. Compatibility Matrix ที่ต้องรักษา (Contract Tests)

| สัญญา | ต้องเทียบอะไร | Fail / rollback เมื่อ |
| --- | --- | --- |
| Book catalog | IDs, categories, status/published, order, search, text, image, cross-book links, no private content | แสดงหนังสือผิดสถานะ/ไม่พบหนังสือที่เดิมเปิดได้ |
| Local state | \`wd-manual-reader-v2\` schema และ progress, favorites, bookmarks, typography, recent/history, readingMode | เปิดแอปใหม่แล้ว bookmark/progress หาย หรือ schema ใหม่ทำให้รุ่นเก่าอ่านไม่ได้ |
| Reader UX | Page 1/2, last page, TOC focus/scroll, left/right arrows, escape, scroll mode, zoom, text 90–160% | ข้อความถูกตัด, ซ่อนเครื่องมือจนออกไม่ได้, สลับหน้าแล้วตำแหน่งผิด |
| Mobile/iPad | iPhone Safari/PWA, iPad 1032×1376 portrait/landscape, Split View; landscape/safe area/dock | toolbars บังเนื้อหา, TOC เข้าไม่ได้, CSS viewport ผิด |
| Audio | Play/pause/seek/speed, Thai online voice error/fallback, lock screen/MediaSession when supported, foreground display | เสียงหยุดโดยไม่ได้แจ้งข้อจำกัด, online voice ถูกผูก TDRS login, media control regression |
| PWA | App shell, install, cold/warm/offline, service worker waiting/install/activate, cache update, long-lived iOS PWA | ติดตั้งไม่ได้, data blank หลัง update, cache \`MISSING: data\`, ลบ localStorage โดยไม่ได้ยินยอม |
| A11y | WCAG 2.2 AA, keyboard, focus trap/restore, VoiceOver labels, screen zoom, reduced motion | อ่าน/ปิด Dialog ไม่ได้ด้วยคีย์บอร์ดหรือ VoiceOver |

**Existing Node smoke suite ขั้นต่ำก่อน PR ที่เปลี่ยน runtime:** \`node tests/js-syntax-gate.cjs\`, \`node tests/manuals-data-syntax.smoke.cjs\`, \`node tests/library.smoke.cjs\`, \`node tests/pwa-reader.smoke.cjs\`, \`node tests/pwa-update-lifecycle.smoke.cjs\`, \`node tests/ipad-reader-layout.smoke.cjs\`, \`node tests/listening-now-playing.smoke.cjs\`, \`node tests/audio-reader-integration.smoke.cjs\` และชุดอื่นที่ได้รับผลกระทบ

Smoke เดิมจำนวนมากจำลอง DOM แบบ vanilla จึง **ไม่ใช่ tests ของ React** ให้สร้าง test harness เพิ่มสำหรับ React UI/reader adapters (component tests + browser-level) ไม่ควรลบ smoke เดิมก่อน parity และไม่ควรรายงานว่าผ่านจริงหากยังไม่ได้รันบน Windows/device

**Performance acceptance proposal:** วัด cold/warm, first book open, filter response, transfer size (compressed/uncompressed), memory และ offline load เดิมสามรอบต่อ device แล้วตั้ง budget ใหม่; จุดตั้งต้นให้ไม่ช้ากว่าเดิมเกินประมาณ 10% ใน metric สำคัญ *หลังปรับเพื่อความแปรปรวน* หรือให้ Owner อนุมัติ tradeoff เป็นลายลักษณ์อักษร. 10% เป็นเกณฑ์เสนอสำหรับ gate ไม่ใช่ผลตรวจหรือมาตรฐานสากล

## 7. GitHub Pages, Release Version และ Multi-chat Governance

1. Source of truth = \`main\` ล่าสุด ณ วันสร้าง PR; ต้อง fetch/check latest HEAD และตรวจ PR อื่นที่แตะ \`index.html\`, \`assets/app-version.js\`, \`assets/manuals-data.js\`, \`sw.js\`, \`assets/app.js\`, \`assets/experience.js\` ก่อนเปลี่ยน
2. **Documentation-only / isolated preview PR ไม่ต้อง bump \`WD_BOOKS_VERSION\`** และไม่แตะ \`sw.js\` หรือ root production UI; ลดการชนเวอร์ชันจากหลายแชท
3. PR ที่เปลี่ยน production assets ให้ build/test/approve ก่อน bump version เพียงครั้งเดียวโดยอ่านค่าใน \`main\` ณ เวลา merge; ห้าม commit หมายเลขเดียวจากสอง branch ต่างกัน
4. GitHub Pages ปัจจุบัน deploy จาก \`main\` root โดยไม่มี custom Actions; Vite ต้องคอมไพล์ในเครื่อง Windows/VS Code ก่อน แล้วใส่ compiled static assets ใน path ที่กำหนดตาม gate. ทดสอบ path \`/manual/\`, deep navigation, asset URLs และ refresh
5. แยก preview และ production SW scopes; preview ไม่ลงทะเบียน root SW เพื่อหลีกเลี่ยงการทับ cache/manifest และ “MISSING: data” ที่เคยพบ
6. รุ่นใหม่ต้องรองรับผู้ใช้ที่เปิด PWA รุ่นเดิมค้างอยู่, update waiting → user confirms → reload → retain localStorage/progress และ offline
7. Release/rollback: จด main SHA ก่อน cutover และ schema test snapshots; หากเกิด regression rollback เฉพาะ PR ล่าสุด (revert/restore static build + cache version ที่เพิ่มเป็นค่าใหม่) **ไม่ลบข้อมูลเครื่อง ไม่ force-push main ไม่ uninstall PWA ของผู้ใช้**
8. ไม่ใช้ GitHub Actions ใหม่ตามนโยบาย Local-First; ไม่เพิ่ม secrets, trackers, hosted app/backend ใหม่

## 8. Responsibilities / Gate Record

- **เจ้าของโครงการ/ผู้บริหาร:** รับรอง UX แบบใหม่, ความสำคัญของงาน, tradeoff และการเผยแพร่จริง
- **ผู้พัฒนา:** จัดทำ isolated spike, adapter compatibility, version discipline, source review และ regression evidence
- **ครู/ผู้อ่านทดลอง:** ทดสอบค้นหนังสือ เปิดอ่าน ปรับอักษร อ่านต่อ ฟังเสียง และใช้นิ้วโป้งบน iPhone/iPad
- **เอกสาร Gate:** ทุก PR ระบุ Scope, baseline SHA, screenshots หรือ NOT TESTED, tests commands/result, storage/PWA risk, rollback steps, owner decision

| Gate | สถานะ ณ 26 ต.ค. 2569 | สิ่งที่จะขออนุมัติ |
| --- | --- | --- |
| Planning / ADR | **DOCUMENTED** | ตรวจรับแผนและลำดับดำเนินการ |
| Gate 0 — inventory/device baseline | **NOT STARTED** | เริ่มเก็บ baseline (ไม่แก้เว็บ) |
| Gate 1 — visual & design tokens | **NOT STARTED** | รับรอง visual style ก่อน framework |
| Gate 2 — isolated React/Tailwind/shadcn spike | **NOT STARTED** | ตัดสินใจใช้ target stack จริงหรือ fallback |
| Gate 3–5 — catalog/reader/audio/PWA | **NOT STARTED** | อนุมัติเป็น PR ย่อยตามลำดับ |
| Gate 6 — production cutover | **BLOCKED** จนทุก gate ผ่าน | อนุมัติเผยแพร่แยกต่างหาก |

## 9. การผูกกับ Master Roadmap (ไม่สร้าง roadmap แข่ง)

- เอกสารนี้เป็น **technical execution annex** ภายใต้ [WD_BOOKS_READER_UX_ROADMAP_2569.md](WD_BOOKS_READER_UX_ROADMAP_2569.md) ไม่ใช่แผนแม่บทเล่มใหม่
- ต้องรักษาลำดับ hotfix/QA-DEVICE-GATE, ARCH-01E performance, CAT-01 content/loading contract และ UX-P3A Audio ให้ไม่ถูกข้ามจากการย้าย stack
- กฎความสำคัญ: งาน incident/readability/accessibility ของระบบเดิมมาก่อน feature framework ใหม่ หากซ้อน branch ให้ rebase/rebuild spike จาก main ล่าสุดแทนแก้ production พร้อมกัน
- **Next action ที่เสนอ:** UI-MIG-00 baseline และ UI-MIG-01 visual comparisons (Docs/Preview only), จากนั้นขอ Go/No-Go ก่อน UI-MIG-02. การมีแผนนี้ไม่ได้เริ่มติดตั้ง React, Tailwind หรือ shadcn/ui ใน Production

## UI-MIG-00 Execution Runbook — พร้อมเริ่มเก็บ Baseline (เพิ่ม 26 ต.ค. 2569)

อ่าน [WD Books UI-MIG-00 Baseline & Read-Only Inspection Runbook](WD_BOOKS_UI_MIG00_BASELINE_RUNBOOK_2569.md) สำหรับคำสั่ง Windows/PowerShell แบบไม่แตะ Production, Device QA matrix, ตารางบันทึกผล PASS/FAIL/NOT TESTED และ Gate 0 checklist. **การเพิ่ม runbook ไม่ได้ทำให้ Gate 0 ผ่าน** — ยังต้องเก็บหลักฐานจริงบน Windows/iPhone/iPad ก่อนเริ่ม UI-MIG-01.

## 10. References / provenance

- Repository baseline: \`index.html\`, \`assets/styles.css\`, \`assets/mobile-reader.css\`, \`assets/app.js\`, \`assets/experience.js\`, \`assets/manuals-data.js\`, \`sw.js\`, \`tests/*\`, \`docs/WD_BOOKS_ARCH01_BASELINE_2569.md\`, \`docs/WD_BOOKS_READER_UX_ROADMAP_2569.md\`.
- Tailwind CSS official: https://tailwindcss.com/docs/installation/using-vite
- shadcn/ui official: https://ui.shadcn.com/docs/installation/vite and https://ui.shadcn.com/docs
- WCAG 2.2 official: https://www.w3.org/TR/WCAG22/
- ทั้งหมดเป็นข้อมูล/แผนสำหรับออกแบบทางเทคนิค ไม่ใช่ข้ออ้างว่ามีการย้าย stack แล้ว
