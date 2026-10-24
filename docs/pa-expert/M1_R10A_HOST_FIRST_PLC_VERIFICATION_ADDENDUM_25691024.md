# M1-R10A — Host-first PLC evidence verification addendum (24 ต.ค. 2569)

## Corrected source location
Owner confirms seven-week PLC records reside on the school's **Host application**, which generates weekly summaries and an infographic prompt. This supersedes the previous assumption that school custodians must first locate paper/Drive files. The Host is the primary operational source; infographic prompts and generated images are **derivative representations**, not authenticated original evidence.

## Owner-provided screenshot snapshot (not independently verified)
- 10 PLC participating teachers (UI states 100%)
- 19 total cycles: 16 in progress, 3 completed
- 10 awaiting review/approval, 13 teaching-video links, 0 today's appointments
- UI heading 'Week 7 — cycle summary'. These are screenshot figures at capture time, not a database audit or PA performance claims.
- Seven weeks completed according to owner; cycle-level completion and approval statuses remain distinct. No inference that all 19 cycles are formally closed.

## Example chain, early-childhood K3, rainy-season disease prevention (owner-provided summary; not Host-audited)
| Stage | Owner-provided narrative | Evidence to verify on Host |
|---|---|---|
| W1 | Choose near-child dengue prevention, practical investigation, observation questions | original plan and PLC selection record |
| W2 | Creative-art activity time-gap for early finishers, teacher reflection | dated reflection and observation record |
| W3 | Team suggests helper roles and optional activities | dated team resolution, participants, approval |
| W4 | revised lesson plan v2 introduces 'little helper' and choice corner | versioned v1/v2 and implementation record |
| W5 | Buddy observes hands-on disease-prevention activities | actual Buddy observation; whether time-gap improvement was observed remains unproven |
| W6 | Weekly summary describes teacher/learner/school-level implications | original weekly fields and source-to-summary provenance |
| W7 | screenshot displays week-7 school overview | actual week-7 record and its approval status |

**Do not** treat W6 prose about reduced disruption, learner responsibility, or smoother management as measured effects unless underlying observations substantiate them. The infographic's instruction to avoid invented percentages, ratings and identities is a useful publication control, not a verification step.

## Host-first, read-only verification protocol
1. Confirm the application's exact URL/system name, permitted read-only access route, and data custodian. Do not request credentials in chat.
2. Export or inspect **one selected PLC cycle** as read-only using a school-approved function. Minimum metadata: internal cycle identifier (keep private), grade/subject, week 1–7 dates, individual weekly status, review/approval events, source version and last-updated timestamp.
3. For each week, inspect the **source record**, attachments/lesson versions, reflection, buddy notes and approved video metadata; distinguish missing, draft, submitted, reviewed and approved.
4. Check whether infographic prompt is generated deterministically from specific saved fields; record generation timestamp and source revision; flag model-written summary vs teacher-entered observations.
5. For week 7, reconcile week completion with cycle completion and pending approvals; do not conflate counts.
6. Record full provenance and any sensitive references only in access-controlled private storage. Public M1 register may receive an approved, de-identified verification summary afterward.
7. Connect PLC to principal decisions and outcomes only when independently supported; criterion acceptance remains blocked until rubric Source Lock and formal review.

## Minimal approved export shape (illustrative schema; do not populate publicly)
`cycle_ref_private,week_number,activity_date,record_status,approval_status,source_revision,has_reflection,has_lesson_version,has_buddy_note,has_followup,source_verified_by_private,verification_date`

## Next actionable dependency
Need Host URL and approved read-only export/screenshot pathway for a selected cycle (prefer the supplied K3 example). **No live Host data accessed or exported in this task.** No personal data, credentials, private identifiers, or student results may be committed publicly.

**Status:** OWNER_REPORTED_COMPLETE; HOST_LOCATION_CONFIRMED_BY_OWNER; ORIGINAL_HOST_RECORDS_NOT_VERIFIED; CRITERIA_NOT_ACCEPTED.
