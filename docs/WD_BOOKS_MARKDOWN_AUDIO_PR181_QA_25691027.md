# WD Books — Markdown / Podcast Regression QA (PR #181)

Status: implementation candidate; device QA pending. Production unchanged.

## Scope
- Book: `ai-five-questions-speaking-handbook-25691026`, page 7/19
- Reader, Teleprompter, device speech and school online Thai TTS
- Source text in `assets/manuals-data.js` must remain unchanged
- Preserve literal multiplication `2 * 3`; avoid altering search, bookmarks, progress, offline cache or audio resume

## Manual acceptance
1. Open page 7/19 on iPhone Safari and installed PWA; confirm no Markdown delimiters are visibly spoken or rendered.
2. Inspect single-line paired `*emphasis*`, `**strong**`, and a line containing only `**`.
3. Check multiline or mismatched Markdown emphasis explicitly. This remains an open edge case, not a claimed PASS.
4. Listen using local speech and school online Thai voice. Verify neither speaks 'ดอกจัน'; verify chapter transitions.
5. Open Teleprompter, pause, resume, skip chapter, change font/speed.
6. Check iPad Safari/PWA, another book, background audio, and offline behavior.
7. Run existing smoke tests locally: `node tests/library.smoke.cjs`, `node tests/pwa-reader.smoke.cjs`, and any audio/teleprompter smoke suites present in the latest main.
8. Check Service Worker update and refresh after approved deployment.

## Gate
Do not merge until multiline edge cases, automated regression and real-device audio checks are resolved. No claims of QA PASS are made by this document.


## QA preview page (27 Oct)
- Branch-only route: `/markdown-qa.html`; requires local branch preview, not available on production Pages until a separately approved merge.
- Assets: `assets/markdown-qa.js`, `assets/markdown-text.js`.
- Local preview: `git fetch origin && git switch fix/reader-audio-markdown-20261027 && python -m http.server 4173`; open `http://localhost:4173/markdown-qa.html`.
- Automatic checks and comparison are client-side; spoken voice test uses local Web Speech only. School online TTS must be checked manually in Reader.
- No device PASS or deployment claimed.
