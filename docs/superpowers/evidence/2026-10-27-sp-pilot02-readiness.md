# SP-PILOT-02 — Execution readiness and source review
Date: 2026-10-27
Repository: infobwd/manual
Candidate PR: #173 (88f681168b8c08bcf26d8c77ce963e2fc488c802)
Planning PR: #180 (docs only)
Main: 75ec0f4ee4fff7afd7e2ea6d4d108f90555427af

## What was actually attempted
- Re-fetched PR #173, PR #180 and main metadata using the connected GitHub API: both PRs OPEN, PR #180 Draft.
- Read PR #173's full src/main.tsx, package.json, index.html and vite.config.ts.
- Checked local execution runtime: Node v22.16.0 and npm v10.9.2 available.
- Attempted `git ls-remote https://github.com/infobwd/manual.git HEAD` in local container: **FAILED** with `Could not resolve host: github.com`. Therefore no clean checkout or npm registry resolution was established; npm install, npm ci, npm run build, automated tests and real-device QA were **NOT RUN**. No success claim is justified.

## Source findings, not runtime results
1. [IMPORTANT] `package-lock.json` is absent in PR #173. `npm ci` cannot be treated as reproducible until an approved branch adds a generated lockfile and proves a clean install.
2. [IMPORTANT] No test runner/test script or component tests are declared in `package.json`; TDD RED/GREEN evidence does not exist yet.
3. [IMPORTANT] `src/main.tsx` renders all views in one compressed component, making isolated behavior testing and maintainability harder. Prefer small refactor only after tests.
4. [MINOR] Search uses `toLocaleLowerCase("th")` but does not trim query; leading/trailing whitespace may produce unexpected no-results. Define expected behavior and add a failing test before any fix.
5. [MINOR] Navigation resets query and favorites on each view switch; this is current behavior, not necessarily a defect. Confirm UX expectation in tests before changing.
6. [CHECK] `index.html` uses absolute dev module entry `/src/main.tsx`, while Vite build config has relative base `./`. This is common for Vite source; verify actual built asset paths under a nested path instead of classifying it as failure.
7. [SOURCE PASS ONLY] The React preview uses local component state and sample catalog; no storage or service worker code is visible in inspected source. Production integration remains outside scope.

## First test-first slice when execution becomes available
- Install dependencies on a clean isolated worktree/branch; record npm version, lockfile and build logs.
- Select Vitest + React Testing Library only after checking dependency compatibility; add a `test` script in the isolated preview.
- RED test: entering Thai query `  คู่มือครู  ` should return the matching sample book (if trim-normalization is approved); capture failing exit status.
- GREEN: minimal query normalization only; rerun focused test.
- REFACTOR: extract pure catalog filtering helper with no behavioral changes; rerun full tests.
- Next tests: no-result status, favorites filtering, theme pressed state, navigation reset behavior.
- Verify `npm ci`, `npm run build`, nested-path static preview and existing PWA smoke tests.
- Run real iPhone/iPad tests separately; never label browser emulation as device PASS.

## Gate decision
SP-PILOT-02 = BLOCKED FOR EXECUTION in this runtime due to GitHub DNS access. Source review complete; automated build/TDD/device evidence NOT RUN. No production changes, no code changes, no merge.

---

## 29 Oct 2026 — SP-PILOT-03 TDD follow-up (branch PR #207)

**Scope:** Isolated `docs/previews/ui-react/` code ONLY, based on PR #173's own head; no changes to Production `main`. Stacked Draft [PR #207](https://github.com/infobwd/manual/pull/207) is not merged into PR #173 or Production.

**Executed on local Node v22.16.0, npm v10.9.2, and global TypeScript (pure module):**
- Created an eight-case Node-native test `tests/catalog-filter.test.mjs` for Thai whitespace, English case, title/category search, favorites, exact category matching, composed filters, empty/no-match and immutable input.
- **Semantic RED confirmed:** temporary copy of PR #173's former no-trim query behavior caused `trim surrounding whitespace in Thai queries` to fail (expected one book, actual empty result; process exit 1). This was a local fixture, never deployed.
- **GREEN confirmed:** committed `src/catalog-filter.ts` passed **8/8 tests**, process exit 0 using `node --experimental-strip-types --test tests/catalog-filter.test.mjs`.
- **Standalone TypeScript PASS:** `tsc --strict --noEmit --target ES2022 --module ESNext --moduleResolution Bundler src/catalog-filter.ts` exited 0.
- Existing React `src/main.tsx` now consumes `filterCatalog(books,{query,favoritesOnly})`; optional `category` input is available for a later approved category-first UI but is not yet exposed by React buttons. Node native tests do not verify React rendering.

**Blocked/not run:** `npm ci`, `npm run build` (missing lockfile and npm dependencies in execution environment), Vite nested base, React DOM and real-device/browser QA. Gate P2/P3/P4 and overall Gate 2 **OPEN**. This evidence must never be interpreted as React Build PASS.

