(() => {
  "use strict";
  const data = window.WD_LIBRARY_DATA;
  if (!data || !Array.isArray(data.manuals) || !Array.isArray(data.categories)) return;

  const $ = (id) => document.getElementById(id);
  const create = (tag, css, value) => {
    const el = document.createElement(tag);
    if (css) el.className = css;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  const state = { category: "all", query: "", manual: null, page: 0, scale: 1, opener: null };
  const isMobile = window.matchMedia("(max-width: 850px)");
  const statuses = { published: "สาธิต · เปิดอ่าน", review: "รอตรวจรับ", planned: "ตามแผน" };
  const lookup = Object.fromEntries(data.categories.map((c) => [c.id, c]));
  const normalized = (s) => String(s || "").toLocaleLowerCase("th-TH").trim();

  function totalFor(id) {
    return data.manuals.filter((book) => id === "all" || book.category === id).length;
  }
  function selectCategory(id) {
    state.category = id;
    renderCategories();
    renderCatalog();
  }
  function categoryButton(cat, kind) {
    const label = cat.id === "all" ? "ทั้งหมด" : cat.label;
    const button = create("button", "", "");
    button.type = "button";
    button.setAttribute("aria-pressed", String(cat.id === state.category));
    button.classList.toggle(kind === "chips" ? "selected" : "active", cat.id === state.category);
    if (kind === "nav") {
      button.append(create("span", "category-icon", cat.icon));
      button.append(create("span", "", label));
      button.append(create("span", "category-count", String(totalFor(cat.id))));
    } else {
      button.textContent = label;
    }
    button.addEventListener("click", () => selectCategory(cat.id));
    return button;
  }
  function renderCategories() {
    const cats = [{ id: "all", label: "ทั้งหมด", icon: "▦" }, ...data.categories];
    $("categoryNav").replaceChildren(...cats.map((cat) => categoryButton(cat, "nav")));
    $("categoryChips").replaceChildren(...cats.map((cat) => categoryButton(cat, "chips")));
  }
  function renderStats() {
    $("statPublished").textContent = String(data.manuals.filter((b) => b.status === "published").length);
    $("statPending").textContent = String(data.manuals.filter((b) => b.status !== "published").length);
    $("statCategories").textContent = String(data.categories.length);
  }
  function matches(book) {
    if (state.category !== "all" && book.category !== state.category) return false;
    if (!state.query) return true;
    const haystack = [book.title, book.subtitle, book.description, book.audience,
      lookup[book.category]?.label, ...(book.tags || [])].map(normalized).join(" ");
    return haystack.includes(state.query);
  }
  function cardFor(book) {
    const article = create("article", "manual-card");
    const cover = create("div", "book-cover cover-" + (book.color || "forest"));
    cover.append(create("span", "cover-eyebrow", book.coverTop || "MANUAL"));
    cover.append(create("strong", "", book.coverTitle || book.title));
    cover.append(create("span", "cover-subtitle", book.subtitle));
    const body = create("div", "card-body");
    body.append(create("span", "card-category", lookup[book.category]?.label || "คู่มือ"));
    body.append(create("h3", "", book.title));
    body.append(create("p", "", book.description));
    const foot = create("div", "card-footer");
    foot.append(create("span", "card-meta", book.edition + (book.readTime !== "—" ? " · " + book.readTime : "")));
    if (book.status === "published" && book.pages?.length) {
      const open = create("button", "open-book", "เปิดอ่าน ↗");
      open.type = "button";
      open.setAttribute("aria-label", "เปิดหนังสือ " + book.title);
      open.addEventListener("click", () => openBook(book, open));
      foot.append(open);
    } else {
      foot.append(create("span", "pending-text", book.status === "review" ? "ยังไม่เผยแพร่เนื้อหา" : "ยังไม่มีเนื้อหา"));
    }
    body.append(foot);
    const badge = create("span", "card-state" + (book.status === "published" ? " ready" : ""), statuses[book.status] || "ตามแผน");
    article.append(cover, badge, body);
    return article;
  }
  function renderCatalog() {
    const filtered = data.manuals.filter(matches);
    $("manualGrid").replaceChildren(...filtered.map(cardFor));
    $("resultsText").textContent = "แสดง " + filtered.length + " รายการ จาก " + data.manuals.length + " รายการ (รวมรายการที่ยังไม่เผยแพร่)";
    $("emptyResults").hidden = filtered.length > 0;
  }

  const dialog = $("readerDialog");
  function openBook(book, opener) {
    if (book.status !== "published" || !book.pages?.length) return;
    state.manual = book;
    state.page = 0;
    state.scale = 1;
    state.opener = opener;
    $("bookSpread").style.setProperty("--readerScale", String(state.scale));
    $("readerTitle").textContent = book.title;
    $("readerCategory").textContent = (lookup[book.category]?.label || "คู่มือ") + " · " + book.edition;
    renderReader();
    if (!dialog.open) dialog.showModal();
    $("readerClose").focus();
  }
  function pageNode(target, page, index) {
    target.replaceChildren();
    target.classList.toggle("blank-page", !page);
    if (!page) {
      target.append(create("span", "blank-mark", "✳"));
      return;
    }
    target.setAttribute("aria-label", "หน้า " + (index + 1) + " " + page.title);
    target.append(create("div", "page-kicker", page.kicker || "WD SCHOOL MANUAL"));
    target.append(create("h2", "page-heading", page.title));
    (page.paragraphs || []).forEach((text) => target.append(create("p", "page-copy", text)));
    if (page.bullets?.length) {
      const ul = create("ul", "page-list");
      page.bullets.forEach((text) => ul.append(create("li", "", text)));
      target.append(ul);
    }
    if (page.tip) target.append(create("div", "page-callout", page.tip));
    target.append(create("div", "book-page-number", "WD MANUAL LIBRARY  ·  " + (index + 1)));
    target.scrollTop = 0;
  }
  function renderToc() {
    const toc = $("tocItems");
    toc.replaceChildren(...state.manual.pages.map((page, i) => {
      const b = create("button", "", "");
      const displayed = isMobile.matches ? state.page === i : state.page <= i && i < state.page + 2;
      b.classList.toggle("active", displayed);
      b.setAttribute("aria-current", displayed ? "page" : "false");
      b.append(create("span", "toc-number", String(i + 1).padStart(2, "0")));
      b.append(create("span", "", page.title));
      b.addEventListener("click", () => jumpTo(i));
      return b;
    }));
  }
  function renderReader() {
    if (!state.manual) return;
    const count = state.manual.pages.length;
    const mobile = isMobile.matches;
    const first = state.page;
    pageNode($("pageLeft"), state.manual.pages[first], first);
    pageNode($("pageRight"), mobile ? null : state.manual.pages[first + 1], first + 1);
    $("prevPage").disabled = first === 0;
    $("nextPage").disabled = first + (mobile ? 1 : 2) >= count;
    const last = Math.min(first + (mobile ? 1 : 2), count);
    $("pageCounter").textContent = "หน้า " + (first + 1) + (last > first + 1 ? "–" + last : "") + " / " + count;
    $("progressBar").style.width = ((last / count) * 100) + "%";
    renderToc();
  }
  function jumpTo(i) {
    if (!state.manual) return;
    const n = Math.max(0, Math.min(i, state.manual.pages.length - 1));
    state.page = isMobile.matches ? n : Math.floor(n / 2) * 2;
    renderReader();
  }
  function movePage(direction) {
    if (!state.manual) return;
    const step = isMobile.matches ? 1 : 2;
    const next = state.page + (direction * step);
    if (next < 0 || next >= state.manual.pages.length) return;
    const left = $("pageLeft"), right = $("pageRight");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) { jumpTo(next); return; }
    left.classList.add("turning");
    right.classList.add("turning");
    window.setTimeout(() => {
      jumpTo(next);
      left.classList.remove("turning");
      right.classList.remove("turning");
    }, 105);
  }
  $("prevPage").addEventListener("click", () => movePage(-1));
  $("nextPage").addEventListener("click", () => movePage(1));
  $("readerClose").addEventListener("click", () => dialog.close());
  $("fontDecrease").addEventListener("click", () => resize(-.1));
  $("fontIncrease").addEventListener("click", () => resize(.1));
  function resize(amount) {
    state.scale = Math.max(.9, Math.min(1.4, Math.round((state.scale + amount) * 10) / 10));
    $("bookSpread").style.setProperty("--readerScale", String(state.scale));
  }
  dialog.addEventListener("close", () => {
    state.manual = null;
    if (state.opener?.isConnected) state.opener.focus();
    state.opener = null;
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowRight") { event.preventDefault(); movePage(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); movePage(-1); }
  });
  isMobile.addEventListener?.("change", () => {
    if (state.manual) { state.page = isMobile.matches ? state.page : Math.floor(state.page / 2) * 2; renderReader(); }
  });
  $("searchInput").addEventListener("input", (event) => {
    state.query = normalized(event.target.value);
    renderCatalog();
  });
  renderStats();
  renderCategories();
  renderCatalog();
})();
