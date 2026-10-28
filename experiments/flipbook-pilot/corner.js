(() => {
  "use strict";
  // The integration gate only exposes the single tested public book.
  const PILOT_ID = "ai-five-questions-speaker-cheatsheet-25691026";
  const query = new URLSearchParams(window.location.search);
  const requestedId = query.get("book") || PILOT_ID;
  const startChapter = /^\d{1,3}$/.test(query.get("start") || "") ?
    Number(query.get("start")) : null;
  if (query.get("embed") === "1" && window.parent !== window)
    document.body.classList.add("flip-embedded");
  const el = id => document.getElementById(id);
  const book = requestedId === PILOT_ID ?
    (window.WD_LIBRARY_DATA?.manuals || []).find(item =>
      item.id === PILOT_ID && item.status === "published" && Array.isArray(item.pages)) : null;
  const stage = el("bookStage");
  const cornerModel = window.WD_CORNER_MODEL;
  const positionModel = window.WD_CORNER_POSITION;
  const bookNode = el("cornerFrame");
  const measure = el("measure");
  const chapterSelect = el("chapter"), fontSelect = el("fontSize"), motionButton = el("motionButton");
  const reducedSystem = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 1100px)");
  const state = { pages: [], chapters: [], current: 0, motionOff: reducedSystem.matches, font: 100,
    engine: null, engineMap: [], renderSingle: null, hasInteracted: false,
    initialChapter: startChapter,
    rebuilding: false, resizeTimer: 0, layoutRetries: 0, retryTimer: 0 };
  const element = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const blank = () => element("div", "paper blank");
  function isSingle() { return mobileQuery.matches; }
  function step() { return isSingle() ? 1 : 2; }
  function fail(message) {
    const node = el("error");
    node.hidden = false;
    node.textContent = message;
    document.querySelector(".reading-surface").dataset.error = "true";
    el("progress").textContent = "ไม่สามารถเปิดตัวอย่างได้";
    el("prev").disabled = true;
    el("next").disabled = true;
    console.error("FLIP-03:", message);
  }
  function createSheet(chapterIndex, withCover) {
    const paper = element("div", "paper" + (withCover ? " cover" : ""));
    paper.dataset.chapter = String(chapterIndex);
    if (withCover) {
      paper.append(
        element("div", "cover-top", "WD BOOKS  /  SCHOOL LEARNING LIBRARY"),
        element("div", "cover-design", "W"),
        (() => { const body = element("div"); body.append(element("div", "cover-title", book.title), element("div", "cover-desc", book.subtitle || "")); return body; })(),
        element("div", "cover-line", "โรงเรียนบ้านวังด้ง  ·  ฉบับเผยแพร่สาธารณะ")
      );
      return paper;
    }
    const header = element("div", "paper-header");
    header.append(element("span", "series", "WD BOOKS"), element("span", "", "FLIPBOOK PILOT"));
    const content = element("div", "page-content");
    const footer = element("div", "paper-footer");
    footer.append(element("span", "", "โรงเรียนบ้านวังด้ง"), element("span", "folio"));
    paper.append(header, content, footer);
    return paper;
  }

  function appendMarkdown(node, value) {
    const chunks = String(value).split(/(\*\*[^*]+\*\*)/g);
    chunks.forEach(chunk => {
      if (chunk.startsWith("**") && chunk.endsWith("**")) node.append(element("strong", "", chunk.slice(2, -2)));
      else node.append(document.createTextNode(chunk));
    });
  }

  function contentBlock(value, kind) {
    const text = String(value || "").replace(/\r\n/g, "\n");
    const p = element(kind === "title" ? "h2" : "p", kind === "title" ? "" : kind);
    if (kind === "title" || kind === "chapter-label") p.textContent = text;
    else appendMarkdown(p, text);
    // Keep line breaks visible for prose without parsing arbitrary markup.
    p.style.whiteSpace = "pre-line";
    return p;
  }

  function contentFits(paper) {
    const area = paper.querySelector(".page-content");
    return area.scrollHeight <= area.clientHeight + 1;
  }

  function splitSegments(text, granular) {
    if (typeof Intl.Segmenter === "function") {
      return [...new Intl.Segmenter("th", { granularity: granular }).segment(text)].map(item => item.segment);
    }
    return granular === "grapheme" ? Array.from(text) : (text.match(/\s+|[^\s]+/g) || []);
  }

  function paginate() {
    // Capture the current relative page within its chapter before changing font/viewport.
    const oldSource = visibleSourceIndex();
    const oldChapter = Number(state.pages[oldSource]?.dataset.chapter ?? -1);
    const anchor = positionModel.capture(state.chapters, state.pages.length, oldSource, oldChapter);
    measure.replaceChildren();
    const rect = bookNode.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    // A nested iOS PWA dialog can load its iframe before WebKit assigns layout.
    // Do not count or render pages until both the frame and its paper have height.
    if (w < 120 || h < 300) throw new Error("FLIP_LAYOUT_PENDING");
    measure.style.width = Math.round(w / step()) + "px";
    measure.style.height = h + "px";
    const probe = createSheet(-1, false);
    measure.replaceChildren(probe);
    const area = probe.querySelector(".page-content");
    if (!area || area.clientHeight < 100 || area.clientWidth < 90)
      throw new Error("FLIP_LAYOUT_PENDING");
    measure.replaceChildren();
    state.pages = [createSheet(-1, true)];
    state.chapters = [];
    let current = null;
    let section = -1;
    function freshPage(chapterIndex) {
      const paper = createSheet(chapterIndex, false);
      measure.replaceChildren(paper);
      state.pages.push(paper);
      current = paper;
      return paper;
    }
    function tryAppend(node) {
      const area = current.querySelector(".page-content");
      area.append(node);
      if (contentFits(current)) return true;
      node.remove();
      return false;
    }
    function appendWhole(text, kind) {
      const node = contentBlock(text, kind);
      if (tryAppend(node)) return;
      freshPage(section);
      if (tryAppend(node)) return;
      // One block may exceed the entire page: split it rather than clipping it.
      let remaining = splitSegments(String(text).replace(/\*\*/g, ""), "word");
      while (remaining.length) {
        let low = 1, high = remaining.length, best = 0;
        while (low <= high) {
          const mid = (low + high) >> 1;
          const candidate = contentBlock(remaining.slice(0, mid).join(""), kind);
          const fits = tryAppend(candidate);
          candidate.remove();
          if (fits) { best = mid; low = mid + 1; } else high = mid - 1;
        }
        if (best === 0) {
          if (current.querySelector(".page-content").children.length) {
            freshPage(section);
            continue;
          }
          // Fallback for a word longer than a page, without losing source text.
          remaining = splitSegments(remaining.join(""), "grapheme");
          const first = contentBlock(remaining[0], kind);
          if (!tryAppend(first)) throw new Error("ข้อความหนึ่งตัวอักษรสูงกว่าหน้ากระดาษ");
          remaining.shift();
        } else {
          const part = remaining.splice(0, best).join("");
          if (!tryAppend(contentBlock(part, kind))) throw new Error("แบ่งข้อความไม่สำเร็จ");
        }
        if (remaining.length) freshPage(section);
      }
    }

    book.pages.forEach((source, index) => {
      section = index;
      freshPage(section);
      state.chapters.push({ label: source.title || "บท " + (index + 1), page: state.pages.length - 1 });
      if (source.kicker) appendWhole(source.kicker, "chapter-label");
      if (source.title) appendWhole(source.title, "title");
      (source.paragraphs || []).forEach(text => appendWhole(text, "paragraph"));
      (source.bullets || []).forEach(text => appendWhole(text, "bullet"));
      if (source.tip) appendWhole(source.tip, "tip");
      // This selected pilot book uses only title/kicker/paragraphs/bullets/tip.
    });

    state.pages.forEach((paper, index) => {
      const folio = paper.querySelector(".folio");
      if (folio) folio.textContent = String(index).padStart(2, "0");
    });
    // Preserve approximate reading progress within the current chapter.
    let target = positionModel.restore(state.chapters, state.pages.length, anchor);
    if (state.initialChapter !== null && Number.isInteger(state.initialChapter)) {
      target = state.chapters[state.initialChapter]?.page ?? 0;
      state.initialChapter = null;
    }
    mountEngine(target);
  }


  function makeSheet(paper, sourceIndex, density) {
    const sheet = element("div", "corner-sheet");
    sheet.dataset.sourceIndex = String(sourceIndex);
    if (density) sheet.dataset.density = density;
    sheet.append(paper.cloneNode(true));
    return sheet;
  }
  function makeBackCover() {
    const paper = element("div", "paper cover back-cover");
    paper.append(element("div", "cover-top", "WD BOOKS / THE END"),
      element("div", "cover-design", "W"),
      element("div", "cover-title", "ขอบคุณที่อ่าน"),
      element("div", "cover-line", "โรงเรียนบ้านวังด้ง"));
    return paper;
  }
  function buildSheets() {
    const order = cornerModel.order(state.pages.length, state.renderSingle);
    state.engineMap = order;
    return order.map(index => {
      if (index === -2) return makeSheet(makeBackCover(), -2, "hard");
      if (index === -1) return makeSheet(blank(), -1);
      return makeSheet(state.pages[index], index, index === 0 ? "hard" : undefined);
    });
  }
  function visibleSourceIndex() {
    if (!state.engine) return 0;
    return cornerModel.firstReadable(state.engine.getCurrentPageIndex(), state.engineMap, state.renderSingle);
  }
  function renderStatus() {
    if (!state.engine) return;
    const index = state.engine.getCurrentPageIndex();
    const total = state.engine.getPageCount();
    const readable = visibleSourceIndex();
    const info = cornerModel.status(index, state.engineMap, state.renderSingle);
    el("progress").textContent = info.label;
    el("progressFill").style.width = Math.round(100 * info.shown / Math.max(1, state.pages.length - 1)) + "%";
    el("prev").disabled = index === 0;
    el("next").disabled = cornerModel.spreadStart(index, state.renderSingle) >= total - (state.renderSingle ? 1 : 2);
    const chapter = state.pages[readable] && readable > 0 ? state.pages[readable].dataset.chapter : "-1";
    chapterSelect.value = chapter === undefined ? "-1" : String(chapter);
    stage.dataset.dragState = "ready";
    // Optional same-origin host can sync chapter on exit without mutating reader state here.
    if (state.hasInteracted && window.parent !== window && Number(chapter) >= 0) {
      window.parent.postMessage({
        type: "wd:flip05:chapter", bookId: book.id, chapter: Number(chapter)
      }, window.location.origin);
    }
  }
  function mountEngine(sourcePage) {
    if (!window.St || typeof window.St.PageFlip !== "function") {
      fail("ไม่พบ StPageFlip self-hosted bundle");
      return;
    }
    state.rebuilding = true;
    try {
      if (state.engine) {
        try { state.engine.destroy(); }
        catch (error) { console.warn("FLIP-04 engine destroy", error); }
        state.engine = null;
      }
      bookNode.replaceChildren();
      state.renderSingle = isSingle();
      const root = element("div", "corner-book");
      bookNode.append(root);
      const sheets = buildSheets();
      root.replaceChildren(...sheets);
      const bounds = bookNode.getBoundingClientRect();
      const width = Math.round(bounds.width / (state.renderSingle ? 1 : 2));
      const height = Math.round(bounds.height);
      if (width < 120 || height < 240) throw new Error("พื้นที่หนังสือเล็กเกินไป");
      const engine = new window.St.PageFlip(root, {
        width, height, size: "fixed", autoSize: false, showCover: true,
        usePortrait: state.renderSingle, drawShadow: !state.motionOff,
        flippingTime: state.motionOff ? 1 : 750, maxShadowOpacity: 0.45,
        mobileScrollSupport: false, useMouseEvents: !state.motionOff,
        disableFlipByClick: true, swipeDistance: 35,
        startPage: 0
      });
      state.engine = engine;
      engine.on("flip", event => {
        if (event.data !== 0) {
          state.hasInteracted = true;
          stage.classList.add("has-interacted");
        }
        renderStatus();
      });
      engine.on("changeOrientation", renderStatus);
      engine.on("changeState", event => {
        if (["user_fold", "fold_corner", "flipping"].includes(event.data)) {
          state.hasInteracted = true;
          stage.classList.add("has-interacted");
        }
      });
      engine.loadFromHTML(sheets);
      const target = sourcePage === -2 ? sheets.length - 1 :
        cornerModel.sourceToEngine(sourcePage, state.renderSingle);
      engine.turnToPage(Math.min(sheets.length - 1, target));
      if (state.hasInteracted) stage.classList.add("has-interacted");
      renderStatus();
    } catch (error) {
      console.error("FLIP-07 engine mount:", error);
      state.engine = null;
      throw error; // Let the shared retry/error boundary report the failure.
    } finally {
      state.rebuilding = false;
    }
  }
  function move(direction) {
    const engine = state.engine;
    if (!engine || state.rebuilding) return;
    state.hasInteracted = true;
    stage.classList.add("has-interacted");
    if (direction > 0) {
      if (state.motionOff) engine.turnToNextPage();
      else engine.flipNext("bottom");
    } else {
      if (state.motionOff) engine.turnToPrevPage();
      else engine.flipPrev("bottom");
    }
    // flip event updates controls when the sheet settles.
  }
  function repaginate() {
    if (state.rebuilding) return;
    window.clearTimeout(state.retryTimer);
    try {
      paginate();
      state.layoutRetries = 0;
      el("error").hidden = true;
      delete document.querySelector(".reading-surface").dataset.error;
    } catch (error) {
      if (error?.message === "FLIP_LAYOUT_PENDING" && state.layoutRetries++ < 20) {
        // Wait for iframe paint/fonts/viewport to stabilize; never paginate 0px pages.
        state.retryTimer = window.setTimeout(repaginate, 130);
        return;
      }
      console.error("FLIP-07 page layout", error, {
        frame: bookNode.getBoundingClientRect().toJSON?.() || null,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      });
      fail("จัดหน้ากระดาษไม่สำเร็จ กรุณากดกลับไปอ่าน แล้วลองเปิดใหม่");
    }
  }
  function init() {
    if (!book || !book.pages.length) return fail("หนังสือเล่มนี้ยังไม่เปิดให้ทดลองโหมดพลิกกระดาษ");
    el("bookTitle").textContent = book.title;
    chapterSelect.append(element("option", "", "หน้าปก"));
    chapterSelect.lastElementChild.value = "-1";
    book.pages.forEach((item, index) => {
      const option = element("option", "", (index + 1) + ". " + (item.title || "บทที่ " + (index + 1)));
      option.value = String(index); chapterSelect.append(option);
    });
    chapterSelect.value = "-1";
    motionButton.setAttribute("aria-pressed", String(state.motionOff));
    el("prev").addEventListener("click", () => move(-1));
    el("next").addEventListener("click", () => move(1));
    chapterSelect.addEventListener("change", () => {
      const i = Number(chapterSelect.value);
      const sourcePage = i < 0 ? 0 : (state.chapters[i]?.page || 0);
      const enginePage = cornerModel.sourceToEngine(sourcePage, state.renderSingle);
      state.engine?.turnToPage(enginePage);
      state.hasInteracted = true;
      stage.classList.add("has-interacted");
      renderStatus();
    });
    fontSelect.addEventListener("change", () => {
      state.font = Number(fontSelect.value);
      document.documentElement.style.setProperty("--font-scale", String(state.font / 100));
      repaginate();
    });
    motionButton.addEventListener("click", () => {
      state.motionOff = !state.motionOff;
      motionButton.setAttribute("aria-pressed", String(state.motionOff));
      const sourcePage = visibleSourceIndex();
      mountEngine(Math.max(0, sourcePage));
    });
    stage.addEventListener("keydown", event => {
      if (event.target !== stage) return;
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    });
    window.addEventListener("resize", () => {
      window.clearTimeout(state.resizeTimer);
      state.resizeTimer = window.setTimeout(repaginate, 220);
    });
    if (typeof reducedSystem.addEventListener === "function") {
      reducedSystem.addEventListener("change", event => {
        if (event.matches && !state.motionOff) {
          state.motionOff = true;
          motionButton.setAttribute("aria-pressed", "true");
          mountEngine(Math.max(0, visibleSourceIndex()));
        }
      });
    }
    // WebKit may report 0-size frames during the initial deferred-script pass.
    window.requestAnimationFrame(() => window.requestAnimationFrame(repaginate));
    // Sarabun can arrive after initial layout; reflow once the font becomes ready.
    if (document.fonts?.ready) document.fonts.ready.then(() => {
      if (!state.rebuilding && state.engine) repaginate();
    }).catch(() => {});
    // iOS iframe/dialog changes are not always accompanied by a window resize.
    if (typeof window.ResizeObserver === "function") {
      const observer = new window.ResizeObserver(entries => {
        const rect = entries[0]?.contentRect;
        if (!rect || rect.width < 120 || rect.height < 300 || state.rebuilding) return;
        const next = Math.round(rect.width) + "x" + Math.round(rect.height);
        if (next === state.lastLayoutSize) return;
        state.lastLayoutSize = next;
        window.clearTimeout(state.resizeTimer);
        state.resizeTimer = window.setTimeout(repaginate, 140);
      });
      observer.observe(bookNode);
    }
  }
  try { init(); } catch (error) { console.error(error); fail("เกิดข้อผิดพลาดระหว่างเปิดตัวทดลอง"); }
})();