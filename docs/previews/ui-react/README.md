# UI-MIG-02 isolated framework spike

This is an **isolated React 19 / TypeScript / Vite / Tailwind v4 preview**, using shadcn-style Button/Card primitives. User-reported Windows `npm ci`, `npm run build`, built-path checks and initial Chrome screenshots **PASS on 30 Oct 2026**. Later source changes (Bookshelf direct QA links and seven-view capture) need a new local build/screenshot run before visual acceptance. No real catalog, storage, Reader, Audio, SW or PWA integration; **not merged or deployed**.

## Windows Gate 2 evidence — confirmed 30 Oct 2026

The user supplied Windows Terminal screenshots from `D:\wd-books-manual\docs\previews\ui-react` confirming:

| Item | User terminal outcome |
|---|---|
| `node scripts/gate2-evidence.cjs` native source tests | PASS |
| `node scripts/bootstrap-lockfile.cjs` | PASS — genuine npm lockfile with **166 entries** |
| `node scripts/gate2-evidence.cjs --install-build` | `npm ci` **PASS**, TypeScript/Vite **PASS**, Vite dist nested-path contracts **PASS** |
| Initial `node scripts/capture-responsive.cjs` | `CAPTURED` **4/4**: phone 390×844, tablet 1024×768, desktop 1366×768, desktop 1920×1080 |
| Real iPhone/iPad and visual inspection of PNGs | **NOT TESTED** — the terminal screenshots do not contain the captured UI images |

**Important:** The first screenshot script captured the **Home** view at four viewports, not the Category-first Bookshelf. This branch now includes a second-pass capture script (seven cases) and a QA-only URL state parser in the React sample. **The new seven-case script has not been run on Windows yet.** Do not call Visual Gate PASS until actual new PNGs are inspected. Source contracts for the updated preview and screenshot matrix passed **7/7 in a JavaScript harness**, not a fresh Windows Vite build.

Node.js v24 printed `DEP0190` because of shell commands with separate arguments; the updated npm wrappers now pass **fixed commands without a separate arguments array** on Windows, but this adjustment awaits a Windows rerun. Original `package-lock.json` exists **only in the user's local checkout** (not yet committed to Draft PR #208).

### Second-pass Windows QA (existing local `test/react-category`)

```powershell
cd D:\wd-books-manual
git switch test/react-category
git status --short
git pull --ff-only
cd docs\previews\ui-react
# Lockfile already generated locally — DO NOT run bootstrap-lockfile again.
node scripts\gate2-evidence.cjs --install-build
node scripts\capture-responsive.cjs
```

Expected new captures under `%TEMP%\wd-books-ui-mig02-captures` include `phone-books-390x844.png`, `tablet-books-1024x768.png`, `desktop-books-1366x768.png`, `desktop-books-night-1366x768.png`, and `desktop-category-1920x1080.png`. The script verifies React's Bookshelf is mounted before capture, and reports actual PNG dimensions alongside requested sizes; `CAPTURED_SIZE_REVIEW` means the browser produced a different image size. **Capturing images is not visual acceptance.**

For manual review after a successful Build, run `npm run preview`, open the local URL printed by Vite and use preview-only URLs:
- `/?view=books` — category-first Bookshelf
- `/?view=books&theme=night` — Bookshelf night theme
- `/?view=books&category=งานบริหาร` — category filtering
- `/?view=settings&theme=sepia` — sample typography/sepia

None of these URL parameters store state or access production. The tracked `docs/previews/ui-react/.gitignore` excludes `node_modules/` and `dist/`; it deliberately does **not** ignore `package-lock.json`.

## Windows workflow from the existing WD Books clone — 30 Oct 2026

**Previous gate:** FLIP-14 Node regressions 18/18 PASS (user confirmed on Windows after pagination fix). This next task is a **separate isolated React preview** and does not alter Production or Reader.

