# WD Books × Superpowers — SP-PILOT-01 Design Spec
Date: 2026-10-27
Status: PROPOSED / DOCS ONLY / NO PRODUCTION CHANGE
Repository: infobwd/manual
Master: docs/WD_BOOKS_READER_UX_ROADMAP_2569.md
Technical annex: docs/WD_BOOKS_UI_STACK_MIGRATION_TAILWIND_SHADCN_2569.md
Baseline runbook: docs/WD_BOOKS_UI_MIG00_BASELINE_RUNBOOK_2569.md
Contract: docs/WD_BOOKS_ARCH01_BASELINE_2569.md
Candidate: PR #173, head 88f681168b8c08bcf26d8c77ce963e2fc488c802
Observed main baseline: 75ec0f4ee4fff7afd7e2ea6d4d108f90555427af

## Goal and boundaries
Evaluate the isolated React/TypeScript/Vite/Tailwind v4/shadcn-style prototype already proposed in PR #173 using Superpowers-style design, test-first implementation planning, evidence-based verification, and review. This is an assessment and planning pilot, not a second migration roadmap. The pilot must not change production code, PWA version, published content, service worker, Reader, Audio, catalog, or persisted preferences.

## Current architecture
Production remains a static GitHub Pages vanilla-JS PWA with existing script ordering and localStorage key `wd-manual-reader-v2`. PR #173 adds a source-only isolated preview under `docs/previews/ui-react/`: package.json, index.html, vite.config.ts, tsconfig.json, README.md, CSS, main.tsx, Button, Card and utility helper. It uses static sample books and local React state. It does not integrate real catalog or persistence.

## Decision
Approach A: review and test PR #173 instead of creating a duplicate prototype. Keep implementation changes, if later approved, on a separate candidate branch or explicitly approved PR #173 revision. The pilot documents are created on their own branch. No merge authorized.

## User journeys to evaluate
1. Switch Home / Books / Settings using keyboard and touch without losing layout.
2. Search Thai book title/category with empty query and no-result state.
3. Change light/sepia/night theme; ensure contrast and focus remain legible.
4. Toggle favorites-only against static sample data; do not imply persistence.
5. Resize iPhone/iPad/desktop and use large text/reduced motion without horizontal clipping.

## Non-goals
No reader replacement, no production integration, no new backend, no new GitHub Actions, no login, no real books, no PWA cache changes, no device-QA PASS claims from emulation.

## Risks and safeguards
- Existing PR #173 lacks a committed lockfile and verified build: mark NOT RUN until tested.
- The preview has no automated component tests: propose test harness before behavior changes.
- Its HTML uses `/src/main.tsx` for Vite dev entry while build base is `./`: validate built output at a nested path rather than assuming deployment works.
- `main` advanced after PR #173 base: compare and recheck before any future integration.
- Existing vanilla DOM smoke tests are not React component tests.
- Keep `wd-manual-reader-v2` untouched; confirm no SW registration or storage writes.
- Never treat GitHub mergeability or source inspection as device/build PASS.

## Approval gates
Gate P1: design/spec and baseline matrix reviewed.
Gate P2: test-first plan approved, reproducible npm install/build evidence collected.
Gate P3: component behavior, accessibility and nested-path preview tested.
Gate P4: iPhone/iPad real-device observations and compatibility reviewed; owner decides GO/NO-GO separately.
All gates remain OPEN pending evidence and owner approval.
