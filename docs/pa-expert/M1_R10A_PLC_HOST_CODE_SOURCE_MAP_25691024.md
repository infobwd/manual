# M1-R10A — PLC Host and code verification map (24 ต.ค. 2569)

## Confirmed locator
Owner identifies operational Host as **https://plc.esdc.app** and code repository as **infobwd/plc (Private)**. Public browser fetch did not provide Host data; no authenticated Host/DB read was performed. GitHub source code and canonical documents were inspected read-only.

## Code-grounded source map
- `backend-php/api.php`: PLC workflow API, separate from TDRS read/proxy APIs; protected calls reverify TDRS auth.
- `src/components/WeekForms.tsx` and `src/pages/CycleDetailPage.tsx`: weekly forms and cycle UI (documented in canonical system overview; not individually inspected in this turn).
- `docs/canonical/PLC_RULES.md`: Week 1–7 are local workflow labels, **not necessarily seven calendar weeks**; saving/autosave is not handoff approval. Buddy is a cycle-specific peer observer, not TDRS Mentor/Coach.
- `docs/canonical/AI_CONTEXT.md`: infographic prompt is copied to external AI, returned image uploaded as artifact with prompt snapshot; image is derivative and not used by PLC to decide approval.
- `docs/canonical/SYSTEM_OVERVIEW.md`: documents status/action matrix and separate PLC vs official supervision lifecycle. Historical document may not reflect deployed version; verify current main and Host before operational claims.

## User screenshot, not database-verified
10 teachers, 19 cycles, 16 in progress, 3 completed, 10 pending review/approval, 13 video links. UI 'Week 7' and 7-stage completeness must not be equated to formally closed cycles. Screenshot time and deployed version not independently verified.

## Read-only verification plan for selected K3 example
1. School-authorized user opens one K3 cycle at plc.esdc.app and identifies the cycle privately; do not share token or credentials.
2. Compare Week 1–7 saved fields against generated infographic prompt, including W2 time-gap, W3 agreed adjustment, W4 plan v2, W5 Buddy observations and W6 synthesis.
3. Check revisions, timestamps, author/approval events, and attachment provenance. Verify whether W5 actually observed the intended time-gap change; do not infer outcome from generic hands-on learning observation.
4. Verify Week 7 review and handoff status separately; where official supervision is claimed, inspect authorized TDRS linkage independently.
5. Create **private** evidence manifest and de-identified public summary only after authorization. No write to Host, no database dump into public repo, no acceptance without official rubric Source Lock.

## Gate
HOST_IDENTIFIED; CODE_REPOSITORY_IDENTIFIED; SOURCE_CODE_PARTIALLY_INSPECTED; HOST_ORIGINALS_NOT_VERIFIED; E04_NOT_ACCEPTED; 60_CRITERIA_NOT_ACCEPTED.
