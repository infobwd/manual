# SAR-INFO-02 — National assessments 2567–2568

New separate public book `sar-info02-national-assessments-2568` (8 pages). Existing SAR 2568 book and IDs unchanged.

**Primary source:** `ขั้นพื้นฐาน 68 บ้านวังด้ง.pdf`, SAR 2568, printed pages 11–13 (PDF pages 15–17). Figures transcribed from the national assessment tables, not inferred from the executive-summary quality-level table.

## Verified school averages (percent)
| Assessment | 2567 | 2568 | Difference |
|---|---:|---:|---:|
| RT oral reading | 93.16 | 78.71 | -14.45 |
| RT reading comprehension | 81.50 | 76.00 | -5.50 |
| RT overall | 87.33 | 77.35 | -9.98 |
| NT Thai | 57.54 | 53.04 | -4.50 |
| NT math | 52.41 | 42.81 | -9.60 |
| NT overall | 54.97 | 47.93 | -7.04 |
| O-NET Thai | 49.84 | 41.70 | -8.14 |
| O-NET math | 26.23 | 15.25 | -10.98 |
| O-NET science | 38.91 | 31.83 | -7.08 |
| O-NET English | 25.78 | 24.38 | -1.40 |

NT 2568 school / district / national: Thai 53.04 / 60.42 / 57.11; math 42.81 / 46.90 / 47.52; overall 47.93 / 53.67 / 52.32.
O-NET 2568 school / OBEC / national: Thai 41.70 / 46.11 / 47.60; math 15.25 / 23.36 / 24.90; science 31.83 / 34.56 / 35.43; English 24.38 / 29.72 / 33.58.

**Important distinction:** RT percent classified at “very good” (64.28 / 42.85 / 57.14) is not RT average score (78.71 / 76 / 77.35). The new book uses the latter for year comparison. Comparing different student cohorts is not an individual growth measure.

Chart renderer extends existing SAR comparison to `year-comparison` and changes legend labels to 2567/2568. No external libraries, no localStorage changes, no changes to old book content. PWA v1.3.22 updates existing cached assets.

## QA pending
- Run Node smoke gates (syntax, library, catalog, reader, PWA, performance, CAT contract).
- iPhone Safari/PWA: new book appears under school information, three year charts readable in light/night/sepia, values and source notes correct, page navigation and offline reopen, old bookmarks and SAR book unchanged.
- No merge without explicit approval.
