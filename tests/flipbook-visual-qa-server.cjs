// FLIP-14 visual QA: read-only local server for the checked-out public WD Books site.
// Node >=22; no npm dependencies. localhost-only unless explicitly passed --lan.
// Run from repo root: node tests/flipbook-visual-qa-server.cjs
"use strict";
const http=require("node:http");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const useLan=process.argv.includes("--lan");
const host=useLan?"0.0.0.0":"127.0.0.1";
const port=Number(process.env.WD_FLIP_QA_PORT||8765);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error("Invalid WD_FLIP_QA_PORT");
const mime={
  ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8",
  ".webmanifest":"application/manifest+json; charset=utf-8",
  ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg", ".webp":"image/webp", ".woff":"font/woff",
  ".woff2":"font/woff2", ".ttf":"font/ttf", ".ico":"image/x-icon",
  ".txt":"text/plain; charset=utf-8", ".mp3":"audio/mpeg",
  ".m4a":"audio/mp4", ".ogg":"audio/ogg"
};
function resolvePublic(url){
  let route;
  try{route=decodeURIComponent(new URL(url,"http://localhost").pathname);}
  catch{return null;}
  const chunks=route.split(/[\\/]/).filter(Boolean);
  if(chunks.some(s=>s==="."||s===".."||s.startsWith(".")||
       ["node_modules","tests","docs"].includes(s)))return null;
  const file=path.resolve(root,...(chunks.length?chunks:["index.html"]));
  if(!file.startsWith(root+path.sep))return null;
  const type=mime[path.extname(file).toLowerCase()];
  if(!type)return null;
  return {file,type};
}
const server=http.createServer((req,res)=>{
  if(!["GET","HEAD"].includes(req.method)){res.writeHead(405);res.end();return;}
  const target=resolvePublic(req.url);
  if(!target){res.writeHead(404);res.end("Not found");return;}
  fs.stat(target.file,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404);res.end("Not found");return;}
    res.writeHead(200,{
      "Content-Type":target.type,
      "Content-Length":stat.size,
      "Cache-Control":"no-store, max-age=0",
      "X-Content-Type-Options":"nosniff"
    });
    if(req.method==="HEAD"){res.end();return;}
    const stream=fs.createReadStream(target.file);
    stream.on("error",()=>res.destroy());
    stream.pipe(res);
  });
});
server.listen(port,host,()=>{
  const base="http://127.0.0.1:"+port;
  const book=(id,chapter)=>base+"/experiments/flipbook-pilot/corner.html?book="+
    encodeURIComponent(id)+(chapter===undefined?"":"&start="+chapter);
  console.log("\nWD Books FLIP-14 | read-only LOCAL visual QA | Ctrl+C to stop");
  console.log("Shelf/Reader:          "+base+"/");
  console.log("SAR 3 standards:       "+book("sar-2568-basic-education",2));
  console.log("SAR RT:                "+book("sar-info02-national-assessments-2568",1));
  console.log("SAR NT:                "+book("sar-info02-national-assessments-2568",2));
  console.log("SAR O-NET:             "+book("sar-info02-national-assessments-2568",4));
  console.log("WD Growth PLC:         "+book("wd-growth-plc-information-to-action-2569"));
  console.log("Term 2 supervision:    "+book("bwd-term2-supervision-readiness-2569"));
  console.log("Node gate PASS does not imply visual/device QA PASS.");
  if(useLan){
    console.log("\nLAN enabled explicitly: use your PC's local IPv4 address instead of 127.0.0.1");
    console.log("Only on a trusted local network; stop with Ctrl+C when finished.");
    console.log("HTTP on LAN is not a secure PWA origin: use for appearance only, not install/offline QA.");
  }
});
