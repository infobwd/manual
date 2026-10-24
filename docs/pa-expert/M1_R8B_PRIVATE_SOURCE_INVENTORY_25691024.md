# M1-R8B — Private WD Growth source inventory (24 Oct 2569)

## Scope
Read-only inspection of selected **documentation files** in private repository `infobwd/wd-standard` using GitHub. This is a **partial inventory**, not an exhaustive repository scan, original-source verification, host inspection, student outcome audit, or evidence acceptance. Only public-safe document titles and classifications are recorded here; private links, learner records and scores are omitted.

## Source documents confirmed accessible (file presence only)
| ID | Document title | Candidate gate | Observation and limitation |
|---|---|---|---|
| S01 | WD Growth Master Plan | R3-C | Describes proposed schoolwide management cycle; document itself marked PROPOSED / DOCUMENT-ONLY |
| S02 | WD Growth Assessment Design | R3-A | Proposed baseline design, rubrics and validity safeguards; not proof of implementation |
| S03 | WD Growth Data Model | R3-C | Proposed schema, API and permissions; architecture is not deployed evidence |
| S04 | Unified Nine-Grade Teacher Entry Plan | R3-A, R3-C | Owner-approved 9-grade scope; technical design marked draft and not Production GO |
| S05 | Host-First Pilot Plan | R3-A, R3-C | Planned teacher verification workflow and governance; document says not deployed at time of writing |
| S06 | Baseline A Primary Forms | R3-A | Pilot-ready after teacher review; not national-standard assessment or proof of use |
| S07 | Current Execution Status | R3-C | Dated status handoff (18 Oct), explicitly says host not deployed/acceptance not started at its snapshot; requires freshness check |
| S08 | Private repo README | R3-A, R3-C | Links the project plans and reiterates restrictions on student data and release readiness |

All eight file-presence observations are based on successful GitHub fetches, **not** independent verification of signed originals or completeness. Their documented status is time-bound and may be superseded by newer work.

## Candidate mapping to M1-R8A families
- R3-A: S02/S04/S05/S06 are possible design and process provenance; individual baseline assessment results, teacher sign-off, actual cohort denominator and dated plan execution **not verified**.
- R3-B: No dated PLC meeting minutes, coaching observations or follow-up originals verified in this inspection. **Not checked** is not the same as nonexistent.
- R3-C: S01/S03/S04/S05/S07/S08 are possible management-design provenance; actual dated principal decisions, execution logs and follow-up originals **not verified**.
- R3-D: No verified comparable baseline/retest outcomes or independent school-level result records inspected. **Not checked** is not evidence of no progress.

## Required next checks
1. In private authorized environment, enumerate actual dated PLC/coaching records, signed teacher assessment confirmations, principal decision/follow-up records, and comparable outcome reports; collect provenance without exposing student details.
2. Confirm current production state separately; older draft-status files are snapshots, not live deployment claims.
3. For **each of 60 criteria**, compare candidate material with its exact rubric wording after official amendment Source Lock. R8A thematic descriptions are not individually sufficient evidence.
4. Store reviewer identity, source URLs, hashes, signatures and acceptance audit privately. Only publish sanitized non-identifying summaries after review.
5. Keep `document_presence` of the R8A **criterion-level** register as NOT_CHECKED until a specific item is matched to a specific criterion and its presence independently checked. No automatic promotion from a thematic document list.

## Decision
**R8B partial source-document inventory completed; substantive verification remains OPEN.** No changes to `assets/m1-rubric-public-data.json`, no approval controls, no student data, no evidence accepted. Local-First Windows/VS Code/XAMPP; no GitHub Actions.
