# M1-R10B — PLC Host read-only export runbook (24 ต.ค. 2569)

## Verified from code, not from production data
- Private source: `infobwd/plc` on GitHub; operational URL identified by owner: https://plc.esdc.app.
- `src/components/PrintCycleSheet.tsx` opens a full-cycle Week 1–7 print view and fetches Week 4 adjustments, Week 5 Buddy observations, Expert feedback, Week 3/6 PLC meetings and attachments using API reads.
- `src/lib/exportCycleSheetPdf.ts` uses html2canvas + jsPDF to save A4 PDF from the on-screen sheet.
- `src/pages/ReportsPage.tsx` offers a CSV summary export derived from currently loaded cycles/teachers. **CSV is summary, not original weekly evidence**.
- `backend-php/api.php` has protected `cycles` workflow routes and a separate supervision-handoff route. Authentication is TDRS-backed. Do not bypass permissions.
- The infographic artifact is derivative; its prompt snapshot can help trace sources but is not evidence that the source facts are true.

## R10B operator steps — selected K3 cycle
1. Log in normally to **plc.esdc.app** using an authorized school account. Do not share credentials or access tokens.
2. Open the K3 cycle matching the rainy-season lesson and confirm the cycle topic in the UI; avoid relying on topic alone if there are duplicates.
3. Open the cycle's **print/print preview** and inspect Week 1–7 sections. Use the existing **PDF export** to save an unmodified copy in school-approved **Private** storage. If UI labels differ from code, follow the actual UI and record the difference.
4. Check whether Week 3/6 meeting records, Week 4 v1/v2 adjustment, Week 5 Buddy observation and attached evidence actually appear. Absence on printout is a **verification gap**, not proof data never existed.
5. Record (in Private): date/time of export, authorized operator, cycle reference, deployed app version if visible, PDF hash if allowed, and source record revision/approval if available.
6. Open the weekly infographic prompt and compare claims with original weekly records. Mark each claim **source-observed / teacher-reported / AI-summarized / proposed / unsupported**.
7. In the Reports page, optionally export CSV for **counts and status reconciliation only**, not as a replacement for cycle-level evidence.
8. Verify the TDRS official supervision/mentor record separately if needed. Buddy ≠ official Mentor/Coach; saved Week 7 ≠ officially closed cycle.
9. Produce an anonymized, approved M1 summary after private verification. Never commit raw PDF, video URLs, participant identifiers, student results, tokens, or private Host paths to `infobwd/manual`.

## Acceptance checklist
- [ ] Selected K3 cycle positively identified
- [ ] PDF from existing print UI exported, stored Private and source date logged
- [ ] W1–W7 original fields reviewed; missing/draft/reviewed/approved distinguished
- [ ] W2 time-gap problem and W3 agreement verified
- [ ] W4 plan v2 and W5 observation inspected without causal overclaim
- [ ] W6 and W7 narratives traced to underlying fields
- [ ] Supervision handoff and TDRS outcome, if claimed, independently verified
- [ ] Redacted public summary approved by responsible authority

## Important caveats
The current exercise is **source-code inspection only**. Production database, deployed version, live permissions, availability of UI buttons and K3 records have **not** been authenticated or inspected. No export has been executed by the assistant. Source Lock for official criteria remains blocked; no E04 or criterion accepted.