```powershell
# Stop any FLIP-14 localhost server with Ctrl+C first.
cd D:\wd-books-manual
git status --short
git fetch origin --prune
git switch -c test/react-category --track origin/feat/ui-mig02-category-first-r1-25691029

cd docs\previews\ui-react
# Native Node source tests: no npm installation yet
node scripts\gate2-evidence.cjs

# First-time only: create a REAL npm lockfile from the registry
node scripts\bootstrap-lockfile.cjs

# Reproducible install, typecheck, Vite build, and built asset-path contracts
node scripts\gate2-evidence.cjs --install-build

# Visual preview (only after a successful build)
npm run preview

# Optional: in a separate Terminal after stopping preview, take browser screenshots
# (uses installed Chrome or Edge; no Playwright dependency)
node scripts\\capture-responsive.cjs
```

**Windows browser:** open the `http://127.0.0.1:4173/` URL printed by Vite (the printed port is authoritative). Test Home → Bookshelf, searching in Thai, favorite/category combinations, light/sepia/night themes, desktop ≥1000px left rail, iPad/mobile chips, browser zoom 200% and keyboard navigation. **This preview is sample-only**, not connected to WD Books actual published catalog (currently 27 books) or user preferences.

**Screenshot QA tool (added):** `node scripts\\capture-responsive.cjs` serves the isolated Vite `dist/` on `127.0.0.1` only, checks that React actually mounted, and saves four Chrome/Edge screenshots (390×844, 1024×768, 1366×768, 1920×1080) plus a JSON report in `%TEMP%\\wd-books-ui-mig02-captures`. Set `CHROME_BIN` if Chrome is not found; set `WD_UI_CAPTURE_DIR` to choose a different directory. This is **desktop Chrome viewport simulation**, not a real iPhone/iPad, safe-area, touch or PWA/offline test. Screenshots are not automatically committed into GitHub. If this script fails, retain its error text and do not mark browser QA PASS.

**Artifacts/evidence:**
- New lockfile: `docs/previews/ui-react/package-lock.json`, **generated by npm** and intended for review/commit to the isolated PR branch; do not edit it manually.
- Report: `%TEMP%\wd-books-ui-mig02-gate.json` (or `WD_UI_GATE_REPORT`).
- If `npm` fails, preserve error details and send the Terminal output; **do not invent a lockfile or report Build PASS.**
- Do not merge #173 → #207 → #208 or alter service worker/version when checking this preview.
- The browser/device/production integration gate remains **OPEN** even if source tests + npm Build + dist contracts pass.

**Git note:** `test/react-category` is a local test branch based on Draft PR #208. Keep `package-lock.json` and `node_modules` isolated to `docs/previews/ui-react`. If a version of this branch already exists locally, switch to it and run `git pull --ff-only` rather than creating a second branch.

## Local Windows steps

```powershell
cd docs\previews\ui-react
npm install
npm run build
npm run dev
```

Open the local Vite URL shown in the terminal. For a reproducible PR, **commit package-lock.json generated by npm** before accepting Gate 2. Then use `npm ci` on a clean checkout and repeat build. No CDN or backend is needed at runtime.

## TDD slice: Thai catalog filtering (stacked candidate)

A separate candidate branch `feat/ui-mig02-tdd-catalog-25691029` extends the source-only PR #173 branch. It adds a typed, pure `src/catalog-filter.ts` helper, imports it from the existing React preview, and uses **Node native tests** without adding npm dependencies.

```powershell
cd docs\previews\ui-react
node --version   # tested locally with v22.16.0
npm run test:catalog
# or: node --experimental-strip-types --test tests/catalog-filter.test.mjs
```

**29 Oct verification, local container (isolated 2-file copy):** first the tests failed with `ERR_MODULE_NOT_FOUND` before the helper existed; then a temporary *old-style filter* with no query trimming produced a semantic RED failure on `trim surrounding whitespace in Thai queries` (expected `teacher`, got `[]`). Restoring the committed fixed helper produced GREEN. After adding the helper, `node --experimental-strip-types --test tests/catalog-filter.test.mjs` passed **8/8 tests (GREEN)**. `tsc --strict --noEmit --target ES2022 --module ESNext --moduleResolution Bundler src/catalog-filter.ts` passed. Covered Thai leading/trailing whitespace, case-insensitive English, exact category, favorites, composing filters, empty result and unchanged input array.

