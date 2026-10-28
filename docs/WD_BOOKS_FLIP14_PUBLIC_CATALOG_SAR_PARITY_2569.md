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

## Required QA before merge / version bump
1. `node tests/flipbook-sar-parity.smoke.cjs`, `node tests/flipbook-default-paper.smoke.cjs`, `node tests/flipbook-close-book-label.smoke.cjs`, `node tests/flipbook-corner.smoke.cjs` and complete prior FLIP-08–13 suites: report actual logs.
2. On iPhone Safari + installed PWA: open **เตรียมรับนิเทศเปิดภาคเรียน 2**, WD Growth individual plan and PLC guide through shelf and verify every chapter, previous/next, bottom close, classic mode and audio handoff.
3. On iPad portrait/landscape and Desktop 1366/1920: open both SAR reports, check **4 chart pages and 5 insights** visibly preserve all original target/result numbers; flip page, change font 90/160%, themes light/sepia/night, rotate/resize and return to chart position. Pay special attention to chart-row clipping.
4. Verify access denied for draft, PDF/source-private data does not appear, and future unknown page schemas fall back without losing chart or text. Confirm offline Reader is unchanged.
5. Compare reader chart and flipbook chart row-by-row; pass only if labels and values match. Record PASS/FAIL/NOT TESTED with device and screenshot.
6. Immediately before approved production merge: rebase onto latest `main`, pick next collision-free PWA version, update version in `assets/app-version.js`, splash, SW, iframe query assets and tests; retest PWA update. Do **not** reuse v1.3.68 for deployed code.

**Acceptance:** Do not claim all 18 titles are visually ready until tests and device/browser QA PASS. Rollback = revert isolated FLIP-14 commit/PR without clearing `wd-manual-reader-v2`.
