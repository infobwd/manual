# WD Books — UI-MIG-02R3: Responsive & Visual QA (isolated React preview)

**Date:** 30 ตุลาคม 2569 · **Repository:** `infobwd/manual`  
**Implementation branch:** `fix/ui-mig02r3-mobile-responsive-25691030`  
**Parent:** Draft PR #208 / `feat/ui-mig02-category-first-r1-25691029` at `3a5dba551edfcb36bfc51cdaf56ea5ed5eb6a4b2`.  
**Production baseline:** main `2c1592085910b47c400ca5eb0b5733b1d3915774` / WD Books 1.3.73.  
**Status:** SOURCE REVIEW COMPLETE; BROWSER/BUILD/REAL DEVICE ACCEPTANCE OPEN. **NO MERGE / NO PRODUCTION CHANGE.**

## 1. Root-cause investigation / evidence boundary

User-provided PNGs measured **390×844 (mobile Home/Bookshelf), 1024×768 (tablet Bookshelf), 1366×768 (desktop Bookshelf)**. The two mobile images visibly cut off the right side of cards and bottom navigation, but PNG dimensions alone cannot establish CSS overflow.

**Proven harness defect in previous revision:** the legacy `capture-responsive.cjs` ran Chrome with `--window-size=390,844`, checked only PNG dimensions and React text, and never measured `window.innerWidth`, `document.documentElement.clientWidth`, `scrollWidth`, `visualViewport.width`, or element bounding rectangles. Chrome headless may clamp or modify the requested layout viewport independently of the PNG size. Thus the earlier `CAPTURED` marker was not a Visual QA PASS.

**Preventative layout improvements, not retroactive proof:** the prior `BookCards` always started with Tailwind `grid-cols-2` on small screens. It could produce very narrow cards at 320–390px and long Thai-title wraps. The R3 grid now uses 1 column below 420px, 2 at 420–759, 3 at 760–1199, and 4 at 1200px+, all `minmax(0,1fr)`. We additionally add `min-width:0`, `overflow-wrap:anywhere`, three equal mobile nav tracks, touch height and bottom/side safe-area padding. The debug preview label is hidden below 768px. **Whether the original screenshot defect was exclusively capture-clamping or also a genuine CSS overflow remains UNCONFIRMED until R3 CDP metrics are collected on Windows.**

## 2. CDP evidence gate

`scripts/capture-responsive.cjs` serves **only local dist on 127.0.0.1**, launches installed Chrome/Edge with a unique temporary profile and talks directly to Chrome DevTools Protocol using Node 24's built-in WebSocket (no new browser dependency).

Each scene uses `Emulation.setDeviceMetricsOverride` (CSS width/height, DPR=1), waits for React route heading, captures via `Page.captureScreenshot`, and writes a PNG plus `capture-report.json`. Independent `scripts/responsive-checks.cjs` checks:
- requested CSS width vs `innerWidth`, `clientWidth` and `visualViewport.width`
- `documentElement.scrollWidth` and `body.scrollWidth` vs client width
- `getBoundingClientRect()` for root, shell, header, brand, main, books grid and first card
- bottom nav: exact 3 labels, all visible in viewport, touch target height >=44px
- debug label hidden on mobile, theme correct, Category-first sidebar on desktop, selected sample category count
- PNG width/height match **CSS viewport**, not only `--window-size`

The run also exercises Thai Home search via CDP text input and Enter, filter favorites, category+favorite empty intersection, theme switching, and basic keyboard Tab/focus-visible.

**Scenes:** 320×720 (Home/Books), 360×800 (Books), 390×844 (Home/Books/Settings), 430×932 (Books), 768×1024 (Books), 1024×768 (Books), 1366×768 (Books light/night and Settings sepia), 1920×1080 (Books filtered). Three **CSS-width proxies** at 1093×614, 911×512, 683×384 approximate layout reflow under desktop zoom 125/150/200%; these are explicitly not browser-zoom verification.

**Browser gate status definition:**
- `PASS_BROWSER_SIMULATION_ONLY`: all scene metrics and interaction checks pass, each PNG matches requested dimensions. **Not device QA.**
- `FAIL`: any overflow, clipped element, viewport discrepancy, missing nav item, screenshot issue, or interaction failure. Process exits non-zero and preserves report.
- `NOT_TESTED`: build, actual Chrome/Edge run, browser zoom, real iPhone/iPad, Safari keyboard/touch/safe area remain open until verified.

`tests/responsive-checks.test.mjs` intentionally simulates bad overflow, clipped header/card, wrong viewport, clipped/incomplete nav, absent breakpoint behavior, wrong theme and filter. The acceptance code must detect these as FAIL.

## 3. Work performed and evidence

