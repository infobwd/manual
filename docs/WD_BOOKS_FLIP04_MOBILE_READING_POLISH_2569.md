# WD Books — FLIP-04 Mobile Reading Polish (28 ตุลาคม 2569)

**Status:** IMPLEMENTED IN ISOLATED PILOT / static checks; additional real-device QA pending  
**Preview:** https://infobwd.github.io/manual/experiments/flipbook-pilot/corner.html  
**Source of truth:** \`docs/WD_BOOKS_FLIP03_CORNER_DRAG_PILOT_2569.md\` and the existing Reader UX Roadmap.

## Input and design decision

Two screenshots from a real iPhone (28 October 2026) show that StPageFlip is drawing a visibly folded page and curved shadow in the isolated preview (visual evidence of interaction only). They do **not** prove full gate acceptance: scroll, release threshold, audio/PWA parity, 90–160% font reflow, accessibility and other devices need separate checks.

FLIP-04 is a **polish and resilience patch**, not integration with WD Books main reader. The core 3D engine and layout remain the same. Keep existing FLIP-02 classic preview as fallback and avoid replacing content/reader state.

## Changes

1. **Reduce mobile chrome:** compact the iPhone heading/description and top toolbar so reading area arrives sooner without changing button IDs, controls, content or themes.
2. **Corner hints become unobtrusive:** on the first drag/turn, hide the overlaid corner labels for the current session; the concise help line remains under navigation. No persistent preference is saved.
3. **Preserve reading position through reflow:** capture an in-memory \`{chapter,fraction}\` anchor before recalculating pages on resize/font changes and restore to the corresponding position in the new chapter. Front and back cover remain distinct. This is approximate position, not exact paragraph/character offset.
4. **Portrait scroll handling:** \`touch-action:pan-y\` on the book for viewport ≤1100px to permit vertical webpage scrolling while retaining page-turn gestures. Must be manually verified in iPhone Safari/iPad Split View.
5. **Robust lifecycle:** track the engine's mounted orientation when resolving the old page after resizing, prevent a rebuild error leaving \`rebuilding=true\`, keep keyboard and reduce-motion button fallback.
6. **Isolation:** changes limited to \`experiments/flipbook-pilot/corner.{html,css,js}\`, new \`position-model.js\`, existing isolated smoke test and this document. No root \`index.html\`, SW, app-version, audio, catalog, login, storage, or remote analytics.

## Test matrix

| Test | Static check | Browser/device gate |
|---|---|---|
| Front cover right / mobile cover | FLIP-03 model | Reopen on iPhone and desktop |
| Touch drag and rollback | Engine unchanged, handlers retained | Drag halfway, release, try again; confirm vertical document scroll |
| Hide corner help | \`has-interacted\` and CSS checked | Confirm corner labels disappear on first fold |
| Change font 90/100/120/140/160 | Position-model assertions | Read middle of chapter, change font, still roughly same point without clipped text |
| Rotate / resize / Split View | Mounted orientation retained in code | Rotate mid-chapter; no phantom page or wrong TOC |
| Last page / back cover | Position-model cover anchors | Check final page can return to cover, no missing text |
| Reduced motion | Existing settings/gesture fallback kept | Switch mode while reading; same page, buttons continue |
| Main WD Books | Diff boundary check | Verify reader, saved progress, audio, PWA update unchanged |

## Rollout

- Run \`node tests/flipbook-pilot.smoke.cjs\` and \`node tests/flipbook-corner.smoke.cjs\` from a local checkout; static pass is **not** browser acceptance.
- After preview-only PR merge, test the same \`corner.html\` URL with a hard reload; no PWA version bump because none of these preview files are part of the main app shell.
- If touch-action scrolling degrades corner dragging on iOS, revert this patch or switch only the touch-action declaration after user-device QA. Keep FLIP-03 as fallback. Production Reader integration remains subject to UI-MIG-04 and separate acceptance.
