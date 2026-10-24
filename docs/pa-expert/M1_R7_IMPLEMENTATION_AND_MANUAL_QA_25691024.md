# M1-R7 — Implementation and manual QA (24 October 2569)

## Implemented in branch
- Evidence dashboard safe-area padding for iOS top/bottom and horizontal insets; no fixed overlay introduced.
- Thai presentation labels for all known evidence families, while retaining canonical JSON codes unchanged.
- Search covers Thai family and gate labels; domain/gate combined filtering and clear reset control.
- Expandable read-only subcriterion detail with source page and verification caveat.
- Plain-language legend separates original checking, evidence acceptance and amendment Source Lock.
- Dashboard summary initializes with placeholders until data loads; status remains computed from public JSON, never written by UI.
- Homepage floating buttons were already removed in PR #97; no duplicate modification.

## Manual QA required before merge
- [ ] Windows localhost/XAMPP: page loads 60 rows; D1=40; D2=20; R3-A=10; R3-B=15; search D1-01=5; combined filters and reset.
- [ ] Verify all family labels show Thai and expandable cards remain keyboard accessible.
- [ ] iPhone Safari: portrait/landscape, top/mid scroll, expanded/collapsed browser bars, text zoom; warning never overlaps status bar.
- [ ] iPhone installed PWA: safe-area and warning; verify no fixed buttons obstruct reader controls on homepage.
- [ ] iPad portrait/landscape and desktop: no horizontal overflow; filters, cards, details, focus states.
- [ ] Confirm no student names, raw scores, private URLs, credentials, or approval controls.
- [ ] After approved merge, verify Pages separately (not asserted here).

## Open gates
Source Lock of applicable ก.ค.ศ. amendments remains unverified. Public evidence register has 0 accepted records as of source snapshot; this is not an outcome evaluation. No original-source verification or acceptance has been performed by this UI PR.

## Local-first
Use Windows + VS Code + XAMPP; no GitHub Actions. Capture device QA results privately or as non-identifying descriptions.