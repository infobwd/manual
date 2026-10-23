# CAT-01 — Catalog and content loading design (no-device planning)

**Status:** design only; no production behavior changes. ARCH-01E static/runtime measurements remain incomplete.

## Findings from current main
- `index.html` loads `assets/manuals-data.js` and `assets/wd-growth-individual-guide.js` as deferred scripts before `assets/app.js`. Both catalog and published guide content are available at initial app startup.
- `assets/wd-growth-individual-guide.js` mutates a catalog book by ID to supply the public published guide. Script ordering is therefore a compatibility dependency.
- `assets/app.js` still owns Reader DOM/interaction; catalog search/filter/sort and My Books selectors are extracted into independent modules.
- `sw.js` precaches both catalog and public guide scripts in `APP_SHELL`. Removing them from precache would change offline guarantees and must not happen without an explicit offline-content decision.
- Public repository and Pages must contain only public/synthetic material. Never expose learner records or private source content.

## Recommended incremental implementation (after measurement)
1. **CAT-01A: contract and fixture tests (no runtime changes).** Document stable book IDs, statuses, page structures, source ordering, public-only rules, and offline expectations. Add synthetic tests for empty/large catalog, unpublished book isolation, and missing content handling.
2. **CAT-01B: optional read-only catalog metadata boundary.** Build a deterministic in-memory view of published metadata; preserve all current filters and My Books ID lookup. No network requests, storage migrations or version bump unless runtime code changes.
3. **CAT-01C: candidate on-demand public content loader behind a safe fallback.** Only if measured startup bottleneck justifies it. Do not remove published book content from the offline shell until a new explicit offline policy is accepted. Reader must not open incomplete content; handle loading/error/retry in Thai and restore focus.
4. **CAT-01D: compare before/after.** Three cold and warm trials per device; Reader open latency, offline restart, memory where available, and existing saved state. Roll back if regressions or lost offline coverage.

## Compatibility gates
- Preserve `wd-manual-reader-v2` localStorage and all saved reading progress, favorites, bookmarks, theme and font settings.
- Preserve published/draft visibility, Thai search/sort, book IDs, deep links, focus management, PWA install/update flow.
- Avoid GitHub Actions and auto-merge. PRs remain separate and require explicit owner approval.
- Never claim lazy loading is faster before ARCH-01E real-device measurements.
- A mobile-only owner can review docs/PRs now; terminal benchmarks wait for Windows/VS Code access. iPhone manual checks may be collected separately without clearing site data.

## Next decision
Proceed with **CAT-01A tests/contract only**, or first gather ARCH-01E measured baseline. Defer behavior-changing lazy loading until baseline and offline acceptance.
