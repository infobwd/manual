# WD Books — Execution Reconciliation & UI-MIG-01R2 (29 ต.ค. 2569)

**Parent:** [Master Reader UX Roadmap](WD_BOOKS_READER_UX_ROADMAP_2569.md).
**Baseline:** `main` at `ce57717e26b46a6ba219807b0b501f70531c5b21`, Production PWA source v1.3.68.
**Status:** Read-only reconciliation + *isolated* responsive desktop preview. **No Production cutover.**

## 30 ต.ค. 2569 — React Build evidence จากเครื่อง Windows

หลังเริ่ม UI-MIG-02R2 ผู้ใช้ส่ง Terminal ผลทดสอบจาก `D:\wd-books-manual\docs\previews\ui-react` ยืนยันว่า **source tests PASS, สร้าง genuine npm lockfile 166 entries, npm ci PASS, TypeScript/Vite Build PASS และ Vite dist relative-path contract PASS**. การจับภาพ Chromium/Edge ขนาด 390×844, 1024×768, 1366×768 และ 1920×1080 **CAPTURED 4/4** — แต่รอบแรกเป็นภาพ **Home เท่านั้น** ไม่ใช่ Bookshelf; ยังไม่มีภาพ PNG จริงให้ตรวจด้วยสายตา.

Draft PR #208 จึงเพิ่ม QA-only routes `?view=books&theme=night&category=...` และเครื่องมือจับภาพ **7 กรณี** สำหรับ Bookshelf/หมวดหมู่/ธีม/Settings พร้อมตรวจขนาด PNG; เพิ่ม `.gitignore` ป้องกัน `dist/node_modules` และแก้คำเตือน Node DEP0190 จาก Windows npm shell. โค้ด source/QA contract ผ่าน 7/7 ใน JavaScript harness; **Windows Build หลังเปลี่ยนภาพ 7 กรณียังรอผลทดสอบ**. Lockfile จริงยังอยู่ในเครื่องผู้ใช้และยังไม่ได้ Commit เข้า PR #208.

Main source ปัจจุบัน **v1.3.73**; แผนนี้ไม่ใช่การอนุมัติให้รวม PR #173/#207/#208 เข้า Production. Gate 2 สำหรับ Build เดิมมี user-confirmed PASS แต่ Browser Visual/Device และ Merge Gate ยังคง OPEN.

## 30 ต.ค. 2569 — งานต่อหลัง FLIP-14 Node Gate

- **FLIP-14 PR #205:** ผู้ใช้ยืนยัน Windows Node Regression 18/18 PASS รอบล่าสุดหลังแก้ `keep-with-next`; Desktop SAR 160% ตามภาพเฉพาะ spread ผ่าน แต่ iPhone/iPad/audio/PWA/NT/O-NET ครบชุดยังไม่ผ่าน Visual/Device gate. PR #205 ยัง Draft และยังไม่มีการ Release.
- **UI-MIG-01R2 PR #206:** Design preview Category-first และอุปกรณ์ภาพในเครื่องยัง Draft; การตรวจรับภาพหลายอุปกรณ์ยัง OPEN.
- **UI-MIG-02R2 PR #208:** React/TS/Vite/Tailwind candidate บน PR #207 → #173; เพิ่มเครื่องมือสร้าง npm-generated lockfile, built-dist relative-path checks และรายงาน Gate2 แบบ PASS/FAIL/NOT_RUN เพื่อรันทดสอบบนเครื่อง Windows จาก Clone เดิม.
- **ลำดับต่อไป:** ให้ผ่าน React source tests → npm-generated lockfile → `npm ci`/TypeScript/Vite build → built subpath contract → browser/keyboard/Responsive ก่อนตัดสินใจย้าย UI. ห้ามย้าย Reader/Audio/PWA ในรอบ React Prototype. ไม่มีผลเปลี่ยน Production; main source ล่าสุด v1.3.73.

## 1. Reconciled status — never confuse MERGED with QA PASS

| Workstream | Verified source status | Remaining gate |
|---|---|---|
| UX-P0A/B, tablet/desktop and Reader controls | Merged across PR #8 and subsequent UX/FLIP hotfixes through #204 | Full real-device matrix still incomplete |
| UX-SEARCH-HIGHLIGHT | Merged PR #47–48 | Device and accessibility regression evidence |
| UX-DISCOVERY P1–P3 | Merged PR #51–53 | Device, large-library and visual QA |
| ARCH-01B/C/D | Partially modularized/merged PR #55, #57–59 | Full Node suite and browser/device contracts |
| ARCH-01E | Measurement runbook merged PR #60 | Actual cold/warm/offline and heap results not captured |
| CAT-01A | Contract script merged PR #62 | Runtime Node suite and offline gate |
| CAT-01B | **Open PR #63** (opt-in metadata only) | No premature lazy-load runtime migration |
| FLIP-13 | Merged PR #204, v1.3.68 | Real PWA/iPad/desktop QA, close/esc/title |
| FLIP-14 | **Draft PR #205** (separate branch) | Enrichment parity and SAR chart visual/device gate; NOT deployed |
| UI-MIG-00 | Read-only verified interim baseline merged PR #170 | **Gate 0 OPEN**, local logs/screenshots/measurements pending |
| UI-MIG-01 | Tokens + 3-view preview merged PR #171–172 | **Gate 1 OPEN**, visual/device acceptance pending |
| UI-MIG-01R2 | This isolated preview branch | Desktop category-first design review and mobile/iPad responsive QA |
| UI-MIG-02 | **Open PR #173** source-only React/Tailwind/shadcn spike | npm lockfile, reproducible build, a11y/device QA; **Gate 2 OPEN** |
| SP-PILOT-01 | **Open PR #180** document-only Superpowers pilot for #173 | Verify design/baseline/implementation plan before next stage |
| UI-MIG-03–05 | Planned, not deployed | Catalog → Reader → Audio/PWA parity, sequential gates |
| UI-MIG-06 | Blocked | Explicit cutover approval, rollback and full QA |