**Next steps:** Commit a generated lockfile and capture clean npm ci/build output when network-enabled; add React component tests as a separate task and compare Desktop Category-first UX with Draft PR #206. Maintain no new GitHub Actions or changes to real Reader/PWA data.

---

## 29 Oct 2026 — SP-PILOT-04 responsive React UI candidate

**Stacked design candidate:** Draft [PR #208](https://github.com/infobwd/manual/pull/208), based on TDD PR #207 (based on PR #173). Separate from the HTML/CSS-only design PR #206 and Production main.

- React preview adds Desktop category rail (≥1000px) beside live search/results, with mobile category chips.
- Home's search uses an explicit form submit to avoid navigating during typing. A category shortcut resets unrelated search/favorites state.
- Accessible labels, `aria-pressed` categories, `aria-live` result count, empty status and visible search focus are in the source.
- Five Node-native source-contract tests were executed using a JavaScript compatibility harness against live branch text: **5/5 PASS**. Parent helper remains Node **8/8 PASS**. Those test results are **source-level**, not browser/React-rendered UI acceptance.
- Container has Node v22.16.0 and Chromium 144, but GitHub/npm registry DNS unavailable. Full React dependencies/lockfile/build and source checkout for real browser snapshots are still **NOT TESTED**. Do not report Gate P2/P3/P4 or UI-MIG Gate 2 as PASS.

**Dependency chain:** #173 → #207 → #208; #180 documents pilot evidence; #206 is the independent design target. Keep stacked PRs Draft and unmerged until build and visual acceptance.

---

## 29 Oct 2026 — SP-PILOT-05: reproducible offline gate helpers

**Live Draft candidates and their dependency order:** #173 (source) → #207 (pure typed catalog/TDD) → #208 (responsive React category-first). Independent #206 is the HTML-only visual design target. All remain unmerged.

- In #208, added `scripts/gate2-evidence.cjs` (Node built-ins only) to execute both preview-native tests and produce a machine-readable gate report in OS temp. Default is read-only tests; `--install-build` is explicit and invokes `npm ci` then `npm run build` only when a generated committed `package-lock.json` exists.
- The script's source parsed, and a JavaScript mock harness verified all 3 paths: **default** runs native tests and records build NOT_RUN; **full without lockfile** marks FAIL; **Windows + lockfile** invokes `npm.cmd` through the shell with fixed arguments, then build. Each report keeps `gate2: OPEN` pending browser and real-device QA.
- Actual local Node 22 catalog filtering tests were re-run in the container: **8/8 PASS**; isolated `tsc --strict --noEmit` for `src/catalog-filter.ts` exited 0.
- An offline npm lockfile install probe failed `ENOTCACHED` for `@radix-ui/react-slot`. Therefore **no npm lockfile generated**; complete React build, React DOM, nested-path screenshot and iPhone/iPad testing remain NOT_RUN. This is a verified blocker, not an error to conceal with a fabricated lockfile.
- A corresponding FLIP-14 PR #205 now includes a **four-script book-source parity test** and a one-command **18-test Node regression collector**; the collector is source-validated but NOT EXECUTED against a full checkout due to GitHub DNS. Device QA remains independent.

**Next required local evidence:** Reproducible lockfile + `npm ci`/build on network-enabled Windows worktree; review JSON reports and inspect iPhone/iPad/desktop visual screenshots; only then consider Gate 0/1/2 acceptance and merge sequencing. Production v1.3.68 remains unchanged.

---

## 30 Oct 2026 — SP-PILOT-06 Windows UI-MIG-02 Gate 2 preparation

- User confirmed **WD Books FLIP-14 Windows Node 18/18 PASS again after keep-with-next**; this is the Flipbook workstream, not a React build approval. Production `main` remains v1.3.68, PR #205 still Draft, mobile/PWA acceptance outstanding.
- Next independent track PR #208 (stacked on #207 → #173) has a new **genuine Windows npm lockfile bootstrap** (`scripts/bootstrap-lockfile.cjs`) for the isolated React preview, plus `tests/vite-dist-contract.test.mjs` for `./assets/` bundling and absence of a Service Worker.
- Gate runner now executes source tests, optional clean npm `ci`, Vite build and built-path contract in sequence, exporting a structured report under the OS temp directory. Run only after real npm lockfile has been generated; never handcraft a lockfile.
- Syntax and mocked outcome paths verified: no-lockfile fails when Build requested, success dispatches dist tests, failed Build blocks dependent checks. **Actual npm install/Vite Build on Windows is NOT YET RUN**. The execution container cannot resolve registry.npmjs.org (`EAI_AGAIN`).
- Windows commands, isolated Git branch and evidence boundaries are detailed in PR #208's `docs/previews/ui-react/README.md`. No production source/read progress/Reader/PWA affected.