| Check | Status | What is actually verified |
|---|---|---|
| GitHub base / PR #208 | PASS (metadata) | #208 Draft/open, branch created directly from its HEAD |
| Desktop category-first source contract | PASS (in-process source check) | Source assertions against updated React/CSS |
| Synthetic pure responsive tests | PASS 7/7 (in-process JS) | Correct PASS fixture and deliberate FAIL fixtures |
| UI source contract suite | PASS 8/8 (in-process JS) | Updated content asserted without React DOM |
| Chrome CDP script syntax | PASS (V8 compilation) | Parses as JavaScript, no actual browser executed |
| Standalone CDP protocol smoke | PASS (Chromium 144 / Node 22 test container) | Minimal HTML with viewport meta: CSS innerWidth/clientWidth/visual viewport 390px and PNG 390×844. **Not the built React app.** |
| Theme text/button/focus token contrast | PASS (numeric token comparison) | White/primary button ratio ≥5.57:1; focus ring against light surface 5.32:1, sepia surface 6.44:1, night surface 7.45:1. Actual rendered UI/keyboard still OPEN. |
| Native Node 24 full source suite | **NOT TESTED** | Re-run on Windows |
| `npm ci` / TypeScript / Vite latest R3 build | **NOT TESTED** | Re-run on Windows |
| CDP browser PNG/viewport metrics | **NOT TESTED** | No live browser result yet; original PNGs were from R2 |
| Real browser zoom at 125/150/200% | **NOT TESTED** | CSS-width proxy does not replace this |
| iPhone/iPad Safari/PWA real-device QA | **NOT TESTED** | Owner acceptance required |

The locally npm-generated `package-lock.json` (166 entries, previously user-confirmed) **has not been committed to this branch**; do not generate a fake lockfile or claim a reproducible clean checkout until the real npm lockfile is committed to an appropriate isolated PR.

## 4. Windows runbook (no Production change)

```powershell
cd D:\wd-books-manual
git status --short
git fetch origin --prune
# Create a separate working branch only if it does not exist yet:
git switch -c test/react-responsive-r3 --track origin/fix/ui-mig02r3-mobile-responsive-25691030
# Existing local npm package-lock.json is untracked; keep it if it is the authentic npm-generated file.

cd docs\previews\ui-react
node --version  # expected v24.13.1 or other Node 24
node scripts\gate2-evidence.cjs
# The genuine npm-generated package-lock.json must already be present.
node scripts\gate2-evidence.cjs --install-build
node scripts\capture-responsive.cjs
```

Report and PNG location (unless overridden by `WD_UI_CAPTURE_DIR`):

`%TEMP%\wd-books-ui-mig02r3-captures\capture-report.json`

Important JSON fields: `status`, `cases[].status`, `cases[].requested`, `cases[].css_metrics.innerWidth`, `clientWidth`, `scrollWidth`, `visualViewportWidth`, `rects`, `nav`, `png`, `interaction.checks`. **Do not attach captured personal data or local browser profiles to the public PR**. This preview only uses a four-book sample catalog.

If the script exits 1, use the preserved JSON failures and the relevant PNG. Do not hide overflow with `overflow-x:hidden`. If the script is blocked before launch, record `NOT_TESTED`, the Node/browser error and the missing prerequisite.

## 5. Manual real device and accessibility gate

- **iPhone (Safari/PWA):** test 320/360/390/430-equivalent layouts on actual available devices; check real safe-area under home indicator, right-thumb access to 3 bottom items, portrait/landscape, text wrapping and search keyboard opening without obscuring controls.
- **iPad:** 768×1024 portrait, 1024×768 landscape, Split View resizing, category chips vs desktop rail at 1000px, category selection updates without searching below the fold.
- **Desktop:** zoom 125%, 150%, 200% in Chrome/Edge *manually*, tab order, focus-visible, theme contrast, long Thai title and zero-results state; compare with baseline desktop screenshots.
- **Production boundary:** only the isolated sample preview is under test. Reader, Flipbook #205, Audio/Podcast, bookmarks/favorites on real user devices, PWA/SW and the 27-book production catalog stay untouched. They cannot be signed off by this preview.

## 6. Merge dependency & continuation

Stack: **#173 → #207 → #208 → R3 Draft PR**. Do not retarget R3 to main or merge while R3's Browser and Real Device Gates remain OPEN. Keep production 1.3.73 unchanged. After Windows browser results, review JSON and screenshots first; adjust CSS/harness only against measurable failures and repeat the full matrix. Any subsequent catalog integration or production migration needs a separate approved workstream per [UI Stack Migration Plan](../../WD_BOOKS_UI_STACK_MIGRATION_TAILWIND_SHADCN_2569.md) and [Master UX Roadmap](../../WD_BOOKS_READER_UX_ROADMAP_2569.md).
