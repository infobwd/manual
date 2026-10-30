# SP-PILOT-01 — PR #173 Baseline Matrix
Date: 2026-10-27. Evidence class: GitHub source inspection only. Do not interpret as executed QA.

| Area | Evidence | Status | Next verification |
| --- | --- | --- | --- |
| Repository main | HEAD 75ec0f4ee4fff7afd7e2ea6d4d108f90555427af at inspection | OBSERVED | Re-fetch before work |
| PR #173 | OPEN, head 88f681168b8c08bcf26d8c77ce963e2fc488c802; base previously 0a79b5b | OBSERVED | Compare current main and PR |
| Isolation | 9 added files under docs/previews/ui-react; no production files changed in PR diff | SOURCE PASS | Recheck complete diff |
| Framework | React 19, TypeScript, Vite 6, Tailwind 4 declared | SOURCE PASS | npm ci, tsc, vite build |
| UI primitives | Local shadcn-style Button/Card, not generated upstream package | SOURCE PASS | Keyboard/semantic tests |
| Sample catalog | Four hardcoded samples; React state for query/favorites | SOURCE PASS | Behavior tests |
| Themes | light/sepia/night CSS variables | SOURCE PASS | Contrast, theme tests |
| Nested static base | vite.config.ts base: './' | SOURCE PASS | Build and nested-path smoke |
| Lockfile | package-lock.json not among PR files | MISSING | Generate/commit on approved code branch |
| Component tests | No tests among PR files | MISSING | Add approved test harness |
| npm ci / build | No executed logs available | NOT RUN | Run on clean checkout |
| Device QA | No iPhone/iPad actual-device evidence | NOT TESTED | Capture real-device matrix |
| Existing reader/storage | No integration in source-only prototype | NOT IN SCOPE | Ensure no writes or regression |
| Existing smoke suite | Commands documented in UI-MIG-00 runbook | NOT RUN | Run unchanged on local checkout |
| PWA release | No app-version.js or sw.js modifications in PR diff | SOURCE PASS | Check final diff before PR decision |

## Device matrix
iPhone Safari: NOT TESTED
iPhone installed PWA: NOT TESTED
iPad Safari portrait: NOT TESTED
iPad landscape/Split View: NOT TESTED
Windows Chrome/Edge: NOT TESTED
Keyboard/VoiceOver: NOT TESTED
Offline and update lifecycle: NOT TESTED

## Evidence protocol
Record command, environment, commit SHA, timestamp, exit code, full failure count, and redacted logs. For device tests record OS/browser/viewport, actual device vs emulator, steps, screenshot, PASS/FAIL/NOT TESTED. No user data or secrets in this public repository.
