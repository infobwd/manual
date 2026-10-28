/* WD Books FLIP-02: cover starts on the right in left-to-right books.
 * Pure model, separate from the legacy reader and public catalog. */
(function (scope) {
  "use strict";
  function maxPosition(pageCount, single) {
    const last = Math.max(0, pageCount - 1);
    if (single || last === 0) return last;
    return last % 2 === 1 ? last : last + 1;
  }
  function positionForPage(index, pageCount, single) {
    if (pageCount < 1) return 0;
    const page = Math.max(0, Math.min(pageCount - 1, Math.trunc(index) || 0));
    if (single || page === 0) return page;
    return page % 2 === 1 ? page : page + 1;
  }
  function slots(position, pageCount, single) {
    if (single) return { left: null, right: position, closed: position === 0 };
    if (position === 0) return { left: null, right: 0, closed: true };
    return {
      left: position === 1 ? null : position - 1, // first inside cover is blank
      right: position < pageCount ? position : null, // blank after final even page
      closed: false
    };
  }
  function adjacent(position, direction, pageCount, single) {
    const end = maxPosition(pageCount, single);
    if (direction > 0) {
      const next = position === 0 && !single ? 1 : position + (single ? 1 : 2);
      return next <= end ? next : null;
    }
    if (direction < 0) {
      if (position === 0) return null;
      if (!single && position === 1) return 0;
      return Math.max(0, position - (single ? 1 : 2));
    }
    return null;
  }
  function status(position, pageCount, single) {
    const total = Math.max(0, pageCount - 1);
    if (position === 0) return { label: "หน้าปก", shown: 0, total };
    const sides = slots(position, pageCount, single);
    const first = sides.left != null && sides.left > 0 ? sides.left : sides.right;
    const last = sides.right != null && sides.right > 0 ? sides.right : sides.left;
    const range = first === last ? String(first) : first + "–" + last;
    return { label: "หน้า " + range + " / " + total, shown: last, total };
  }
  scope.WD_FLIPBOOK_SPREAD_MODEL = Object.freeze({
    maxPosition, positionForPage, slots, adjacent, status
  });
})(window);
