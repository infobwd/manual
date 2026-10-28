/** UI-MIG-02 isolated sample catalog filters; no PWA, storage or network. */
export type CatalogBook = {
  id: string;
  title: string;
  category: string;
  favorite: boolean;
};
export type CatalogFilter = {
  query?: string;
  favoritesOnly?: boolean;
  category?: string;
};

export function filterCatalog<T extends CatalogBook>(
  books: readonly T[],
  { query = "", favoritesOnly = false, category = "all" }: CatalogFilter = {},
): T[] {
  const search = query.normalize("NFC").trim().toLocaleLowerCase("th");
  return books.filter(book =>
    (!favoritesOnly || book.favorite) &&
    (category === "all" || book.category === category) &&
    `${book.title} ${book.category}`.normalize("NFC").toLocaleLowerCase("th").includes(search)
  );
}
