import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { BookOpen, Library, Settings, Search } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { filterCatalog, type CatalogBook } from "./catalog-filter.ts";
import "./style.css";

type View = "home" | "books" | "settings";
type Theme = "light" | "sepia" | "night";
const categories = [
  { id: "all", label: "ทุกหมวดหมู่" },
  { id: "การจัดการเรียนรู้", label: "การจัดการเรียนรู้" },
  { id: "คู่มือระบบ", label: "คู่มือระบบ" },
  { id: "งานบริหาร", label: "งานบริหาร" },
] as const;

// Public-free preview only: never read real catalog, storage or user records.
const books: CatalogBook[] = [
  { id: "sample-1", title: "คู่มือครู", category: "การจัดการเรียนรู้", favorite: true },
  { id: "sample-2", title: "แนวทาง WD Growth", category: "คู่มือระบบ", favorite: true },
  { id: "sample-3", title: "การประเมินเพื่อพัฒนา", category: "การจัดการเรียนรู้", favorite: false },
  { id: "sample-4", title: "คู่มือบริหารโรงเรียน", category: "งานบริหาร", favorite: false },
];

// Visual QA only: deterministic screenshots can open the Bookshelf directly.
// URL parameters never persist data and cannot select anything outside the
// static preview's allowed views/themes/categories.
function initialPreviewState() {
  const params = new URLSearchParams(window.location.search);
  const requestedView = params.get("view");
  const view: View = requestedView === "books" || requestedView === "settings"
    ? requestedView : "home";
  const requestedTheme = params.get("theme");
  const theme: Theme = requestedTheme === "sepia" || requestedTheme === "night"
    ? requestedTheme : "light";
  const requestedCategory = params.get("category");
  const category = categories.some(item => item.id === requestedCategory)
    ? requestedCategory! : "all";
  const query = (params.get("query") || "").trim().slice(0, 120);
  return {view, theme, category, query};
}
const previewStart = initialPreviewState();

function BookCards({ items }: { items: CatalogBook[] }) {
  return <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
    {items.map(book => <Card key={book.id} className="p-3">
      <div className="book-cover text-sm font-bold">{book.category}</div>
      <h3 className="mt-3 font-semibold">{book.title}</h3>
      <p className="mt-1 text-xs opacity-70">{book.category}</p>
    </Card>)}
  </div>;
}

