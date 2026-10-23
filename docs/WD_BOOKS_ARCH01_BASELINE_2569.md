# ARCH-01 — Baseline and Safe Modularization Contract (23 ต.ค. 2569)

## Current acceptance and scope
- Owner confirmed UX-DISCOVERY P3 (v1.3.13 / PR #53) PASS on device. Close P3 only; do not infer all-device or offline regression PASS.
- Next execution queue: ARCH-01. **This PR is a documentation + local parser gate only**. No production JavaScript or localStorage changes.
- Current entrypoint: `index.html` loads `app-version.js`, `manuals-data.js`, `wd-growth-individual-guide.js`, `experience.js`, then `app.js`. SW `APP_SHELL` lists cached scripts. Keep that order until a separately tested PR replaces it.
- Current `assets/app.js` is an IIFE coordinating Catalog, My Books, Reader, events and state. Split incrementally; no big-bang conversion to ES modules.

## Nonbreaking contracts
1. Keep public book IDs, catalog status and published-only reader behavior unchanged. No unpublished page content exposed.
2. Keep `wd-manual-reader-v2` localStorage data, reading progress, history, favorites, bookmarks, theme and typography compatible.
3. Preserve DOM IDs, keyboard navigation, reader dialog, search/highlights, status/category/sort filters and empty-state reset.
4. Maintain a single static GitHub Pages PWA and SW offline app shell; update SW cache list and app version together when production assets change.
5. No student data, private manuals, accounts, server, GitHub Actions, or remote tracking.

## Small-PR sequence
- **ARCH-01A (this PR):** record contracts and add `tests/js-syntax-gate.cjs` to catch parser regressions. No runtime changes.
- **ARCH-01B:** extract pure catalog search/filter/sort helpers to `assets/catalog-core.js`, test behavior, load before `app.js`, add to SW, fallback only if appropriate. Do not change reader.
- **ARCH-01C:** extract DOM catalog rendering/event wiring with identical IDs and accessible states. Snapshot tests and device check.
- **ARCH-01D:** isolate My Books / reader coordination only after earlier gates PASS; preserve localStorage.
- **ARCH-01E:** measure initial load, memory and offline behavior before deciding CAT-01 lazy loading.

## Required gates per production PR
- `node tests/js-syntax-gate.cjs` PASS, `node tests/library.smoke.cjs`, `node tests/pwa-reader.smoke.cjs` PASS where harness supports current DOM; fix harness rather than skipping a failing test.
- Manual iPhone Safari/PWA and Android/iPad smoke: home catalog, ready/upcoming, sort, query/reset, open/read, bookmarks, resume, light/night/sepia, offline/online.
- On failure, revert only the latest module PR and restore prior script order/cache; do not clear user storage.
- Merge only after explicit approval; never equate merge with device QA.
