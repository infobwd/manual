# M1 รอบที่ 4 — Evidence verification handoff and gap closure

**24 ต.ค. 2569 | Status: READY FOR OWNER/TEACHER VERIFICATION, NOT EVIDENCE ACCEPTED**

## Purpose
Turn M1 Round 3's open R3-A/B/C gates into an auditable, privacy-safe workflow. This document is a **handoff**, not proof that school staff have verified records. Public repo stores only status metadata; actual learner and staff records remain in authorized private systems.

## Workflow and approval
1. **Source owner** identifies the original artifact in the authorized school/private repository or system; logs an opaque evidence ID and access-controlled location (not a public URL to private files).
2. **Reviewer** checks authenticity, date, coverage, denominator, method, completeness, and limitations against the original. Reviewer records result in a private review log.
3. **Academic lead** confirms that rubric linkage is appropriate, distinct from software test completion and from mere plans.
4. **Principal** accepts a factual claim only after checking its evidence trail; disputes return to the reviewer without overwriting the original.
5. **Public register** records only evidence ID, rubric ID, type, aggregate status, review month, gap category, next action. Never expose individual identities, IDs, raw marks, images, staff evaluation or authentication details.

## Gate ownership and acceptance
| Gate | Owner role | Required verification | Current status |
|---|---|---|---|
| R3-A Baseline | Teacher assessor + academic lead | Cohort register denominator; subject coverage; original forms; rubric/score/date; signed verification; missingness | OPEN |
| R3-B PLC/Mentor | PLC lead + academic lead | Actual dated meetings, instruction changes, coaching, follow-up and outcomes | OPEN |
| R3-C Principal | Principal + independent reviewer | Dated decision log, options and rationale, allocation, evidence review, adjustments, follow-up | OPEN |
| R3-D Outcome | Academic lead + independent reviewer | Comparable baseline/retest, exclusions, confidence and alternative explanations | NOT STARTED |
| R3-E Legal rubric | Personnel lead | Official amendments, applicability and clause/page citations; Source Lock | BLOCKED |

## Status vocabulary
- `DISCOVERED`: a source exists, not yet assessed.
- `REVIEW_PENDING`: reviewer assigned, review not finished.
- `VERIFIED_SOURCE`: authenticity and contents verified, not necessarily a valid outcome.
- `ACCEPTED_EVIDENCE`: claim-specific reviewer and principal sign-off recorded privately.
- `GAP`: missing or insufficient evidence, with remedy.
- `REJECTED`: unsuitable or untrustworthy evidence; do not silently reuse.

**Never infer `ACCEPTED_EVIDENCE` from GitHub merge, tests passing, a screenshot, or a web page being live.**

## Round 4 deliverables
- [x] Privacy-safe template for register (`M1_ROUND4_PUBLIC_EVIDENCE_REGISTER_TEMPLATE.csv`).
- [x] Gate ownership, verification checklist and status vocabulary.
- [ ] School-authorized staff verify P3 baseline originals and cohort denominator.
- [ ] PLC lead confirms actual dated logs.
- [ ] Principal/reviewer confirm dated decision trail.
- [ ] Verify current host separately (read-only) before describing deployment status.
- [ ] M0 official source lock and then 60-subcriterion evidence crosswalk.

## Decision / next stage
M1-R4 planning and handoff is ready. **Evidence acceptance remains open**, pending access to original school records and authorized reviewers. M1-R5 should only assign accepted evidence to individual rubric subcriteria after those gates and applicable official criteria are confirmed.