function App() {
  const [view, setView] = useState<View>(previewStart.view);
  const [theme, setTheme] = useState<Theme>(previewStart.theme);
  const [query, setQuery] = useState(previewStart.query);
  const [homeQuery, setHomeQuery] = useState("");
  const [category, setCategory] = useState(previewStart.category);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [font, setFont] = useState(100);
  const bookshelfSearch = useRef<HTMLInputElement>(null);
  const focusBooksOnOpen = useRef(false);
  const visible = filterCatalog(books, { query, favoritesOnly, category });

  useEffect(() => {
    if (view === "books" && focusBooksOnOpen.current) {
      bookshelfSearch.current?.focus();
      focusBooksOnOpen.current = false;
    }
  }, [view]);

  function openBooks(nextCategory = "all", nextQuery = "") {
    setCategory(nextCategory);
    setQuery(nextQuery);
    setFavoritesOnly(false);
    focusBooksOnOpen.current = true;
    setView("books");
  }
  function navigate(nextView: View) {
    if (nextView === "books") openBooks();
    else setView(nextView);
  }

  return <div data-theme={theme} className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
    <div className="shell">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <strong className="text-2xl">✳ WD Books</strong>
        <span className="text-xs opacity-70">UI-MIG-02 · Isolated React preview</span>
      </header>
      <p className="mt-5 border-l-4 border-[var(--primary)] bg-[var(--hover)] p-3 text-sm">
        ข้อมูลตัวอย่างเท่านั้น · ไม่เชื่อมต่อ Reader, Audio, PWA หรือข้อมูลบนเครื่อง
      </p>

      <main id="main" className="mt-8">
        {view === "home" && <>
          <p className="text-sm opacity-75">คลังคู่มือโรงเรียนบ้านวังด้ง</p>
          <h1 className="mt-2 text-3xl font-bold">หนังสือดี ๆ อ่านต่อได้ทุกวัน</h1>
          <p className="mt-2 opacity-75">ค้นหา เรียนรู้ และกลับมาอ่านต่อได้ง่าย</p>
          <form className="home-search mt-5" role="search" onSubmit={event => {
            event.preventDefault();
            openBooks("all", homeQuery.trim());
          }}>
            <label className="sr-only" htmlFor="reactHomeSearch">ค้นหาหนังสือตัวอย่าง</label>
            <input id="reactHomeSearch" className="search-field" type="search"
              placeholder="ค้นหาหนังสือหรือหัวข้อ…" value={homeQuery}
              onChange={event => setHomeQuery(event.target.value)} />
            <Button type="submit">ค้นหา</Button>
          </form>
          <section className="mt-8" aria-labelledby="homeRecommendations">
            <h2 id="homeRecommendations" className="mb-4 text-xl font-semibold">หนังสือแนะนำ</h2>
            <BookCards items={books} />
          </section>
          <section className="mt-8" aria-labelledby="homeCategories">
            <h2 id="homeCategories" className="mb-3 text-xl font-semibold">เลือกหมวดหมู่</h2>
            <div className="flex flex-wrap gap-2">
              {categories.filter(item => item.id !== "all").map(item =>
                <Button key={item.id} variant="outline" onClick={() => openBooks(item.id)}>
                  {item.label}
                </Button>
              )}
            </div>
          </section>
        </>}

        {view === "books" && <div className="catalog-layout">
          <aside className="catalog-sidebar" aria-labelledby="booksCategoriesTitle">
            <h2 id="booksCategoriesTitle" className="mb-3 text-base font-semibold">หมวดหมู่หนังสือ</h2>
            <div className="catalog-categories">
              {categories.map(item =>
                <Button key={item.id} type="button"
                  variant={category === item.id ? "default" : "outline"}
                  aria-pressed={category === item.id}
                  onClick={() => setCategory(item.id)}
                  className="catalog-category">{item.label}</Button>
              )}
            </div>
          </aside>
          <section className="min-w-0" aria-labelledby="bookshelfTitle">
            <h1 id="bookshelfTitle" className="mb-4 text-3xl font-bold">ชั้นหนังสือ</h1>
            <label className="catalog-search" htmlFor="reactBookSearch">
              <Search aria-hidden="true" size={20} />
              <span className="sr-only">ค้นหาหนังสือในชั้น</span>
              <input ref={bookshelfSearch} id="reactBookSearch" type="search"
                placeholder="ค้นหาหนังสือในชั้น…" value={query}
                onChange={event => setQuery(event.target.value)} />
            </label>
            <div className="catalog-tools mt-4">
              <div className="flex flex-wrap gap-2">
                <Button variant={!favoritesOnly ? "default" : "outline"} type="button"
                  aria-pressed={!favoritesOnly} onClick={() => setFavoritesOnly(false)}>ทั้งหมด</Button>
                <Button variant={favoritesOnly ? "default" : "outline"} type="button"
                  aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(true)}>รายการโปรด</Button>
              </div>
              <output className="catalog-count" aria-live="polite" aria-atomic="true">
                พบ {visible.length} จาก {books.length} เล่มตัวอย่าง
              </output>
            </div>
            <div className="mt-4"><BookCards items={visible} /></div>
            {visible.length === 0 && <p role="status" className="catalog-empty">
              ไม่พบหนังสือที่ตรงกับเงื่อนไข · ลองเปลี่ยนหมวดหรือคำค้น
            </p>}
          </section>
        </div>}

        {view === "settings" && <>
          <h1 className="text-3xl font-bold">ตั้งค่าการอ่าน</h1>
          <Card className="mt-6">
            <h2 className="mb-3 font-semibold">โหมดหน้าจอ</h2>
            <div className="flex flex-wrap gap-2">
              {(["light", "sepia", "night"] as Theme[]).map((option, i) =>
                <Button key={option} variant={theme === option ? "default" : "outline"}
                  aria-pressed={theme === option} onClick={() => setTheme(option)}>
                  {["สว่าง", "ถนอมสายตา", "กลางคืน"][i]}
                </Button>)}
            </div>
            <label className="mt-6 block" htmlFor="font-size">ขนาดตัวอักษร: {font}%</label>
            <input id="font-size" className="mt-2 w-full" type="range"
              min={90} max={160} step={10} value={font}
              onChange={event => setFont(Number(event.target.value))} />
            <p className="mt-4 leading-relaxed" style={{ fontSize: `${font}%` }}>
              ตัวอย่างข้อความภาษาไทย อ่านง่าย สบายตา
            </p>
          </Card>
        </>}
      </main>
    </div>

    <nav className="bottom-nav" aria-label="นำทางต้นแบบ">
      {([
        { id: "home", label: "หน้าหลัก", icon: BookOpen },
        { id: "books", label: "ชั้นหนังสือ", icon: Library },
        { id: "settings", label: "ตั้งค่า", icon: Settings },
      ] as const).map(({ id, label, icon: Icon }) =>
        <Button key={id} variant={view === id ? "default" : "ghost"}
          aria-current={view === id ? "page" : undefined}
          onClick={() => navigate(id)} className="flex flex-col gap-0 px-3 text-xs">
          <Icon aria-hidden="true" size={19} />{label}
        </Button>)}
    </nav>
  </div>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
