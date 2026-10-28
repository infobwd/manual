import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCatalog } from '../src/catalog-filter.ts';

const books = [
  { id: 'teacher', title: 'คู่มือครู', category: 'การจัดการเรียนรู้', favorite: true },
  { id: 'growth', title: 'แนวทาง WD Growth', category: 'คู่มือระบบ', favorite: true },
  { id: 'assess', title: 'การประเมินเพื่อพัฒนา', category: 'การจัดการเรียนรู้', favorite: false },
  { id: 'admin', title: 'คู่มือบริหารโรงเรียน', category: 'งานบริหาร', favorite: false },
];
const ids = (filter) => filterCatalog(books, filter).map(book => book.id);

test('empty query returns all sample books without mutation', () => {
  assert.deepEqual(ids({}), ['teacher','growth','assess','admin']);
  assert.equal(books.length, 4);
});
test('trim surrounding whitespace in Thai queries', () => {
  assert.deepEqual(ids({ query: '  คู่มือครู  ' }), ['teacher']);
});
test('search by title or category', () => {
  assert.deepEqual(ids({ query: 'การจัดการเรียนรู้' }), ['teacher','assess']);
});
test('English search is case-insensitive', () => {
  assert.deepEqual(ids({ query: 'wd GROWTH' }), ['growth']);
});
test('favorites filter is independent of query', () => {
  assert.deepEqual(ids({ favoritesOnly: true }), ['teacher','growth']);
});
test('category selection uses an exact category match', () => {
  assert.deepEqual(ids({ category: 'งานบริหาร' }), ['admin']);
});
test('favorites, category and search compose without leaking other categories', () => {
  assert.deepEqual(ids({ favoritesOnly: true, category: 'การจัดการเรียนรู้', query: 'ครู' }), ['teacher']);
});
test('a genuine nonmatch returns an empty array', () => {
  assert.deepEqual(ids({ query: 'ไม่พบหนังสือ' }), []);
});
