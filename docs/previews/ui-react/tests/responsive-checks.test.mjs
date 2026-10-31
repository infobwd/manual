// UI-MIG-02R3 browser gate fail-closed unit tests, Node built-ins only.
import test from "node:test";
import assert from "node:assert/strict";
import checks from "../scripts/responsive-checks.cjs";
const { checkScene } = checks;
const names=["หน้าหลัก","ชั้นหนังสือ","ตั้งค่า"];
const rect=(left,right,top=10,bottom=50)=>({left,right,top,bottom,width:right-left,height:bottom-top});
function fixture(width=390,view="books") {
  const margin=width>=1000?40:20;
  const navWidth=width>=1000?360:width;
  const navLeft=width>=1000?width-384:0;
  const per=navWidth/3;
  const y=width>=1000?12:650;
  const sidebar=width>=1000?rect(margin,margin+210,160,420):rect(margin,width-margin,145,250);
  const search=width>=1000?rect(margin+234,width-margin,200,248):rect(margin,width-margin,320,368);
  return {
    innerWidth:width,clientWidth:width,scrollWidth:width,bodyScrollWidth:width,
    visualViewportWidth:width,devicePixelRatio:1,debugLabelVisible:false,
    visibleCards:4,theme:"light",
    rects:{
      root:rect(0,width),shell:rect(0,width),header:rect(margin,width-margin),
      brand:rect(margin,Math.min(width-margin,220)),
      main:rect(margin,width-margin),grid:rect(margin,width-margin),
      firstCard:rect(margin,Math.min(width-margin,margin+180)),
      bottomNav:rect(navLeft,navLeft+navWidth,y,y+68),
      layout:rect(margin,width-margin),sidebar,search
    },
    nav:names.map((label,i)=>({
      label,left:navLeft+i*per,right:navLeft+(i+1)*per,
      top:y+8,bottom:y+60,width:per,height:52
    }))
  };
}
const scene=(width=390,view="books")=>({width,height:844,view,theme:"light"});

test("all target CSS viewport widths pass a clean layout fixture",()=>{
  for(const width of [320,360,390,430,768,1024,1366,1920]){
    const m=fixture(width);
    assert.deepEqual(checkScene(scene(width),m),[],String(width));
  }
});
test("horizontal overflow causes a hard FAIL, even with matching PNG and width",()=>{
  const m=fixture();
  m.scrollWidth=450;
  assert.ok(checkScene(scene(),m).includes("HORIZONTAL_OVERFLOW"));
  const body=fixture();body.bodyScrollWidth=430;
  assert.ok(checkScene(scene(),body).includes("HORIZONTAL_OVERFLOW"));
});
test("Chrome window-size / actual CSS viewport mismatch must fail",()=>{
  const m=fixture();m.innerWidth=800;m.clientWidth=800;m.visualViewportWidth=800;
  assert.ok(checkScene(scene(),m).includes("CSS_VIEWPORT_MISMATCH"));
  assert.ok(checkScene(scene(),m).includes("VISUAL_VIEWPORT_MISMATCH"));
});
test("clipped header or cover must fail",()=>{
  const header=fixture();header.rects.header.right=410;
  assert.ok(checkScene(scene(),header).includes("HEADER_CLIPPED"));
  const card=fixture();card.rects.firstCard.right=410;
  assert.ok(checkScene(scene(),card).includes("FIRSTCARD_CLIPPED"));
});
test("bottom navigation requires all three fully visible touch targets",()=>{
  const missing=fixture();missing.nav.pop();
  assert.ok(checkScene(scene(),missing).includes("BOTTOM_NAV_ITEMS_MISSING"));
  const clipped=fixture();clipped.nav[2].right=420;
  assert.ok(checkScene(scene(),clipped).includes("BOTTOM_NAV_NOT_TOUCH_VISIBLE"));
  const tooSmall=fixture();tooSmall.nav[0].height=35;
  assert.ok(checkScene(scene(),tooSmall).includes("BOTTOM_NAV_NOT_TOUCH_VISIBLE"));
});
test("preview debugging label must not occupy phone header",()=>{
  const m=fixture();m.debugLabelVisible=true;
  assert.ok(checkScene(scene(),m).includes("DEBUG_LABEL_NOT_HIDDEN"));
});
test("Bookshelf rail, category filtering and theme are checked from rendered metrics",()=>{
  const desktop=fixture(1024);
  desktop.rects.sidebar.right=600;
  assert.ok(checkScene(scene(1024),desktop).includes("DESKTOP_CATEGORY_RAIL"));
  const filtered=fixture();
  assert.ok(checkScene({...scene(),category:"งานบริหาร"},filtered).includes("CATEGORY_FILTER_NOT_APPLIED"));
  const night=fixture();night.theme="night";
  assert.ok(checkScene(scene(),night).includes("THEME_MISMATCH"));
});
