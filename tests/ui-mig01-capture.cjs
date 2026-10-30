// UI-MIG-01R2: capture responsive evidence from the isolated static preview.
// Run locally: node tests/ui-mig01-capture.cjs (requires local Chromium/Chrome).
// Screenshot creation is NOT a real-device visual PASS or accessibility audit.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");

const root = path.resolve(__dirname, "..");
const entry = path.join(root, "docs", "previews", "ui-next", "index.html");
const output = path.resolve(process.env.WD_QA_OUTPUT || path.join(os.tmpdir(), "wd-books-ui-mig01-screenshots"));
const candidates = [
  process.env.CHROME_BIN, "chromium", "chromium-browser", "google-chrome",
  "google-chrome-stable",
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe"),
  process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"], "Google", "Chrome", "Application", "chrome.exe"),
].filter(Boolean);

function findBrowser() {
  for (const browser of candidates) {
    const result = spawnSync(browser, ["--version"], { encoding: "utf8", timeout: 8000 });
    if (!result.error && result.status === 0) return browser;
  }
  throw new Error("Chromium/Chrome not found; set CHROME_BIN to its executable path");
}
function run(browser, args, name) {
  const result = spawnSync(browser, args, {
    encoding: "utf8", timeout: 30000, maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(result.error, undefined, name + ": " + String(result.error));
  assert.equal(result.status, 0, name + ": " + (result.stderr || "").slice(-1200));
  return result.stdout || "";
}

assert(fs.existsSync(entry), "run from a checked-out WD Books repo");
fs.mkdirSync(output, { recursive: true });
const browser = findBrowser();
const cases = [
  ["phone-books-light", 390, 844, "books", "light"],
  ["phone-books-night", 390, 844, "books", "night"],
  ["tablet-books-light", 1024, 768, "books", "light"],
  ["desktop-books-light", 1366, 768, "books", "light"],
  ["desktop-books-night", 1920, 1080, "books", "night"],
  ["desktop-settings-sepia", 1366, 768, "settings", "sepia"],
];
for (const [name, width, height, view, theme] of cases) {
  const url = pathToFileURL(entry);
  url.searchParams.set("view", view);
  url.searchParams.set("theme", theme);
  const base = [
    "--headless=new", "--no-first-run", "--no-default-browser-check",
    "--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox",
    "--hide-scrollbars", "--force-device-scale-factor=1",
    `--window-size=${width},${height}`, "--virtual-time-budget=1200",
  ];
  const dom = run(browser, [...base, "--dump-dom", url.href], name + " DOM");
  assert(dom.includes(view === "settings" ? "ตั้งค่าการอ่าน" : "หมวดหมู่หนังสือ"),
    name + ": preview content missing");
  if (view === "books") assert(dom.includes("bookResultsCount"), name + ": result count absent");
  const image = path.join(output, name + ".png");
  run(browser, [...base, `--screenshot=${image}`, url.href], name + " screenshot");
  assert(fs.existsSync(image) && fs.statSync(image).size > 1000, name + ": empty PNG");
  console.log("CAPTURED", name, width + "x" + height, image);
}
console.log("UI-MIG-01R2 browser screenshots captured; require human review before device/visual PASS.");
