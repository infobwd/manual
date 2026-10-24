# M1-R8 — Evidence linkage plan for WD Growth Together (draft, no acceptance)

## Goal
Link each of the 60 public-safe M1 subcriteria to candidate evidence and a traceable verification workflow, without exposing private student data or claiming compliance with ก.ค.ศ. criteria.

## Preconditions
- Resolve M1-R7 outstanding mobile Safe Area and cross-device QA separately.
- Confirm official source/amendment lock before authoritative rubric wording. Relevant amendment references listed in R7 handoff require original-source checking.
- Keep `infobwd/wd-standard` private; do not copy learner-level results or raw scores into `infobwd/manual`.

## Proposed crosswalk fields
`criterion_id`, `domain`, `gate`, `evidence_family`, `public_safe_evidence_description`, `document_presence`, `original_verified`, `source_lock_status`, `evidence_acceptance`, `owner_role`, `verification_date`, `public_safe_note`.

The public artifact must **not** contain reviewer identities, private URLs, individual learner IDs, names, scores, personal information, credentials, or approval tokens. Sensitive references and reviewer audit trails belong in authorized private storage.

## Phased work
1. Inventory the 60 IDs against the existing R5 crosswalk and R6 public JSON; validate counts by domain and R3 gate, no acceptance changes.
2. Prepare candidate evidence descriptions for R3-A (baseline/individual development plan), R3-B (dated PLC/coaching), R3-C (principal decisions and follow-up), R3-D (comparable verified outcomes). Descriptions are hypotheses until sources are inspected.
3. Independently track: document exists, original verified, applicable amended criteria verified, and evidence accepted. Never derive acceptance from file existence.
4. Publish only reviewed sanitized summaries; retain sensitive material and accountable sign-off in private authorized systems.
5. Review 60/60 mapping coverage, ambiguous evidence, missing dates, source provenance and privacy; request explicit user approval before merging any data updates.

## Acceptance gates
- 60/60 IDs mapped with no duplicates or missing criteria.
- Every proposed evidence link has an accountable private source and provenance or is clearly marked pending.
- No student-level data, unverified outcome claims or private repository links in public files.
- Source Lock and evidence acceptance remain pending until independently documented.
- Manual local QA on Windows + XAMPP; no GitHub Actions.

## Deliverables
A public-safe mapping draft, a private evidence review workflow specification, QA notes, and a subsequent PR for review. This planning document does not create or approve evidence.
