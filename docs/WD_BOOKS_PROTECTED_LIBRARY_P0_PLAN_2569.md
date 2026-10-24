# WD Books — Protected Library P0 architecture and acceptance plan

**Status: DESIGN ONLY / NOT IMPLEMENTED** · 24 Oct 2026. Public website: `https://infobwd.github.io/manual/`; source: `infobwd/manual` on GitHub Pages. This plan must not put secrets or restricted content into GitHub Pages.

## Decision
Keep public books in the current static PWA. Introduce **a separate authenticated backend and private content store** for restricted books. A client-only PIN overlay, hidden HTML, encrypted content with a key embedded in JavaScript, obscured URL, robots.txt, or localStorage flag is **not access control**.

## Three content classes
| Class | Who | Delivery | Cache |
|---|---|---|---|
| PUBLIC | Everyone | GitHub Pages, current catalog | Existing PWA/offline allowed |
| STAFF-RESTRICTED | Individually authorized staff | Backend authorization per book and content request; PIN may be secondary step after identifying user | No persistent browser/SW cache by default |
| CONFIDENTIAL | Role-specific authorized persons | Separate private storage, named account + stronger authentication, audit trail | No offline/download by default; deny on shared devices |

**PIN design:** prefer unique account + individual 6-digit PIN (not a shared school PIN), securely hashed with modern password hashing, throttling/lockout, rate limiting by account/device/IP, session rotation and expiry, HTTPS, server-side authorization for every fetch, revocation and audit. For high-sensitivity content require additional factor as appropriate. Do not embed hashes, PINs, access tokens or decryption keys in static assets.

## Proposed topology
`WD Books public catalog (GitHub Pages)` → `authenticated API (separate secure host)` → `private document store`. Catalog exposes only safe metadata: ID, category, public title, access class, no confidential snippets. Backend decides book permission and streams pages after authorization. No direct public links to private assets. CORS origin allowlist and CSRF protections as applicable; content security policy; no sensitive data in logs. Host `bwd.ac.th` is a **candidate**, not a confirmed provisioned backend.

## UX
- Public books: unchanged, instant opening and existing bookmarks/progress/offline.
- Restricted book: lock icon and “ยืนยันตัวตนเพื่ออ่าน”; accessible dialog on iPhone/iPad/Android/desktop; error messages do not disclose account existence.
- After successful auth: show only permitted books/pages, session countdown and explicit sign-out; hide restricted content immediately after session expiry.
- Do not store restricted page text, private search index, thumbnails or recent-content snippets in `localStorage`, IndexedDB, Cache API, PWA service worker, or analytics. Recent list can store opaque ID only after privacy review.
- Fail closed if offline, API unavailable, session expired, or authorization revoked. Public PWA must remain usable.

## P0 work packages
| Gate | Deliverable | Acceptance |
|---|---|---|
| SEC-00 | classify sample books and data flows; threat model | privacy/security owner signs off; no restricted bytes in public repo |
| SEC-01 | backend and identity choice; data retention and backup design | least privilege, secure session, password hashing and rate limiting specified |
| SEC-02 | prototype with **synthetic** restricted book on staging | anonymous fetch and guessed URLs return 401/403; no leaked JS bundle/cache |
| SEC-03 | client UI and accessibility | keyboard, VoiceOver/TalkBack, PIN masking, retry and expiry tested |
| SEC-04 | integration / security QA | IDOR, brute-force, CORS/CSRF, token expiry, SW cache, logout, audit log tests pass |
| SEC-05 | release / rollback | restore public site if backend unavailable; no impact to current readers |

## Explicit non-goals and release gates
No implementation, production database, account creation, migration, or changes to existing reader/book IDs in P0 planning. No GitHub Actions requirement. Keep existing PWA offline behavior for PUBLIC books only. Review legal/privacy obligations and hosting suitability before storing actual staff documents. Require explicit implementation authorization and staged QA before launch.

**Suggested first restricted pilot:** synthetic staff manual with no real school records; do not use real PA evidence or learner records.
