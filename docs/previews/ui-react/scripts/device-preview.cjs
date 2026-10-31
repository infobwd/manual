// UI-MIG-02R4: temporary, token-scoped LAN preview of isolated Vite dist only.
// Manual start/stop; never exposes source files, reader data, service worker or production.
// node scripts/device-preview.cjs --lan (for phones on same trusted Wi-Fi)
// node scripts/device-preview.cjs (localhost-only)
"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const MIME = Object.freeze({
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
});
const HEADERS = Object.freeze({
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; base-uri 'none'; frame-ancestors 'none'"
});
function makeServer({dist, token}) {
  assert(/^[A-Za-z0-9_-]{20,}$/.test(token), "unpredictable URL token required");
  const base = fs.realpathSync(dist);
  assert(fs.statSync(path.join(base, "index.html")).isFile(), "Vite dist/index.html missing");
  return http.createServer((req,res)=>{
    const fail = code => {res.writeHead(code, {...HEADERS,"Content-Type":"text/plain; charset=utf-8"});res.end("Not found");};
    if(req.method !== "GET" && req.method !== "HEAD") {fail(405);return;}
    let u;
    try {u=new URL(req.url,"http://preview.invalid");}catch{fail(400);return;}
    if(u.pathname !== "/"+token+"/" &&
       !u.pathname.startsWith("/"+token+"/assets/")) {fail(404);return;}
    const relative = u.pathname === "/"+token+"/" ? "index.html":
      u.pathname.slice(("/"+token+"/").length);
    let parts;
    try{parts=decodeURIComponent(relative).split("/");}catch{fail(404);return;}
    if(parts.some(p=>!p || p==="." || p===".." || p.startsWith(".") || p.includes("\\") || p.includes("\0"))) {
      fail(404);return;
    }
    const file=path.resolve(base,...parts);
    const extension=path.extname(file).toLowerCase();
    if(!file.startsWith(base+path.sep)||!Object.hasOwn(MIME,extension) ||
      (relative==="index.html" ? extension!==".html" : extension===".html")) {
      fail(404);return;
    }
    fs.realpath(file,(err,real)=>{
      if(err || !real.startsWith(base+path.sep)) {fail(404);return;}
      fs.stat(real,(statErr,stat)=>{
        if(statErr || !stat.isFile() || stat.size > 12*1024*1024){fail(404);return;}
        res.writeHead(200,{...HEADERS,"Content-Type":MIME[extension],
          "Content-Length":stat.size});
        if(req.method==="HEAD"){res.end();return;}
        fs.createReadStream(real).on("error",()=>res.destroy()).pipe(res);
      });
    });
  });
}
function lanIPv4(){
  const found=[];
  for(const [name,entries] of Object.entries(os.networkInterfaces())){
    for(const entry of entries||[]){
      if(entry.family!=="IPv4" || entry.internal)continue;
      found.push({name,ip:entry.address});
    }
  }
  return found;
}
function main(){
  const lan=process.argv.includes("--lan");
  if(process.argv.some(arg=>!["--lan"].includes(arg))){
    throw Error("Unknown argument. Use --lan only for a trusted private Wi-Fi.");
  }
  const port = Number(process.env.WD_R4_PORT||4174);
  assert(Number.isInteger(port)&&port>=1024&&port<=65535,"WD_R4_PORT must be 1024..65535");
  const dist=path.join(root,"dist");
  const token=crypto.randomBytes(24).toString("base64url");
  const server=makeServer({dist,token});
  const host=lan?"0.0.0.0":"127.0.0.1";
  server.on("error",err=>{console.error("Device preview FAILED:",err.message);process.exitCode=1;});
  server.listen(port,host,()=>{
    console.log("WD Books UI-MIG-02R4 — isolated STATIC SAMPLE / no Production");
    console.log("Temporary token-scoped link; do not share publicly.");
    console.log("No server uploads, sessions, analytics, SW or persistence.");
    console.log("Local: http://127.0.0.1:"+port+"/"+token+"/?qa=1");
    if(lan){
      for(const {name,ip} of lanIPv4()){
        console.log("Trusted Wi-Fi candidate ("+name+"): http://"+ip+":"+port+"/"+token+"/?qa=1");
      }
      console.log("Use the IPv4 address belonging to your Wi-Fi/LAN adapter.");
      console.log("Allow Windows firewall access on PRIVATE networks only; never port-forward.");
    }
    console.log("Open on iPhone/iPad Safari while connected to the same trusted network.");
    console.log("Press Ctrl+C immediately after testing to shut down.");
  });
}
if(require.main===module){
  try{main();}catch(e){console.error("Device preview setup failed:",e.message);process.exitCode=1;}
}
module.exports={makeServer,lanIPv4,HEADERS};
