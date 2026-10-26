# WD Books UI-MIG-01 — Design Token Contract & Visual Acceptance

**Parent plan:** [UI Stack Migration](WD_BOOKS_UI_STACK_MIGRATION_TAILWIND_SHADCN_2569.md) · **Status:** DESIGN CANDIDATE / Gate 1 OPEN

## Current evidence
- UI-MIG-00 interim audit merged in PR #170; Gate 0 remains open because local Node logs, device screenshots, offline/audio and timings are missing.
- Static Home / Bookshelf / Settings preview merged in PR #171 at `docs/previews/ui-next/index.html`.
- Static preview is **not** React, Tailwind or shadcn/ui; its sample books are not the real catalog.
- Production `index.html`, `sw.js`, `assets/app-version.js`, reader/audio and `wd-manual-reader-v2` remain outside scope.

## Proposed token map (candidate, not accepted production CSS)

| Semantic role | CSS custom property | Initial value | Tailwind v4 / shadcn intent |
|---|---|---|---|
| Brand | `--wd-pine` | `#174f47` | `--primary` |
| Brand deep | `--wd-pine-deep` | `#103e36` | brand emphasis |
| Page | `--wd-paper` | `#f8f7f2` | `--background` |
| Foreground | `--wd-ink` | `#213d39` | `--foreground` |
| Surface | `--wd-surface` | `#ffffff` | `--card` |
| Border | `--wd-line` | `#dce5df` | `--border` |
| Radius | `--wd-radius-card` | `20px` | `--radius` |
| Space unit | `--wd-space-unit` | `4px` | spacing scale |
| Tap target | `--wd-tap-min` | `44px` | Button / Nav / Sheet controls |

**Theme mapping:** light, sepia, night must define *all* semantic roles (background, foreground, card, border, muted, focus, primary and primary foreground), not merely toggle page color. Contrast requires measurement against WCAG 2.2 AA before Gate 1 PASS.

**Thai typography:** system fallback plus a locally served Thai-capable font if required after performance evaluation; avoid CDN dependency. Candidate content line-height 1.65–1.85; verify Thai combining marks and 90–160% text scaling on real devices. Respect reduced motion and `env(safe-area-inset-*)`.

## Component inventory for future React spike
1. Button (primary, secondary, icon, disabled, focus-visible; 44px touch target).
2. Card / BookCover (published-only real data after typed adapter exists).
3. Tabs (Home/Bookshelf/Settings; keyboard and selected state).
4. Sheet (mobile filters/settings; Escape, focus return, thumb reach).
5. Dialog (confirmations; focus trap and restoration).
6. SearchInput and empty/loading/error states.
7. Responsive navigation (bottom nav on phone; sidebar on larger screens).

**Boundary:** React preview owns only its isolated root; legacy Reader retains DOM ownership. No SW registration, manifest, runtime CDN, storage write, or root `index.html` replacement.

## Visual acceptance checklist
| Viewport / workflow | Check | Status |
|---|---|---|
| iPhone Safari portrait / installed PWA | Search, continue, bottom nav, thumb reach, safe area | NOT TESTED |
| iPad portrait | Card density, content width, settings | NOT TESTED |
| iPad landscape / Split View | No clipping, stable navigation, independent scroll | NOT TESTED |
| Desktop 1366 / 1440px | Responsive grid and keyboard navigation | NOT TESTED |
| Light / sepia / night | Contrast, focus, states, 90–160% typography | NOT TESTED |
| Preview isolation | No localStorage or SW calls in authored static preview | SOURCE REVIEW ONLY |
| Legacy Reader / Audio / PWA parity | Real-device baseline required | NOT TESTED |

## Gate decision and next actions
**Gate 0 OPEN / Gate 1 OPEN / Gate 2 BLOCKED.** Collect actual device screenshots and measurements using UI-MIG-00 runbook; record design review and issues. Only after acceptance begin UI-MIG-02 isolated React + TS + Vite + Tailwind v4 + audited shadcn/ui components with reproducible Windows build/lockfile. No production cutover authorized.
