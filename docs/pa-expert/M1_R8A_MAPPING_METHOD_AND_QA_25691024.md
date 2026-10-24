# M1-R8-A — Candidate evidence mapping (60/60)

This is a **planning register**, not a statement that any document exists or satisfies ก.ค.ศ. criteria.

## Mapping method
- Source IDs: M1-R5 60-subcriterion crosswalk (12 groups × 5 entries).
- Each candidate description is assigned by its five-item thematic group, **not** individually verified as sufficient for that subcriterion.
- The original R5 crosswalk and R6 public JSON remain authoritative for current public dashboard statuses; this draft does not modify them.
- R3-A = 10; R3-B = 15; R3-C = 25; R3-D = 10; D1 = 40; D2 = 20.

## Interpretation
- `document_presence=NOT_CHECKED`: no claim that the document exists.
- `original_verified=NOT_VERIFIED`: no original source checked.
- `source_lock_status=BLOCKED_AMENDMENTS`: applicable amendments remain to be confirmed.
- `evidence_acceptance=NOT_ACCEPTED`: no evidence has been accepted.
- `owner_role=TO_ASSIGN`: no responsible reviewer appointed in this public draft.
- Blank verification date is intentional.

## Next stage R8-B
Inspect private source materials in authorized environments, record dated provenance privately, and propose only sanitized public summaries. Review **each individual criterion** for evidence relevance, not just its thematic group. Do not publish student identifiers, scores, private URLs, or reviewer identities.

## R8-C
Only after manual validation, build a read-only UI for candidate presence and verification status; do not introduce browser-based acceptance, PIN-only protection, or a false approval workflow.

## QA before merge
- [ ] Exactly 60 unique IDs; 40 D1, 20 D2; R3-A 10, R3-B 15, R3-C 25, R3-D 10.
- [ ] Every ID matches the R5 crosswalk.
- [ ] All 60 candidate records remain NOT_CHECKED / NOT_VERIFIED / BLOCKED_AMENDMENTS / NOT_ACCEPTED.
- [ ] No student-level, confidential or private repository content.
- [ ] Local-First Windows/VS Code/XAMPP; no GitHub Actions.