**Evidence boundary:** This is a local execution of the pure helper and its test file, not `npm ci`, `npm run build`, React rendering, installed PWA or iPhone/iPad QA. Full React Gate 2 remains OPEN. This candidate's tests can run without fetching packages, but the full app build still requires a committed lockfile and installable npm dependencies.

## UI-MIG-02R2: category-first visual candidate (stacked branch)

Branch `feat/ui-mig02-category-first-r1-25691029` builds on TDD PR #207 / source PR #173, **not** `main`. This is a sample-data-only **React candidate** to evaluate against UI-MIG-01R2 static design in Draft PR #206:

- Desktop ≥1000px: sticky category rail left and searchable/favorites-filtered cards right (no scroll jump after choosing a category).
- Phone/iPad: category chips above results, with 44px+ targets and flexible content.
- Home search: submit via Enter or Search; typing does not navigate away. Search field gets focus on Bookshelf after submit.
- Click Home category: reset old query/favorites; show that category.
- Preserve theme modes, font size sample, bottom navigation, `aria-pressed`, live count and empty-state status.
- `src/main.tsx` was refactored for readable React source; `filterCatalog` stays a pure helper.

### Tests

```powershell
cd docs\previews\ui-react
npm run test:preview
```

The command runs native Node 22 tests for catalog search and UI source contracts **without additional npm dependencies**. In this chat, V8 execution of the five new source-contract test bodies passed 5/5; actual local Node catalog tests from the parent branch passed 8/8. The tests do not assert rendered React DOM or CSS screenshots.

**Explicitly NOT TESTED:** `npm ci` / `npm run build` (missing dependency lockfile and registry connectivity), React runtime/TypeScript full-project build, nested-path preview, real iPhone/iPad/desktop and accessibility checks. Gate 0/1/2 remain OPEN; NO MERGE to main or production. Test React visually against [UI-MIG-01R2 preview](../ui-next/index.html) after those gates.

## Gate 2 reproducible evidence command (Windows/Node 22)

```powershell
cd docs\previews\ui-react
# No installation required: runs native catalog + UI source tests and records blocked gates
node scripts\gate2-evidence.cjs
# After package-lock.json is generated/reviewed and npm registry is reachable:
node scripts\gate2-evidence.cjs --install-build
```

- Reports are written to the OS temporary folder as `wd-books-ui-mig02-gate.json` (or to `WD_UI_GATE_REPORT` when specified). A missing lockfile is marked **NOT_RUN** in source-only mode and **FAIL** if a full build was requested.
- This tool invokes `npm ci` then `npm run build` only with explicit `--install-build`. It runs in the isolated preview directory and never changes the production WD Books app.
- In this workspace on 29 Oct 2026, `npm install --package-lock-only --offline` **failed with ENOTCACHED** for `@radix-ui/react-slot`. The absence of registry access makes a reproducible lockfile and full build **NOT RUN**, not PASS. The earlier actual Node helper tests pass 8/8; UI-source contract bodies pass 5/5 in V8 source harness. Runtime render and iOS/iPad device QA are still required.
- Lockfile must be generated by npm from the real `package.json`, committed and independently checked. Do not fabricate lockfile or mark Gate 2 accepted from a V8/TypeScript-only check.

## Gates

- Source review: isolated root, no service worker, no localStorage writes, relative Vite base, static sample catalog.
- Build / TypeScript / npm audit / package-lock: **NOT TESTED** (no Windows runner executed here).
- iPhone, iPad, desktop keyboard/focus and visual comparison: **NOT TESTED**.
- GitHub Pages subpath and offline behavior: **NOT TESTED**.
- Gate 0/1 evidence and owner sign-off still need recording; Gate 2 cannot pass on source review alone.

This candidate is deliberately **not merged** or shipped to production. A built static artifact, dependency lockfile, accessibility checks and approval are required before considering further integration.
