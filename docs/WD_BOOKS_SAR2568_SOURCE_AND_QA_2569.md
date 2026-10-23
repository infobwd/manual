# WD Books — SAR 2568 e-book publication candidate

**Source:** `ขั้นพื้นฐาน 68 บ้านวังด้ง.pdf` (SAR 2568, basic education, 76 PDF pages, source held in user file library).
**Book ID:** `sar-2568-basic-education` (permanent).
**Category:** `school-information` — สารสนเทศสถานศึกษา.
**Version:** WD Books 1.3.18 candidate.

Nine readable pages summarize **real self-assessment results** from the source: executive summary PDF pp. 5–7 (printed pp. 1–3) and strengths, development priorities and plans PDF pp. 47–49 (printed pp. 43–45). The e-book is a public-friendly summary, **not a full reproduction** of the SAR PDF and not an external evaluation.

Key source figures: standard 1 target 83/result 93.63; standard 2 target 81/result 96; standard 3 target 81/result 92.8; academic substandard target 81/result 88.25; desired characteristics target 85/result 99. Executive summary labels overall quality ยอดเยี่ยม. RT figures reproduced only as described, with no unverified test year.

**Privacy:** excludes private phone numbers, personal contact information, names and student-level data. This content PR does not upload the original PDF or copy the private PA repository.

**PWA:** only existing `assets/manuals-data.js` changed; it remains precached in `sw.js`. `assets/app-version.js` bumped so a fresh cache version can install; users retain update confirmation behavior and all `wd-manual-reader-v2` storage.

## QA pending
```powershell
node tests/js-syntax-gate.cjs
node tests/cat01-contract.smoke.cjs
node tests/library.smoke.cjs
node tests/pwa-reader.smoke.cjs
node tests/performance-baseline.cjs
```
Manual: confirm SAR category, search, nine-page Reader, offline reopening after update, old bookmarks/favorites unaffected, and no identifying data. Tests not run locally without computer. No automatic merge.

**Note:** SAR PDF original can be linked later only after approved public hosting and full-document privacy review.
