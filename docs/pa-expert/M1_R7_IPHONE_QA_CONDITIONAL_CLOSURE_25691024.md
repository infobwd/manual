# M1-R7 iPhone QA evidence and conditional closure — 24 October 2569

## Scope and provenance
Manual review of user-supplied iPhone screenshots after PR #100 merge (merge SHA `08aac16c294495a73e8d48fd429a9dad8296de67`). Screenshots were reviewed in chat; they are **not uploaded to the public repository**. This report describes only visible behavior, not an automated/device-lab test.

## Observed PASS (screenshot-bounded)
- Public M1 dashboard shows “พบ 60 จาก 60 รายการ”.
- D1-01.1 and D1-01.2 cards expand to show readable Thai subcriterion text, source page 152/157 and verification caveats.
- Canonical evidence family `baseline_and_individual_plan` is displayed as Thai “ผลประเมินตั้งต้นและแผนพัฒนารายบุคคล”; R3-A shows a Thai explanatory label.
- Cards and expanded detail fit the observed portrait viewport without horizontal clipping.
- Evidence status remains “ยังไม่รับรองหลักฐาน” and “รอตรวจเกณฑ์แก้ไข”; no approval action is visible.

## OPEN / not tested
- **iPhone top safe area while scrolling:** screenshot shows preceding content near/behind status bar. This needs a reproducible scroll test in Safari and installed PWA before full UX closure. Browser toolbar overlays at bottom may be native Safari behavior; verify interaction is reachable rather than treating the screenshot alone as proof of a site defect.
- iPhone landscape, dynamic text, Safari chrome collapsed/expanded, PWA standalone, iPad and desktop have not been demonstrated.
- Search and combined filter expected counts (D1=40, D2=20, R3-A=10, R3-B=15, D1-01=5), reset, focus and keyboard tests remain open.
- Source Lock, original verification, evidence acceptance and official PA eligibility remain **OPEN**.

## Decision
**M1-R7 partial visual QA PASS; full QA closure NOT YET APPROVED.** Keep Safe Area follow-up as an explicit defect-investigation item. PR #100 already merged; do not re-label the entire round as tested or accepted.

## Follow-up acceptance procedure (Local-First)
1. On Windows + VS Code + XAMPP verify counts, search, combined filters and reset.
2. On iPhone Safari scroll top/middle/bottom, test collapsed/expanded toolbar and rotate; repeat in installed PWA. Record whether page text enters the status-bar area and whether controls can be reached.
3. On iPad/desktop verify no overflow, keyboard focus and details expansion.
4. Record observations without uploading personal/status-bar screenshots to public repo. Fix reproducible defects in a separate PR, obtain explicit merge approval.
5. Verify Pages deployment separately after merge; no GitHub Actions.

## Data governance
Public dashboard is read-only. Presence of an item, verification of its source, and acceptance of evidence are three separate decisions. The 0 accepted status is a register state, not an educational outcome or official ruling.
