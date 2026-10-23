# SAR 2568 visual comparison — candidate v1.3.19

User accepted the 9-page SAR 2568 e-book on iPhone. This PR adds an accessible, text-backed comparison chart to page 3 (three standards only).

- Verified source: `ขั้นพื้นฐาน 68 บ้านวังด้ง.pdf`, printed page 1, executive summary. Standard 1: 83 vs 93.63; standard 2: 81 vs 96; standard 3: 81 vs 92.8. All values are percentages from internal school self-assessment.
- Bars use 0–100 scale and show exact numbers as visible text. The original bullets remain, so no content is hidden from screen readers or browsers without styling.
- Renderer only activates on pages declaring `chart.kind === "target-result"`; existing manuals unchanged.
- CSS is responsive for mobile and uses solid bars plus numeric labels, not color alone.
- No external chart library, tracking, new network request, or localStorage changes. Existing PWA app shell caches modified assets; version bumped to 1.3.19.
- The user should test the SAR page 3 in iPhone Safari and installed PWA (including night/sepia), reading mode, offline, bookmarks, and other books. Node suites and real-device QA remain pending. No automatic merge.
