# CAT-01A — Catalog/content contract (public WD Books)

**Status:** candidate, tests only; no runtime, cache, version, or localStorage changes.

## Stable compatibility rules
1. `assets/manuals-data.js` defines `window.WD_LIBRARY_DATA` with category IDs and book IDs. IDs are stable keys for reading history, favorites, bookmarks and progress; never rename IDs without an explicit migration plan.
2. `assets/wd-growth-individual-guide.js` must run **after** `manuals-data.js`, enriching the existing `wd-growth-individual-plan` entry. Repeated loading should not duplicate books or pages.
3. `published` books must have at least one readable page. `review` and `planned` books must have no published page content. All book categories must exist in the category list; book IDs must be unique.
4. Public repository must contain only approved public content or synthetic examples. No identifiable student data, internal-only manuals or secrets.
5. Current PWA offline shell precaches the public catalog and WD Growth guide. Any future lazy loader must explicitly preserve offline reading for previously available public books, or be separately approved as a change of policy.
6. Reader, catalog, and My Books must preserve Thai search/sort and `wd-manual-reader-v2` local data. CAT-01A only adds a read-only test; it does not rewrite production content.

## Local verification when Windows/VS Code is available
```powershell
node tests/cat01-contract.smoke.cjs
node tests/js-syntax-gate.cjs
node tests/performance-baseline.cjs
node tests/catalog-core.smoke.cjs
node tests/mybooks-selectors.smoke.cjs
node tests/reader-coordinator.smoke.cjs
node tests/library.smoke.cjs
node tests/pwa-reader.smoke.cjs
```

Test file JavaScript syntax was parsed before opening PR. Full Node test execution and device QA are **pending**; do not label them PASS without evidence. If the contract test fails on current published content, inspect the exact book and adjust the contract or data in a separately reviewed PR; do not silently remove a published book.

## Next
After CAT-01A acceptance and ARCH-01E measurements, assess whether metadata-only boundaries or on-demand public content are justified. No speculative lazy loading.
