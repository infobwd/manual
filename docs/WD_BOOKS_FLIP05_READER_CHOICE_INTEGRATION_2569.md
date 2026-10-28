# WD Books — FLIP-05 Reader Choice / Integration Candidate (28 ตุลาคม 2569)

**Status:** STAGING PR, NOT APPROVED FOR PRODUCTION MERGE  
**Repository:** \`infobwd/manual\` · **Branch:** \`feat/flip05-reader-choice-staging\`  
**Preview once staged PR is merged:** https://infobwd.github.io/manual/?flip05=1  
**Gated book:** \`ai-five-questions-speaker-cheatsheet-25691026\`  
**Related work:** FLIP-03 corner drag, FLIP-04 iPhone polish, WD Books Reader UX master roadmap and UI-MIG-04.

## Evidence received and limits

Owner reported **PASS** for two FLIP-04 iPhone checks on 28 Oct 2026: (1) dragging page corners while scrolling vertically, (2) changing text size to 140% from the middle of a chapter. This supports proceeding to a *staged integration candidate* only. It is **not** full device acceptance for all books, desktop/iPad, audio, accessibility, offline or production PWA.

## Decision

A safe **opt-in Reader button** is a lower-risk next step than a third persistent \`readingMode\`. Keep \`paged\` and \`continuous\` as the only stored mode values, as in \`wd-manual-reader-v2\`. Do not replace any Reader DOM subtree with the corner engine.

### User flow

1. Open the main WD Books page with \`?flip05=1\`. Without this query flag the option is hidden from everyone.
2. Open the already-tested published book \`5 คำถามชวนคิด เมื่อ AI เข้ามาในโรงเรียน — ชีทโน้ตผู้บรรยาย\`.
3. In Reader extra tools, choose **พลิกกระดาษ**. The existing Reader stays open beneath a **second native dialog** (existing Teleprompter already uses the same modal approach). The iframe lazily loads a same-origin, self-hosted StPageFlip preview. It starts near the selected source chapter.
4. Drag corners, read, select chapters. The preview sends source-chapter updates with \`window.parent.postMessage\`, restricted in the host by exact origin, iframe contentWindow, book ID and valid integer range.
5. Select **กลับไปอ่าน**. The iframe is discarded and focus returns to the original Reader. Only if the source chapter actually changed is \`jumpTo\` invoked to sync existing progress and audio UI through existing code.
6. Other books, private or unpublished content, and readers without \`?flip05=1\` do not see the choice. No automatic mode persistence or new browser-storage key.

### Architectural constraints

- The button is opt-in and bound to one explicitly tested, published book. Although 13/15 published books currently use the pilot's five content fields, no blanket roll-out until document parity QA; two SAR books have chart/insight fields not handled by Flipbook.
- Preview remains a separate HTML document; no duplicate owner of the old Reader DOM and no overwriting Reader's audio controls.
- A lightweight \`assets/reader-flip-choice.css\` is added to the PWA shell. Bump the app version and splash to **1.3.56** for this candidate, based on the version checked at branch creation. **Recheck HEAD and concurrent PRs immediately before any merge**; never reuse an already released version.
- The 44KB page-turn engine and preview resources are intentionally **not pre-cached**; testing the Flipbook option requires network. This is explicit in the option tooltip and dialog.
- No TDRS login, user tracking, remote CDN, private data or new GitHub Actions.

## Gates still pending (NO MERGE before review)

| Gate | Test | Status |
| --- | --- | --- |
| Static | Node smoke, syntax, source content, mode/storage, origin validation, version/cache | Candidate, run test |
| Mobile iPhone | Open main Reader → flip → swipe/drag → close; focus returns, chapter bookmark unchanged or synced correctly | NOT TESTED |
| Audio & podcast | Play reading audio, open/close flip view, verify playback and currently narrated chapter | NOT TESTED |
| PWA/Offline | Update prompts/version, reopen offline legacy Reader, online-only preview graceful failure | NOT TESTED |
| iPad/desktop | Dialog sizing, viewport safe areas, double modal Escape, corner drag, TOC | NOT TESTED |
| Content fidelity | 12 chapters, headings/paragraphs/bullets/tips all readable with 90–160% zoom | NOT TESTED |
| Production | Only after all above, explicit approval, new version from latest main | NOT APPROVED |

## Run/check

\`\`\`bash
node tests/flipbook-pilot.smoke.cjs
node tests/flipbook-corner.smoke.cjs
node tests/flipbook-reader-choice.smoke.cjs
node tests/js-syntax-gate.cjs
node tests/pwa-reader.smoke.cjs
\`\`\`

Static checks do not replace manual device QA. If a new version of main arrives concurrently, rebase and rerun tests before considering merge.

## Rollback

Revert FLIP-05 PR and restore the prior app version, SW shell list and Reader files. The previous FLIP-04 standalone URL remains available. **Never clear** \`wd-manual-reader-v2\`, browser caches or user progress as a shortcut.
