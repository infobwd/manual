# WD Books / PA Expert — M1-R7 handoff and mobile QA backlog
**บันทึกส่งต่องาน 24 ตุลาคม 2569 | แผน/ผลตรวจภาพ ไม่ใช่ผลตรวจรับหลักฐาน**

## สถานะล่าสุดที่ยืนยันจาก GitHub
- Repository: `infobwd/manual` (public); WD Growth source: `infobwd/wd-standard` (private)
- PR #84 (M1-R3) merged: `799195c9716a45d08c6b73362cf819b2089d51bd`
- PR #86 (M1-R4) merged: `f0412d23989a4bf98e263213a07f2dbdc5c5f116`
- PR #88 (M1 public review e-book) merged: `9b69e0c0eeea29eb79a319ccd53bf8ebfc508501`
- PR #92 (M1-R5 60-subcriterion crosswalk) merged: `1b94623c3cbe88cc0be6a977e556afbaa97dbe86`
- PR #94 (M1-R6 responsive evidence dashboard) merged: `76617dbf95761d8dbe03a24bef391d13e03b1cfa`
- Pages: https://infobwd.github.io/manual/ ; dashboard: https://infobwd.github.io/manual/m1-evidence.html ; research: https://infobwd.github.io/manual/research-library.html
- UI version `1.3.28` at M1-R6. No claim that any subsequent deployment/test has passed beyond screenshot evidence.

## User-provided iPhone screenshots (24 Oct 2569) — observed
1. Research Library shows **3 of 3 items**, search/type/status filters, original-source links and explicit unverified-source wording. Screenshot proves the page rendered, **not** source validity or link target verification.
2. M1 dashboard shows **60 registered, 0 accepted, 60 not accepted**; filtering `ด้านที่ 2` shows **20/60**, `R3-A` shows **10/60**, `R3-B` shows **15/60**. Screenshots support these visible counts only; they are not comprehensive test evidence for every combination.
3. At least one M1 screenshot shows the yellow warning panel text **under the iPhone status bar**, with time/signal overlapping the text. This is a **mobile safe-area / header overlap defect** to investigate on iPhone Safari/PWA.
4. Research Library screenshot shows header/back navigation and search filters working visually, but layout density is high; evaluate thumb reach, font sizes and spacing rather than assuming usability is approved.
5. M1 item cards expose raw machine-oriented evidence family names (e.g. `baseline_and_individual_plan`, `plc_coaching`, `management_outcomes`). Convert to understandable Thai display labels while keeping canonical codes in source data.
6. The public homepage contains two floating links (Research Library and M1 dashboard) positioned with fixed offsets. Audit collision with reading controls, iOS safe areas, small screens and accessibility. Prefer a compact single navigation entry or integrated menu; **do not add more floating buttons**.

## M1-R7 implementation plan (not yet implemented)
### P0 — Fix mobile obstruction and access
- Reproduce on iPhone Safari and installed PWA: scroll top/middle, landscape, browser chrome expanded/collapsed, Dynamic Type and text zoom.
- Ensure `viewport-fit=cover` pages apply safe-area padding where necessary; check top status bar, sticky/fixed elements, and warning text at every scroll position. Do not blindly add fixed pixel offsets.
- Review/remove conflicting homepage floating navigation; retain easy entry to M1 and Research Library through normal accessible navigation.
- Test tap targets, focus states, contrast, screen reader labels and horizontal overflow.

### P1 — Readable evidence review
- Map raw family codes to Thai labels in UI (not in authoritative JSON keys).
- Provide clear status legend: **รอตรวจต้นฉบับ / ยังไม่รับรอง / รอตรวจเกณฑ์แก้ไข**. Explain that zero accepted is a register state, not zero achievements.
- Preserve search and combined filters; show clear reset filters; verify 60 total, D1 40, D2 20, R3-A 10, R3-B 15, and remaining gate counts against JSON.
- Consider expandable card detail with provenance (original 2564 printed/PDF pages), reviewer instructions, and link to public-safe handoff; do not show private source links.
- Add manual QA checklist and screenshots as **descriptions** in public repo; avoid uploading user status-bar screenshots if unnecessary.

### P2 — Controlled evidence intake (design only until approved)
- Public dashboard stays read-only; no frontend-only PIN or client-side approval state.
- Reviewer identity, originals, approval trail, individual learner results and private evidence links stay on authorized server/private storage.
- Only a sanitized, separately reviewed public snapshot can update `assets/m1-rubric-public-data.json`; version and timestamp it, verify no identifying data.
- Separate `VERIFIED_SOURCE` from `ACCEPTED_EVIDENCE` and record accountable sign-off privately.

## Acceptance checklist before M1-R7 merge
- [ ] iPhone screenshot shows no warning/header content under status bar (Safari + installed PWA).
- [ ] Research Library and M1 reachable without overlaying core book controls.
- [ ] Search `D1-01` = 5; D1 = 40; D2 = 20; R3-A = 10; R3-B = 15; verify remaining gates.
- [ ] All raw family labels rendered in Thai; canonical codes remain unchanged.
- [ ] Responsive iPhone/iPad/desktop; no horizontal scroll or obstructed controls.
- [ ] No personal information, private links or unauthorized evidence-status writes.
- [ ] PR reviewed and merged; Pages publication checked separately.

## Academic/evidence gates still OPEN
- R3-A: teacher-verified baseline and cohort denominator.
- R3-B: actual dated PLC/coaching records and follow-up.
- R3-C: dated principal decision and follow-up trail.
- R3-D: comparable verified outcomes/retest.
- Official Source Lock: amendments ล679/2566, ล1144/2567, ล1933/2567, ล1222/2568 and any later applicable updates.
- M1-R5 crosswalk: 60/60 indexed, **0 accepted evidence**; do not infer failure, achievement, or official passing result.

## New chat continuation
Start with GitHub `main` and this document. Check PR state and source files before edits; create a small M1-R7 UI PR; test locally/visually; merge only on explicit user approval. Keep Local-First Windows + VS Code + XAMPP, no GitHub Actions, and never write student data to public repo.
