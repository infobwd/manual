// Local-only parser gate. Run: node tests/js-syntax-gate.cjs
// Catches errors such as the missing parenthesis that broke WD Books in PR #48.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const scripts = [...html.matchAll(/<script[^>]*\bsrc="([^"]+\.js)"[^>]*>/g)].map(m => m[1].replace(/^\.\//, ""));
assert.ok(scripts.includes("assets/app.js"), "Missing app.js entrypoint");
const unique = new Set(scripts);
assert.equal(unique.size, scripts.length, "Duplicate script tags");
for (const file of scripts) {
  const full = path.join(root, file);
  assert.ok(fs.existsSync(full), "Missing JS: " + file);
  new vm.Script(fs.readFileSync(full, "utf8"), {filename:file});
  assert.ok(sw.includes('"./' + file + '"'), "Missing SW app shell asset: " + file);
  console.log("PASS syntax + offline shell: " + file);
}
new vm.Script(sw, {filename:"sw.js"});
console.log("PASS sw.js syntax; " + scripts.length + " scripts checked");
