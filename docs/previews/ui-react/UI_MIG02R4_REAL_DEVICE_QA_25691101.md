# WD Books — UI-MIG-02R4 Real Device QA (isolated React preview)

**Date:** 1 November 2026 (2569)  
**Repository:** infobwd/manual  
**Branch:** `feat/ui-mig02r4-real-device-qa-25691101`  
**Stack:** #173 → #207 → #208 → #217 → R4 Draft; **base of R4 = R3 branch**  
**R3 baseline HEAD:** `376f597dcf7ebf653f439a86de58b1b918be9527`  
**Production:** WD Books 1.3.73 main unchanged; no deployment or merge  
**Gate:** R3 Chrome Simulation 16/16 + 13/13 **PASS**. R4 actual iPhone/iPad Safari **NOT_TESTED** until signed evidence arrives.

## 1. Scope and safety

This stage builds a repeatable **real-device test path**, not a published website, backend, or permission to ship. The static Vite `dist/` contains only the four-book **sample catalog**. It does not read production books, Reader, Audio/Podcast, reading history, favorites from devices, personal data, localStorage, service workers or any account login.

The new `scripts/device-preview.cjs` listens on localhost by default. `--lan` explicitly binds a temporary HTTP server to the LAN interface; a fresh cryptographically random URL token is required for **all requests, including JS/CSS**, and only `dist/index.html` and allowlisted `dist/assets/*` are served. No directory listing, POST/upload, state/session storage, analytics, tunneling or third-party dependency. It sends CSP `connect-src 'none'` and `no-store`. Stop with **Ctrl+C** when done. The token is a one-time secret, but **HTTP on LAN is not encrypted**: do not use public/café Wi‑Fi, guest networks, port-forwarding or Internet exposure. On Windows Firewall allow only **Private networks**.

Opt-in `?qa=1` mounts an in-memory accessibility-friendly manual QA drawer; regular preview screens remain unchanged without that parameter. The **Export JSON** button writes a file on the device only, triggered by the tester; there is no network submission. Manual PASS means **self-reported** and must be reviewed, not accepted automatically from a dropdown. N/A is permitted only for inapplicable device-specific checks.

## 2. Windows prerequisites and exact steps

Keep the existing genuine `package-lock.json` generated with npm on Windows. It has **not been confirmed committed** to this branch; do not fabricate or overwrite it. Node v24.13.1 and local Chrome/Edge are already in the earlier Windows environment.

```powershell
cd D:\wd-books-manual
git status --short
git fetch origin --prune
git switch -c test/react-device-r4 --track origin/feat/ui-mig02r4-real-device-qa-25691101

cd docs\previews\ui-react
node --version
node scripts\gate2-evidence.cjs

# Requires the authentic npm-generated package-lock.json in this directory.
node scripts\gate2-evidence.cjs --install-build

# Manual start: serves the built sample dist (NOT source code or production).
node scripts\device-preview.cjs --lan
# or: npm run qa:device
```

Leave that Terminal open. It prints addresses like:

```text
Trusted Wi-Fi candidate (Wi-Fi): http://192.168.x.x:4174/<random-token>/?qa=1
```

**Never paste or commit the actual one-time URL/token** to a public PR. Choose the IP of your real Wi-Fi/LAN adapter (not VPN/virtual adapters). The iPhone and/or iPad must be on the **same trusted Wi-Fi subnet**, with cellular fallback disabled temporarily if needed. On iOS open the entire printed link in Safari; do not use a public Pages or Production URL. Local `http://` is expected for this temporary sample; do not install it as a PWA. If the phone cannot connect, check correct LAN IP, same network, Windows Firewall **Private** allow rule and port 4174; **do not disable firewall entirely**.

## 3. iPhone / iPad test protocol — use real touch/keyboard

Work one device at a time and export **separate JSON files**; attach screenshots only after ensuring no personal information is visible.

