# WD Books — FLIP-03 Corner Drag Engine Pilot (28 ตุลาคม 2569)

**Status:** ISOLATED IMPLEMENTATION — STATIC QA ONLY; real browser/device QA **NOT TESTED**  
**Repo:** \`infobwd/manual\` · **Branch:** \`feat/flip03-corner-drag-engine-pilot\`  
**New demo after merge:** https://infobwd.github.io/manual/experiments/flipbook-pilot/corner.html  
**Previous stable demo:** https://infobwd.github.io/manual/experiments/flipbook-pilot/

## Goal

ต่อยอด FLIP-01/02 โดยเปิดให้ผู้ใช้จับมุมกระดาษแล้วลากตามนิ้ว/เมาส์ พร้อมเงาหน้าและปล่อยก่อนครึ่งทางเพื่อเด้งกลับตามพฤติกรรม engine. ทำผ่าน StPageFlip v2.0.7, MIT-licensed. เพิ่ม **preview URL ใหม่แยกจากแบบเดิม** เพื่อ rollback ง่าย; ไม่แก้ Reader หลัก, podcast, PWA, SW, app-version, localStorage หรือ data catalog.

## Engine and attribution

- Browser bundle: \`experiments/flipbook-pilot/vendor/page-flip.browser.min.js\` self-hosted, v2.0.7; ตรวจเนื้อหาที่ copy ตรงกันจาก public GitHub vendors 2 แหล่ง แยกจาก upstream official source; canonical package: https://www.npmjs.com/package/page-flip.
- MIT license + source attribution: \`experiments/flipbook-pilot/vendor/LICENSE-StPageFlip.txt\`; upstream: https://github.com/Nodlik/StPageFlip.
- No third-party runtime CDN/network calls or new package manager on production GitHub Pages.
- Preview source: \`corner.html\`, \`corner.css\`, \`corner-model.js\`, \`corner.js\`. ใช้ published book ID \`ai-five-questions-speaker-cheatsheet-25691026\` 12 source chapters โดยสร้างจำนวนหน้าตามพื้นที่จริงของ device.

## Interaction / pagination contract

- Desktop wide view: front cover right, blank inside cover left, content page 1 right; normal 2–3, 4–5, ... spreads; real HTML corner drag + shadow. Last back cover is a physical hard page, padding blank only if required.
- Mobile ≤1100 CSS px: single page; cover → page 1 immediately without intermediate blank.
- Drag corner to fold, let go early to spring back; keyboard ArrowLeft/ArrowRight (when stage focused), previous/next buttons, TOC chapter jump.
- Rebuild pages at 90–160% font and responsive resize; reading position **resumes by chapter start**, not exact text offset, until device testing verifies parity.
- Reduced motion toggle rebuilds with gestures disabled and near-instant button navigation. Reading remains possible for keyboard/touch via buttons.
- No origin of private books, personal learner data, authenticated content, TDRS login, audio resources or per-user state.
- Old CSS 3D pilot remains available at root preview path for regression comparison.

## Local tests

\`\`\`bash
node tests/flipbook-pilot.smoke.cjs
node tests/flipbook-corner.smoke.cjs
\`\`\`

Smoke covers code parse, public content, MIT attribution, self-hosted assets, no SW/localStorage/network writes, parity of physical sheets for seven content counts on both desktop/mobile. **Static tests do not prove realistic corner folding or mobile touch behavior**.

## Acceptance checklist (pending real browser/handset)

| Surface | Manual steps | Must pass |
|---|---|---|
| Desktop Chrome/Edge | drag bottom-right halfway / release / drag past midpoint; drag left to return | Fold follows pointer, releases/returns correctly, shadows render and pages stable |
| Desktop | cover → first spread → 2–3 → last → back cover → reverse | Cover right initially, no duplicate/skipped text pages, consistent numbers |
| iPad Safari portrait/landscape + Split View | drag corners and scroll outer page | Portrait one page, no gesture conflict or clipped text |
| iPhone Safari + Home Screen PWA | drag/short swipe, rotate device | Single-page, cover directly to text, no phantom blank, touch responsive |
| Any device | TOC jump, font 90/120/140/160, resize | No overflow/clipping, chapter start preserved |
| A11y / reduced motion | system reduce motion, toggle, keyboard/tab/VoiceOver | Button fallback and clear focus; no uncontrolled motion |
| Main WD Books | open original, podcast, resume, offline, update | No behavioral regression in production; app version unchanged |

## Rollout and rollback

1. Open isolated PR; only \`experiments/flipbook-pilot/*\`, \`tests/flipbook-corner.smoke.cjs\` and this document may change. Existing pilot's \`index.html\` may have a simple link to new corner preview.
2. If static tests and file boundary checks pass, merge preview-only PR to make \`corner.html\` reachable via existing GitHub Pages. No PWA version bump.
3. **User device QA is still mandatory**. Screenshots and notes should be attached to PR or documented before considering Go/No-Go for main Reader integration.
4. Rollback: revert FLIP-03 PR only; classic FLIP-02 remains, localStorage data untouched.
5. Main Reader integration is a **separate decision** under UI-MIG-04. If corner drag is heavy/unstable on iOS use existing CSS pilot/Reader as fallback; do not force migration.
