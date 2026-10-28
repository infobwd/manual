# FLIP-14 — Public catalog parity + SAR charts in Flipbook (29 ต.ค. 2569)

**Status:** implementation in isolated PR; **NOT MERGED, NOT DEPLOYED**. Production still v1.3.68 until separate release decision.
**Parent:** [WD Books Master UX Roadmap](WD_BOOKS_READER_UX_ROADMAP_2569.md). No new roadmap.
**Safety:** No book IDs, source content, reader storage, audio, host PWA service worker, or published/draft rule changed.

## Confirmed root causes
1. `index.html` loads `manuals-data.js` plus three published-book enrichment scripts. The nested `corner.html` loaded only `manuals-data.js`. Therefore books such as **เตรียมรับนิเทศเปิดภาคเรียน 2** were visible on the shelf but missing inside the Flipbook iframe.
2. Shared `flipbook-capability.js` blocked two SAR books with `chart` / `insight` because their fields were not rendered.
3. The authoritative **runtime** catalog after all four scripts is **23 titles, 18 published** (not the earlier base-file-only 21/15 snapshot).

## What this branch changes
- Load the exact same three *public-only* enrichment scripts before the Flipbook capability gate; retain duplicate-ID guard inside each source script.
- Permit only both SAR chart kinds already supported by legacy Reader: `target-result` and `year-comparison`; validate row labels, two numeric values 0–100, optional pair of legend labels, permitted properties and insight shape.
- Render chart rows as actual visible bars **with explicit text values**, accessible chart titles, both comparison labels, and an atomic page-fit check. Rows continue onto additional physical pages rather than silently clip or drop content.
- Render SAR insight headline, primary and detail text in the same source order as Reader. Existing text, bullets and tip remain unchanged.
- Preserve fail-closed fallback to Reader for future unsupported schema, failed layout, offline or audio. Parent `WD_FLIP_CAPABILITY` and iframe must agree.

## Verification recorded
- Connector-side pure JavaScript data checks: 18/18 published eligible, SAR 4 chart-bearing pages and 5 insight-bearing pages; unknown chart kinds, invalid numerical percentages, extra private fields, and unpublished books denied.
- `new Function` parsed the updated child JavaScript successfully.
- Added `tests/flipbook-sar-parity.smoke.cjs` (Node; **NOT RUN in repository environment**), and updated the two historical 13/15 assertions to 15/15. Do not confuse these code checks with DOM browser/device QA.

## Execution checkpoint — 29 ต.ค. 2569

**PASS (in-chat V8 source execution, not physical Node/Browser):**
- Fetched current PR branch sources from GitHub and executed all 4 public catalog scripts plus strict flipbook gate in a JavaScript V8 isolate: **30/30** validation checks PASS.
- Verified complete runtime data set **23 total / 18 published / 18 eligible**; 4 SAR chart-bearing pages, 5 insight-bearing pages, distinct IDs, and denial of unpublished/unknown/malformed data.
- Executed unchanged test assertions from `flipbook-sar-parity.smoke.cjs`, updated `flipbook-default-paper.smoke.cjs` and `flipbook-close-book-label.smoke.cjs` using a lightweight `fs/vm/assert` compatibility shim against the live branch sources: all 3 test bodies PASS.
- This does **not** count as actual `node tests/...` execution or automated browser screenshot/real-device acceptance. The browser pagination, chart clipping, iPhone/iPad/PWA and full regression gates remain **NOT TESTED**.

**Risk / release:** draft PR only. No version bump, merge or production deployment authorised by these checks alone.

## SAR exact-value regression checkpoint

Added `tests/flipbook-sar-values.smoke.cjs`, a golden content guard for both published SAR reports: **4 chart groups, 13 exact public metric rows and 5 insight headlines**. It compares the names and target/result percentages against the published source and checks that Flipbook still renders chart/insight branches and explicit textual percentage labels.

V8 execution of the complete test body against live branch sources through a `fs/vm/assert` compatibility shim: **PASS**. Do not label this as actual Node execution or visual page QA. Run `node tests/flipbook-sar-values.smoke.cjs` locally along with all regression tests before merge; compare chart figures to original Reader in desktop/iPad screenshots. No actual SAR figures were edited.

## FLIP-14 follow-up — prevent the next missing-book regression

**New dependency-free gates in the draft PR (29 Oct 2026):**
- `tests/flipbook-module-manifest.smoke.cjs` reads `index.html`, finds the **entire book-source script block** between `manuals-data.js` and `experience.js`, verifies the Flipbook iframe loads the **same source files in the same order**, and checks that each is cached by `sw.js`. It also checks unique IDs, public statuses, and current 18/18 capability after evaluating the scripts.
- `tests/wd-books-flip14-gate.cjs` orchestrates **18 existing/new Node smoke/behavior files**, returns a non-zero exit code if any fail, and saves per-test logs plus a machine-readable report to the OS temp directory (or an explicitly set `WD_QA_REPORT` path). It marks **device/browser QA = NOT_TESTED**, never "PASS" based on static checks.

