// Shared release consistency assertion for WD Books Flipbook regression tests.
// Do not hardcode release numbers: compare static HTML, SW and child assets
// against the one canonical version declared in assets/app-version.js.
"use strict";
const assert = require("node:assert/strict");

function assertFlipbookRelease({version, html, sw, childHtml}) {
  assert.equal(typeof version, "string");
  const match = version.match(/\bWD_BOOKS_VERSION\s*=\s*"(\d+\.\d+\.\d+)"/);
  assert(match, "canonical app-version.js must declare a valid numeric release");
  const release = match[1];
  assert(html.includes('id="splashVersion"') &&
    html.includes('>เวอร์ชัน ' + release + '</small>'),
    "initial Splash label must match canonical PWA version " + release);
  assert(sw.includes('Update ' + release + ':'),
    "Service Worker release header must match " + release);
  assert(sw.includes('importScripts("./assets/app-version.js")') &&
    sw.includes('const CACHE_VERSION = "wd-manual-public-" + self.WD_BOOKS_VERSION'),
    "Service Worker must derive its cache version from the canonical source");
  if (childHtml !== undefined) {
    for (const asset of ["corner.css", "corner-model.js", "corner.js"]) {
      assert(childHtml.includes(asset + "?v=" + release),
        "Flipbook iframe " + asset + " cache-busting version must equal " + release);
    }
  }
  return release;
}
module.exports = {assertFlipbookRelease};
