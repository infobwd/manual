# ARCH-01E — Performance & Offline Baseline (2569)

**Status:** measurement-only candidate; no production code or app-version change. Starting point: WD Books 1.3.17 after PR #59. Owner confirmed normal operation on their tested device, not a comprehensive cross-device/offline benchmark.

## Objective and guardrails
Measure cold/warm app launch, catalog interaction, memory, and offline reading **before** choosing CAT-01 lazy loading. Do not change `wd-manual-reader-v2`, clear storage, change book IDs, alter Service Worker strategy, or add remote analytics. No GitHub Actions.

## Repeatable local static baseline
From repository root on Windows VS Code terminal:

```powershell
node tests/js-syntax-gate.cjs
node tests/performance-baseline.cjs
node tests/library.smoke.cjs
node tests/pwa-reader.smoke.cjs
node tests/catalog-core.smoke.cjs
node tests/mybooks-selectors.smoke.cjs
node tests/reader-coordinator.smoke.cjs
```

`performance-baseline.cjs` reports raw asset bytes, shell item count and largest files. **Raw bytes are not transfer size, runtime memory or actual startup speed.** Copy terminal output into acceptance notes. Record failures explicitly; do not mark unrun tests PASS.

## Manual performance matrix (record numbers, do not estimate)
Test production URL `https://infobwd.github.io/manual/` and record exact version displayed, browser/OS, device, network and time. Repeat each scenario 3 times and record median plus min/max; avoid changing browser storage between trials.

| Scenario | How to measure | Record |
|---|---|---|
| Cold online start | Close tab/PWA fully, reopen with network; from navigation to visible, usable catalog | 3 durations (s), median |
| Warm start | Return to already cached PWA and reload normally | 3 durations (s), median |
| Search and category/sort | Enter Thai query, switch ready/upcoming, category, sort and reset | responsiveness, freezes, errors |
| Reader + My Books | Open published book, change page, close/reopen, resume, favorites, bookmarks | latency/functional PASS/FAIL |
| Offline restart | Visit once online and wait for SW install; switch device offline, relaunch PWA and open previously available book | app shell/book PASS/FAIL |
| Online restore | Restore connection; verify no missing book or user data | PASS/FAIL |
| Memory | Chrome/Edge desktop DevTools Performance/Memory where available; capture same navigation sequence | peak JS heap (MB), method, device |

iOS Safari does not expose the same JS heap measurements as desktop Chrome; write **not available** rather than inventing a figure. On iPhone use Safari and installed PWA separately when possible; on iPad and Android use the same checklist. Do not disable cache or clear site data to simulate a cold start: that would risk reader preferences.

## Acceptance / decision gate
- All listed local tests must pass or failures documented and fixed before claiming a clean baseline.
- Confirm no lost reading history, favorites, bookmarks, theme, font, progress or offline reading.
- Baseline must include measured cold/warm timings and offline results from at least one real device before any claim that lazy loading will improve performance.
- If baseline is incomplete, keep CAT-01 in planning; no speculative code changes or version bump.
- Decide CAT-01 scope only from measured largest assets, network behavior, and user experience. Keep public-only offline policy and private content exclusions.

## Record template
Date/time, commit SHA, app version, device/OS/browser, network, test command results, raw shell bytes, cold runs (3), warm runs (3), offline result, reader state retained, peak heap (if supported), notes and screenshots. Never attach private user data.
