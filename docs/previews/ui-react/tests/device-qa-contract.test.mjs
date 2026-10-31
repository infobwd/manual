// R4 local-only device acceptance source contract. Not a real device PASS.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL(path,import.meta.url),"utf8");
const app=read("../src/main.tsx");
const qa=read("../src/device-qa.tsx");
const css=read("../src/style.css");
const server=read("../scripts/device-preview.cjs");
test("Device QA appears only for explicit ?qa=1 and does not mutate normal preview",()=>{
  assert.ok(app.includes('import { DeviceQA } from "./device-qa"'));
  assert.ok(app.includes("<DeviceQA />"));
  assert.ok(qa.includes('get("qa")==="1"'));
  assert.ok(qa.includes('if(!enabled)return null'));
  assert.ok(css.includes(".qa-launch"));
});
test("Manual verdicts remain NOT_TESTED until actual device operator marks them",()=>{
  for(const t of [
    'type Verdict = "PASS" | "FAIL" | "NOT_TESTED"',
    'answers[item.id]??"NOT_TESTED"',
    'assessment:complete?"SELF_REPORTED_COMPLETE_REVIEW_REQUIRED":"INCOMPLETE_NOT_TESTED"',
    'upload_performed:false',
    'inputFocusCount',
    'visual?.height??null',
    'env(safe-area-inset-bottom,0px)',
    'orientation:',
    'horizontalOverflow:',
    'const bytes=new Blob',
    'link.download="wd-books-r4-device-qa.json"'
  ])assert.ok((qa+css).includes(t),t);
  assert.doesNotMatch(qa,/localStorage|sessionStorage|indexedDB|navigator\.serviceWorker|XMLHttpRequest|\bfetch\s*\(/);
});
test("R4 server avoids public tunnels, telemetry, data APIs and persistent file writes",()=>{
  for(const t of [
    'const token=crypto.randomBytes(24).toString("base64url")',
    'const host=lan?"0.0.0.0":"127.0.0.1"',
    'if(require.main===module)',
    'server.listen(port,host',
    '"Cache-Control": "no-store, max-age=0"',
    '"Referrer-Policy": "no-referrer"',
    "connect-src 'none'",
    'relative==="index.html"',
    'Ctrl+C'
  ])assert.ok(server.includes(t),t);
  assert.doesNotMatch(server,/writeFile|writeFileSync|POST.*accept|cloudflared|ngrok|localStorage/);
});
