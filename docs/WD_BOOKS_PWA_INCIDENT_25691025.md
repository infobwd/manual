# WD Books — Incident Report & Release Gate (25 Oct 2026)

Status: **User-confirmed recovered** on iPhone after PR #148. Scope: public GitHub Pages `/manual/` and installed iOS PWA.

## Incident timeline
- PR #144 published **AI & School Today** in `assets/manuals-data.js`.
- Safari / iPhone PWA showed catalog skeleton and failed to display manuals.
- PR #145 added load recovery; PR #146 added safe diagnostics. The user saw `MISSING: data · 1.3.30`.
- Source inspection found a **JavaScript syntax error** in the last page of the new AI book: `tip:"..."]` instead of `tip:"..."}`. This prevented `window.WD_LIBRARY_DATA` from being initialized. PR #147 fixed the syntax and added `tests/manuals-data-syntax.smoke.cjs`.
- A direct Safari URL with a diagnostic query displayed the repaired data, but the app still reported `MISSING: data`. The active Service Worker version remained `1.3.30`; its cache-first JS/CSS behavior could continue serving the earlier broken asset. This is the **strongly supported cache explanation**, not a separately proven network trace.
- PR #148 bumped cache version to `1.3.31` and checked for worker updates on startup. The user then confirmed the app works.

## Root cause and contributing factors
1. **Confirmed root cause:** malformed bracket in a manually edited JavaScript catalog object; the entire script failed to parse, so the app's bootstrap could not find `WD_LIBRARY_DATA`.
2. **Recovery delay / contributing factor:** Service Worker cached a previous JavaScript app shell under the unchanged version. A code fix without cache-version rollover may not reach existing PWA sessions promptly.
3. **Testing gap:** publishing the catalog was not gated on JS parsing and runtime catalog smoke checks. Existing `tests/library.smoke.cjs` also assumed hardcoded counts (7 categories, 7 manuals, 2 published) although the current catalog has 8 categories, 14 manuals and 8 published at this incident review.

## Required release gate (before every catalog or PWA merge)
1. Run `node tests/manuals-data-syntax.smoke.cjs` to parse the **entire** `assets/manuals-data.js`, check metadata, unique IDs, and the AI guide's 13 pages.
2. Run `node tests/library.smoke.cjs` and any related smoke tests. Do not use fixed catalog totals as permanent assertions; check invariants or explicitly reviewed snapshots.
3. Verify a new/changed book has valid page structure, category, publication status, and no private student data, credentials or answer keys.
4. If any cached shell asset changes (especially `manuals-data.js`, `app.js`, CSS, or HTML), **bump `assets/app-version.js` in the same PR** so a new Service Worker cache is installed. Review `sw.js` install asset list and update-consent behavior.
5. After merge, confirm GitHub Pages serves the updated catalog; test iPhone Safari and installed PWA, accept any app update, then check categories, book cards, reading, favorites, progress, and offline fallback where practical.
6. For a blank/skeleton home, capture the `homeRecoveryDiagnostic` code and version; diagnose script parse/load first, then cached-worker mismatch. Never instruct users to delete the PWA or clear site data as the first step.
7. Keep GitHub Actions optional under the project's Local-First policy; execute the Node smoke commands locally in Windows/VS Code before merging.

## Non-destructive recovery runbook
- Observe code/version (e.g. `MISSING: data · 1.3.30`).
- Inspect `assets/manuals-data.js` and run the syntax smoke test.
- Compare source with the public URL `https://infobwd.github.io/manual/assets/manuals-data.js?diagnostic=<release>`.
- If source is fixed but an installed client remains broken, bump cache version, ship a complete app shell, allow worker update detection and explicit user approval; then reopen the app.
- **Do not clear localStorage** (`wd-manual-reader-v2`), reading progress, favorites, history, bookmarks, or reinstall the app unless a later separately diagnosed problem makes it necessary.

## Related PRs
- #144 book publication
- #145 home recovery
- #146 diagnostics / cache consistency
- #147 syntax repair and regression test
- #148 cache rollover to 1.3.31 (user-confirmed recovery)

## Follow-up
- Confirm Node smoke tests on Windows (not executed by this GitHub-only documentation update).
- Consider an explicit release checklist/validation script that fails on invalid catalog syntax or missing version bump.
- Review existing open UX/content PRs independently; this incident does not imply those PRs are merged or complete.
