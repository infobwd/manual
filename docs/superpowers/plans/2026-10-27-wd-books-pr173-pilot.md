# WD Books PR #173 Superpowers Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate the existing isolated React UI prototype in PR #173 through reproducible build, test-first behavior checks and real-device evidence without touching production.

**Architecture:** Keep production vanilla PWA unchanged. Use isolated preview root `docs/previews/ui-react/` and independent documentation. Code changes require separately approved branch/PR and test-first execution.

**Tech Stack:** React 19, TypeScript, Vite 6, Tailwind CSS v4, shadcn-style local primitives, Node/npm.

**Spec:** `docs/superpowers/specs/2026-10-27-wd-books-pr173-pilot-design.md`

## Global Constraints
- No edits to production assets, Reader, Audio, PWA service worker, app version, catalog or `wd-manual-reader-v2`.
- No GitHub Actions, backend, new production dependency or production deployment.
- Do not merge PR #173 or this docs PR without explicit later authorization.
- Maintain master roadmap and UI-MIG-00/02 gate hierarchy.
- Report PASS only after fresh command/device evidence; otherwise NOT RUN/NOT TESTED.

## Review Focus
1. Thai query including whitespace and case variants returns correct visible sample items.
2. Empty/no-result search is comprehensible and keyboard accessible.
3. Theme change preserves readable contrast and visible focus.
4. Favorites-only filtering does not persist or mutate production preferences.
5. Small viewport, large text and reduced motion preserve usable navigation.

---

### Task 1: Freeze baseline and candidate diff
**Files:** Read `docs/previews/ui-react/**`, master documents; update baseline matrix in docs-only branch.
**Interfaces:** Input main SHA, PR #173 head SHA; output reproducible inventory.
- [ ] Fetch latest main and PR metadata; compare against recorded SHAs.
- [ ] Review complete nine-file diff and detect any unexpected production paths.
- [ ] Record baseline SHA, environment, PR conflict/mergeability and actual evidence.
- [ ] Check that source-only inspection is not mislabeled build/device PASS.

### Task 2: Reproducible preview build (separate approval required)
**Files:** Modify `docs/previews/ui-react/package-lock.json` on approved code branch only; inspect `package.json`, `vite.config.ts`, `index.html`.
**Interfaces:** Input clean isolated checkout; output lockfile and build logs.
- [ ] Confirm Node/npm versions and isolated worktree.
- [ ] Generate lockfile with npm install in isolated preview only.
- [ ] Run `npm ci` from clean checkout; record exact output.
- [ ] Run `npm run build` and inspect TypeScript/build exit status.
- [ ] Serve built dist under nested subpath and verify assets load.
- [ ] Record vulnerabilities separately; do not claim security clean without audit.

### Task 3: TDD UI behavior (separate approval required)
**Files:** Add isolated test harness and tests under `docs/previews/ui-react/`; modify `src/main.tsx` only if a verified failing test justifies change.
**Interfaces:** Input four sample books and UI state; output observable component behavior.
- [ ] Select testing library and document why it fits the existing stack.
- [ ] Write one failing test for Thai search and verify expected RED.
- [ ] Implement minimal correction if needed; verify GREEN.
- [ ] Repeat for navigation, theme, favorites and empty state, one behavior per test.
- [ ] Run entire preview test suite and existing production smoke suite; record failures.
- [ ] Commit only approved isolated changes, with test evidence.

### Task 4: Accessibility and real-device matrix
**Files:** Evidence records only unless separately approved.
**Interfaces:** Input built preview; output actual-device PASS/FAIL/NOT TESTED matrix.
- [ ] Keyboard Tab/Shift+Tab/Enter/Escape and focus visibility.
- [ ] 90–160% text, reduced motion, contrast, labels and no horizontal overflow.
- [ ] iPhone Safari and installed PWA where applicable; distinguish preview from production PWA.
- [ ] iPad portrait/landscape/Split View; capture viewport and OS/browser.
- [ ] Verify no preview service worker or production storage writes.

### Task 5: Independent review and GO/NO-GO
**Files:** Create evidence summary and decision record on separate docs branch.
**Interfaces:** Input test logs, diff, device matrix; output categorized findings.
- [ ] Review Critical/Important/Minor issues against design spec and ARCH-01.
- [ ] Re-run full verification after any approved fixes.
- [ ] Compare with current main, check regression and unexpected changes.
- [ ] Mark each gate PASS/FAIL/NOT RUN with links to evidence.
- [ ] Ask owner for explicit merge/cutover decision; do not merge automatically.

## Current execution status
SP-PILOT-01 documentation planning only. Tasks 1–5 are future execution checklists; no build, tests or real-device QA have been run by this plan.
