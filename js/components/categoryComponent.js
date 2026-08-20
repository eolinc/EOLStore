/**
 * Category component
 * --------------------
 * Renders category tiles from catalog.json's "categories" array, so new
 * categories (or renamed/recolored ones) can be added there without any
 * code change here.
 */
const CategoryComponent = (function () {
  function renderTile(category) {
    return `
      <button class="eol-category-tile" data-nav="category" data-id="${category.id}"
              style="background:${category.color}">
        <span class="name">${category.name}</span>
        <span class="tagline">${category.tagline || ""}</span>
      </button>`;
  }

  function renderGrid(categories) {
    if (!categories.length) return `<p class="eol-search-hint">No categories available.</p>`;
    return `<div class="eol-category-grid">${categories.map(renderTile).join("")}</div>`;
  }

  return { renderTile, renderGrid };
})();
