# CAT-01B — Read-only catalog metadata boundary

**Candidate only.** This step adds `assets/catalog-metadata.js` and `tests/catalog-metadata.smoke.cjs` as an **opt-in module**, not loaded by `index.html` and not added to `sw.js` yet. No production behavior changes or version bump.

`window.WD_CATALOG_METADATA.createMetadataView(manuals)` returns an immutable metadata snapshot (`books` and `getById(id)`) with title, status, category, tags, `pageCount` and `readable`. It intentionally omits `pages` content. It does **not** fetch data, modify original manuals, persist anything, or rename IDs.

The existing `assets/catalog-core.js`, My Books selectors and Reader continue using original data. This keeps all current behavior and offline availability intact. Do not switch Reader to metadata-only books: Reader requires full pages.

### Local QA (pending)
```powershell
node tests/catalog-metadata.smoke.cjs
node tests/cat01-contract.smoke.cjs
node tests/js-syntax-gate.cjs
node tests/performance-baseline.cjs
```

Only JavaScript parse of new files was verified while no computer was available. Do not claim full Node or device QA PASS. Any future integration requires a separate PR, updated app shell and a real-device offline/reader check. Measured ARCH-01E performance still gates actual lazy loading.

### Adding new public books in parallel
- Create a separate content PR per approved manual, with a unique permanent `id`, valid category and status.
- Published books need at least one page; planned/review entries must not include private draft page bodies.
- Keep learner records, identifying details, credentials, and restricted manuals out of this public repository.
- Run the CAT-01A contract test when a computer is available; verify the new book opens and works offline on a device.