Earlier TODO entries in §4 of the Master Roadmap are **historical plans**, not the current execution state; use this reconciliation plus subsequent dated updates.

## 2. UI-MIG-01R2 desktop design decision candidate

**Observed issue:** Sidebar category selection in the current desktop Production requires moving to results below other panels. FLIP-12 inserted auto-scroll as a short-term fix. The target Desktop layout should instead show navigation **beside the book results** at first view.

**Isolated visual preview:** [Home / Bookshelf / Settings](previews/ui-next/index.html) (synthetic sample titles).
- Desktop ≥1000px: category panel at left, search + status filters + book grid at right; category selection updates visible cards in-place, result count announced with `aria-live`, no jump required.
- Mobile/tablet: category panel collapses above the card results (regular tap targets); Home category selections open the bookshelf already filtered, with no unsafe nested controls.
- Preserve light/sepia/night, typography settings and three-page navigation; use fixed sample content with **no production storage or runtime**.
- This preview is not Tailwind, shadcn, React, or a production catalog; it is a visual contract to validate before UI-MIG-02 parity work.

## 3. Test and approval gates

- Static `node tests/ui-mig01-desktop-preview.smoke.cjs` (new, not run in actual repo environment in this chat).
- Visual screenshots on 390×844 phone; iPad portrait/landscape/Split View; Desktop 1366×768 and 1920×1080, with light/sepia/night and browser zoom 200%.
- Verify no need to scroll after selecting categories on Desktop at the target width. Buttons and result count usable via keyboard / screen reader.
- Compare Home hierarchy: search and Continue Reading visible early; avoid duplicating navigation and hero; prioritize single-hand operation on iPhone.
- Gate 0/1 status stays **OPEN** until owner accepts screenshots and device baseline; **no PWA version bump** or modification to `index.html`, `assets/app.js`, Service Worker, Reader, or state in this PR.

## UI-MIG-01R2 checkpoint — 29 ต.ค. 2569

- **Home search fixed**: typing a query now keeps the user on Home until the search form is submitted (Enter / Search button); submitting opens Bookshelf and focuses its search field with matching results.
- **Category shortcut fixed**: selecting a category from Home clears prior unrelated "favorites/recent" and search filters, so all public sample books of that category are visible.
- Fetched live PR sources and executed `tests/ui-mig01-desktop-preview.smoke.cjs` through a compatible JavaScript source harness: **static contracts + mock DOM interaction assertions PASS**, including no navigation while typing, explicit search submission, result focus, category/favorites composition, empty state, navigation, theme and typography.
- **Actual Node execution and real browser screenshots: NOT TESTED.** The compatibility harness cannot certify real CSS layout, browser focus, screen reader, iPhone PWA or iPad Split View. Gate 0/1 remain OPEN.
- No production Reader, Audio, Service Worker, app version or stored user data modified in this draft PR.

## UI-MIG-01R2 screenshot preparation — 29 ต.ค. 2569

- The isolated preview now accepts **preview-only** query switches: `?view=books&theme=night&category=งานบริหาร`. They change only sample UI state, never real catalog or saved preferences.
- Added `tests/ui-mig01-capture.cjs`, a dependency-free Node/Chromium CLI matrix that captures Phone 390×844 (light/night), Tablet 1024×768, Desktop 1366×768/1920×1080 and Settings sepia screenshots into an OS temporary folder outside Git.
- On a checked-out repo with Chrome/Chromium:
  ```powershell
  node tests/ui-mig01-desktop-preview.smoke.cjs
  node tests/ui-mig01-capture.cjs
  ```
  If Chrome is not found, set `CHROME_BIN` to the installed browser executable (PowerShell: `$env:CHROME_BIN = "C:\Program Files\Google\Chrome\Application\chrome.exe"`).
- Browser capture test **NOT PASSED in this isolated chat runtime**: although Chromium 144 and Playwright were present, the managed browser blocked navigation to both `file://` and `http://127.0.0.1` with `ERR_BLOCKED_BY_ADMINISTRATOR`. A blank local HTML sanity check via `page.set_content` did render, but it was **not** the PR preview. Do not infer actual responsive QA PASS.
- JS-preview query configuration was executed in a V8 mocked DOM with `view=books`, `theme=night`, `category=งานบริหาร`: it selected the correct screen, color mode, 2/8 result label and two cards. It does **not** prove CSS sizing, safe area or overflow.
- New React equivalent design candidate is [Draft PR #208](https://github.com/infobwd/manual/pull/208) stacked on TDD PR #207/#173. None of these preview branches modify Production.

## 4. Remaining implementation sequence

1. Close FLIP-14 on real devices without losing SAR content or externally loaded public books.
2. Review UI-MIG-01R2 visual comparison and update design-token decision; if accepted, finish Gate 0/1 evidence.
3. Review #173 + #180 (Superpowers SP-PILOT-01) source, run `npm ci`/build in isolated workspace and audit dependencies/license; do not merge before Gate 2.
4. UI-MIG-03 preview catalog adapter, UI-MIG-04 Reader integration, UI-MIG-05 audio/offline/PWA, UI-MIG-06 controlled cutover only with separate approvals.
5. CAT-01 lazy loading separately, after measured ARCH-01E baseline; no simultaneous architectural cutover.

All content in these preview/doc changes is public-safe and does not touch student/teacher private data.
