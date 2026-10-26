# UI-MIG-00 — GitHub Read-only Baseline Audit (26 ต.ค. 2569)

**Parent:** [UI Stack Migration Plan](WD_BOOKS_UI_STACK_MIGRATION_TAILWIND_SHADCN_2569.md) · **Gate 0: NOT PASSED**

## Verified directly from main
- `assets/app-version.js`: `self.WD_BOOKS_VERSION = "1.3.47"` at inspection time; re-read before any production PR.
- `index.html`: legacy DOM-driven Home, search, library, My Books, settings dialog and reader dialog exist.
- `docs/WD_BOOKS_UI_MIG00_BASELINE_RUNBOOK_2569.md`: Gate 0 requires device screenshots, Node smoke logs and real measurements.
- `docs/WD_BOOKS_ARCH01E_PERFORMANCE_BASELINE_2569.md`: raw asset sizes are not performance timings; real device cold/warm/offline measurements required.
- `docs/WD_BOOKS_UI_STACK_MIGRATION_TAILWIND_SHADCN_2569.md`: target React/TS/Vite/Tailwind v4/shadcn/ui, parallel prototype only.

## Contract / risk register
| Area | Existing contract | Risk | Mitigation | Evidence status |
|---|---|---|---|---|
| Catalog | published-only public catalog, stable book IDs | accidental private exposure or ID changes | readonly adapter; public-only fixture | SOURCE REVIEW ONLY |
| My Books | `wd-manual-reader-v2` state | progress/favorites/bookmarks lost | no storage writes in preview; migration contract tests later | SOURCE REVIEW ONLY |
| Reader | legacy reader owns DOM, TOC, pagination | React/legacy double ownership | no React mount in reader | SOURCE REVIEW ONLY |
| Audio | Thai TTS, Now Playing, lock screen | media-session regression | no audio changes until real-device gate | NOT TESTED |
| PWA | `sw.js`, app-version, update waiting | scope/cache collision | standalone preview without manifest or SW | NOT TESTED |
| CSS | overlapping legacy styles, responsive overrides | specificity and preflight collision | standalone scoped preview | AUDIT INCOMPLETE |
| Accessibility | focus, Esc, contrast, touch targets | navigation regression | 44px targets, keyboard and VoiceOver checks | NOT TESTED |

## UX issues to compare in UI-MIG-01 (hypotheses, not verified defects)
1. Home hierarchy: make Continue Reading and search immediately visible.
2. Bookshelf: distinguish recent, favorites and bookmarks without excessive scrolling.
3. Settings: theme/font options clearer in a thumb-friendly sheet.
4. iPad portrait/landscape/Split View: responsive density without clipping.
5. Audio dock: avoid obstructing reading content when idle.

## Actual test status
| Check | Result | Reason |
|---|---|---|
| GitHub plan/runbook review | PASS | Read from main |
| Version file inspection | PASS | 1.3.47 in main at inspection |
| Node smoke suite | NOT TESTED | No local repository checkout / Node execution in this audit |
| Windows browser interaction | NOT TESTED | No local browser QA performed |
| iPhone Safari / installed PWA | NOT TESTED | No real-device evidence |
| iPad portrait / landscape / Split View | NOT TESTED | No real-device evidence |
| Audio lock-screen | NOT TESTED | No real-device evidence |
| Cold/warm/offline timings | NOT TESTED | No measurements |

## Gate decision
**Gate 0 remains OPEN.** This report is an interim audit, not acceptance. UI-MIG-01 may proceed as a static, isolated design concept only; no migration of runtime, Reader, Audio, SW or PWA is authorized. UI-MIG-02 must wait for Gate 1 and device/performance evidence.

Next: run the commands in UI-MIG-00 runbook on the Windows clone; capture screenshots and performance on actual devices; compare static Home/Bookshelf/Settings preview; request Gate 0/1 acceptance before framework proof of concept.
