// FLIP-09: execute the real child return handler in isolation.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path");
const app = fs.readFileSync(path.join(__dirname,"..","experiments/flipbook-pilot/corner.js"),"utf8");
const start=app.indexOf("  function currentReadingChapter() {");
const end=app.indexOf("  // Make the meaning of aria-pressed",start);
assert(start>0 && end>start,"FLIP-09 return implementation exists");
const factory=new Function("window","document","book","state","visibleSourceIndex",
  app.slice(start,end)+"\nreturn requestReturnToReader;");
function scenario(embedded, hasDirect, chapter="4"){
  const messages=[], direct=[];
  const frame={location:{origin:"https://infobwd.github.io"}};
  const parent={postMessage(message,origin){messages.push({message,origin})}};
  if(hasDirect) parent.WD_BOOKS_FLIP_EXIT=(source,id,page)=>{
    direct.push({source,id,page});
    return true;
  };
  frame.parent=parent;
  const document={body:{classList:{contains:name=>name==="flip-embedded"&&embedded}}};
  const book={id:"ai-five-questions-speaker-cheatsheet-25691026",pages:Array(12).fill(null)};
  const state={pages:[{dataset:{chapter}}]};
  const handler=factory(frame,document,book,state,()=>0);
  return {frame,parent,messages,direct,handler,book};
}
const normal=scenario(true,true);
normal.handler();
assert.equal(normal.direct.length,1,"direct same-origin handler invoked");
assert.equal(normal.direct[0].source,normal.frame,"actual child window used");
assert.equal(normal.direct[0].id,normal.book.id,"trusted book ID forwarded");
assert.equal(normal.direct[0].page,4,"current chapter forwarded");
assert.equal(normal.messages.length,0,"no duplicate asynchronous exit after success");
assert.equal(typeof normal.frame.WD_BOOKS_FLIP_CURRENT_CHAPTER,"function");
assert.equal(normal.frame.WD_BOOKS_FLIP_CURRENT_CHAPTER(),4,"parent button can read current chapter");
const cached=scenario(true,false);
cached.handler();
assert.equal(cached.messages.length,1,"outdated parent still gets postMessage fallback");
assert.equal(cached.messages[0].message.type,"wd:flip08b:exit");
assert.equal(cached.messages[0].message.chapter,4);
const standalone=scenario(false,true);
standalone.handler();
assert.equal(standalone.direct.length,0);
assert.equal(standalone.messages.length,0,"standalone preview cannot exit parent Reader");
const invalid=scenario(true,true,"-1");
invalid.handler();
assert.equal(invalid.direct[0].page,null,"invalid chapter never overwrites Reader position");
console.log("FLIP-09 child return PASS: synchronous same-origin request, message fallback, trusted chapter and standalone guard.");