1. On first open confirm sample WD Books Home. With `?qa=1` a small **QA อุปกรณ์** launcher appears, but not in ordinary preview. Open it and tap **บันทึกขนาดจอปัจจุบัน**; close to return to the application.
2. Use your **finger**, not mouse: Home → Bookshelf → Settings → Home; verify the full 3-item Bottom Nav, right-thumb reach and active states. On iPhone confirm its position above the home indicator; on iPad test portrait and landscape.
3. Tap Home search; type **ครู** with the actual Thai keyboard, press **ค้นหา/Go**. Verify the Bookshelf opens with one sample result. Repeat by tapping the on-screen **ค้นหา** button. Ensure no element is trapped under the keyboard or off screen.
4. On Bookshelf test category chips, immediate result updates, favorites, clearing query, long Thai titles, empty result feedback and vertical scrolling without horizontal overflow. Switch Light, Sepia and Night on Settings; check focus/contrast/size controls.
5. Rotate portrait ↔ landscape. On iPad (if supported/used) open Split View/Stage Manager with narrow width. On Desktop separately test **real browser zoom** at 125%, 150%, 200% (the prior CDP proxy is not a zoom test).
6. Open the QA drawer again and tap **บันทึกหลังหมุนจอ/แป้นพิมพ์**. Mark each item **PASS / FAIL / NOT TESTED / N/A**. Do not mark a check PASS without actually performing it. `N/A` is for irrelevant hardware-specific cases, e.g. iPad Split View on an iPhone.
7. Tap **บันทึกผลเป็น JSON ในเครื่อง**. Save to Files/Downloads and return the file in chat for analysis. Also provide a screenshot of any FAIL issue. The JSON includes viewport width, screen width, visual viewport, scroll widths, safe-area bottom, nav touch heights and a history of manual snapshots. **It does not include the text typed in search or an account identity.**
8. Close the Windows Terminal server with **Ctrl+C** after devices finish. All runtime evidence remains local; the script does not write to the repository.

## 4. Acceptance and reporting

| Gate | Required proof | Current status |
|---|---|---|
| R3 browser simulation | Real Chrome CDP report, 16 layout scenes + 13 interactions | **PASS**, as recorded in R3 QA |
| R4 local server | Node `tests/device-preview.test.mjs` including token/path/method controls | **NOT_TESTED on Windows** |
| R4 source contract | Node `tests/device-qa-contract.test.mjs` and existing source regression | **NOT_TESTED on Windows** |
| R4 fresh build | `npm ci`, TypeScript/Vite `npm run build`, relative assets PASS | **NOT_TESTED after R4 changes** |
| iPhone Safari | Real finger, Thai keyboard, portrait/landscape, safe-area and exported JSON | **NOT_TESTED** |
| iPad Safari | Portrait/landscape, Split View when applicable, controls and JSON | **NOT_TESTED** |
| Desktop actual browser zoom | Zoom 125%, 150%, 200% with visual inspection | **NOT_TESTED** |
| Dependency lockfile | Review and commit genuine npm lockfile, clean checkout reproducible | **OPEN** |
| Reader/Flipbook/Audio/PWA integration | Separate compatibility contracts and authorized rollout | **OUT OF SCOPE** |

All automated screen widths are **not** a replacement for actual Safari. Self-reported `SELF_REPORTED_COMPLETE_REVIEW_REQUIRED` from JSON is **not** a verified device PASS. The reviewer must examine the device's metrics, screenshots, and explicit sign-off. R4 must remain a Draft PR and must not merge into `main` or deploy until a separate Go/No-Go decision.

## 5. Continuation

If the Windows command fails, preserve the exact output and the generated Gate 2 JSON. If real-device validation finds a problem, attach the failing screen and QA export; fix only in this R4 isolated React subtree and rerun source/build + R3 Chrome simulation. A true Safari test should be recorded as **NOT_TESTED** until physical verification, never inferred from screenshots produced by Chrome headless.

Do not ship real school catalog items in this phase. Next migration gate after device approval: review genuine lockfile, reproducible clean build, and only then propose separate catalog adapter/integration PR.