```powershell
# From an actual local clone with Node >=22
node tests/flipbook-module-manifest.smoke.cjs
node tests/wd-books-flip14-gate.cjs
# Optional custom report path:
$env:WD_QA_REPORT = "$env:TEMP\wd-books-flip14-qa.json"
node tests/wd-books-flip14-gate.cjs
```

**Evidence in this chat:** the module-manifest test body was executed against live branch text using a JavaScript-compatible harness and **PASS** (4 book-source scripts, 23 catalog titles, 18 published, 18 eligible); the runner's JavaScript syntax parsed and its **18 listed test filenames** were verified present. The 18-file runner itself has **not** been run against a local checkout and must not be marked passed until command logs exist. Browser visuals and real-device QA remain open.

## Windows Node 24 field report — 29 Oct 2026

**User Windows baseline (before fixes):** `node tests/wd-books-flip14-gate.cjs` on Node **v24.13.1** returned **13/18 PASS**, 5 FAIL. User supplied exact error output from `%TEMP%\wd-books-flip14-node-gate.json`.

| Failed test | Observed issue | Fix in this PR |
|---|---|---|
| `flipbook-sar-values.smoke.cjs` | `deepStrictEqual` rejected visually identical nested arrays created in a foreign `vm` realm | Normalise plain data via JSON round trip for exact value comparison |
| `flipbook-corner.smoke.cjs` | `deepStrictEqual` rejected cross-realm page arrays | Compare `Array.from(...)` to host arrays |
| `pwa-reader.smoke.cjs` | Legacy fake document returned `null` for `.reader-stage`; old 7-item fixture and removed close-thumb target | Replace with executable current `assets/experience.js` integration test: full 4-module public catalog (23/18), favorites, bookmarks, progress/history, persisted Continue callback, native Reader pull-refresh gating. Also check `app.js` binding contracts. **Does not claim to simulate actual Reader DOM/UI** |
| `audio-reader-integration.smoke.cjs` | Hard-coded version `1.3.42` while release was `1.3.68` | Validate shared version contract between HTML, Service Worker and app-version script, independent of future number |
| `library.smoke.cjs` | Legacy DOM fixture lacked `window.addEventListener`; assumed old layout | Replace with public runtime `catalog-core.js` + `catalog-ui.js` + `mybooks-selectors.js` checks for 23/18 source content, search/reset/filter, rejected unpublished reading, bookmarking and bridge contracts. **Does not claim a full Reader UI test** |

All five revised test bodies were evaluated against the branch's source in a JS compatibility harness: **5/5 PASS**. This is preliminary source/runtime simulation; **not a confirmed full Windows Node execution**. The tests only change QA files, not current production Reader, Service Worker, content or release version.

### Windows retest (pending)

```powershell
cd D:\wd-books-manual
git status --short
git pull --ff-only
node tests/wd-books-flip14-gate.cjs
```

Only consider the Node regression gate **PASS** if the command prints **18/18 PASS**, the saved report has `fail: 0`, and Windows exit code is 0. Any remaining failure requires real stderr analysis. Device/browser and SAR visual page-fitting QA remain **NOT TESTED**, even if Node passes.

## Required QA before merge / version bump
1. `node tests/flipbook-sar-parity.smoke.cjs`, `node tests/flipbook-default-paper.smoke.cjs`, `node tests/flipbook-close-book-label.smoke.cjs`, `node tests/flipbook-corner.smoke.cjs` and complete prior FLIP-08–13 suites: report actual logs.
2. On iPhone Safari + installed PWA: open **เตรียมรับนิเทศเปิดภาคเรียน 2**, WD Growth individual plan and PLC guide through shelf and verify every chapter, previous/next, bottom close, classic mode and audio handoff.
3. On iPad portrait/landscape and Desktop 1366/1920: open both SAR reports, check **4 chart pages and 5 insights** visibly preserve all original target/result numbers; flip page, change font 90/160%, themes light/sepia/night, rotate/resize and return to chart position. Pay special attention to chart-row clipping.
4. Verify access denied for draft, PDF/source-private data does not appear, and future unknown page schemas fall back without losing chart or text. Confirm offline Reader is unchanged.
5. Compare reader chart and flipbook chart row-by-row; pass only if labels and values match. Record PASS/FAIL/NOT TESTED with device and screenshot.
6. Immediately before approved production merge: rebase onto latest `main`, pick next collision-free PWA version, update version in `assets/app-version.js`, splash, SW, iframe query assets and tests; retest PWA update. Do **not** reuse v1.3.68 for deployed code.

**Acceptance:** Do not claim all 18 titles are visually ready until tests and device/browser QA PASS. Rollback = revert isolated FLIP-14 commit/PR without clearing `wd-manual-reader-v2`.
