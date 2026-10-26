// Local-first smoke test for the five-question speaking teleprompter.
// Run: node tests/teleprompter.smoke.cjs
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const core = require("../assets/teleprompter-core.js");
const sandbox = { window: {} };
vm.runInNewContext(read("assets/manuals-data.js"), sandbox, { filename: "assets/manuals-data.js" });
const book = sandbox.window.WD_LIBRARY_DATA.manuals.find(m => m.id === core.BOOK_ID);
assert.ok(book && book.status === "published", "Presenter book must exist and be public");
const chapters = core.getChapters(book);
assert.equal(chapters.length, 5, "Exactly five speaking chapters");
chapters.forEach((chapter, i) => {
  assert.equal(chapter.paragraphs[0], "สวัสดีครับ", "Chapter " + (i + 1) + " starts with greeting");
  assert.equal(chapter.paragraphs.at(-1), "ขอบคุณครับ", "Chapter " + (i + 1) + " ends with thanks");
  assert.equal(chapter.pageIndex, i + 1, "Chapter is mapped to original book page");
  assert.ok(!chapter.paragraphs.join("\n").includes("###"), "Exclude coaching notes and headings");
});
assert.deepEqual(core.getChapters({ id: "other-book", pages: book.pages }), []);
assert.equal(core.advancePosition(12, 400, 30, 16), 12.48);
assert.equal(core.advancePosition(12, 400, 30, 1000), 13.92, "Cap gap after tab hidden");
assert.equal(core.advancePosition(399, 400, 100, 50), 400, "Clamp at chapter end");
assert.equal(core.advancePosition(-5, 400, -20, 10), 0, "Clamp negative values");
const html = read("index.html");
const sw = read("sw.js");
const version = read("assets/app-version.js");
const js = read("assets/app.js");
for (const id of ["readerTeleprompterOpen","wdTeleprompterDialog","wdPrompterViewport","wdPrompterScript","wdPrompterPlay","wdPrompterRestart","wdPrompterPrev","wdPrompterNext","wdPrompterSpeed","wdPrompterFont","wdPrompterStatus"]) {
  assert.ok(html.includes('id="' + id + '"'), "Missing UI element " + id);
}
for (const asset of ["teleprompter-core.js","teleprompter.js","teleprompter.css"]) {
  assert.ok(sw.includes('./assets/' + asset), "New resource missing from PWA precache");
  assert.ok(html.includes('./assets/' + asset), "New resource missing from page");
}
assert.match(version, /1\.3\.49/);
assert.match(js, /WD_TELEPROMPTER\?\.open\?\./);
const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), match => match[1]);
assert.equal(new Set(ids).size, ids.length, "HTML must have unique IDs");
console.log("WD Books — Teleprompter smoke PASS (5 scripts/scroll/clamping/UI/PWA)");
