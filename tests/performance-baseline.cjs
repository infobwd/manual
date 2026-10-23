// ARCH-01E: read-only static baseline. Run: node tests/performance-baseline.cjs
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const version = fs.readFileSync(path.join(root, "assets/app-version.js"), "utf8");
const scripts = [...html.matchAll(/<script[^>]*\\bsrc="([^"]+\\.js)"[^>]*>/g)].map(m => m[1].replace(/^\\.\\//, ""));
const styles = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map(m => m[1].replace(/^\\.\\//, ""));
const shellMatch = sw.match(/const APP_SHELL = \\[([\\s\\S]*?)\\];/);
assert.ok(shellMatch, "Missing APP_SHELL");
const shell = [...shellMatch[1].matchAll(/"([^"]+)"/g)].map(m => m[1].replace(/^\\.\\//, ""));
const unique = new Set(shell);
assert.equal(unique.size, shell.length, "Duplicate offline shell entries");
for (const file of [...scripts, ...styles]) assert.ok(unique.has(file), "Not in offline shell: " + file);
const assets = shell.filter(p => p !== "." && fs.existsSync(path.join(root, p)) && fs.statSync(path.join(root, p)).isFile());
const missing = shell.filter(p => p !== "." && !fs.existsSync(path.join(root, p)));
assert.deepEqual(missing, [], "Offline shell has missing files");
const bytes = p => fs.statSync(path.join(root,p)).size;
const total = assets.reduce((n,p)=>n+bytes(p),0);
const top = assets.map(file=>({file,bytes:bytes(file)})).sort((a,b)=>b.bytes-a.bytes).slice(0,10);
const v = version.match(/WD_BOOKS_VERSION\\s*=\\s*"([^"]+)"/);
const report = {
  version: v?.[1] || "unknown",
  type: "static-build-baseline",
  note: "Transfer bytes are raw on-disk sizes, not compressed network transfer or runtime memory.",
  offlineShellEntries: shell.length, scripts: scripts.length, stylesheets: styles.length,
  rawShellBytes: total, rawShellKiB: Math.round(total/1024*10)/10,
  topTenAssets: top
};
console.log(JSON.stringify(report,null,2));
console.log("PASS ARCH-01E static shell baseline");
