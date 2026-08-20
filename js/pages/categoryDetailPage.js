/**
 * Category detail page
 * -----------------------
 * Route: #/category/:id. Shows every app in the given category using the
 * more detailed list-card layout (closer to the "Games by Microsoft
 * Studios" style listing in the mockups).
 */
const CategoryDetailPage = (function () {
  async function render({ param }) {
    const categories = await CatalogService.getCategories();
    const category = categories.find((c) => c.id === param);
    const apps = await CatalogService.getAppsByCategory(param);
    const sorted = [...apps].sort((a, b) => b.downloads - a.downloads);

    if (!category) {
      return `<div class="eol-page"><p class="eol-search-hint">Category not found.</p></div>`;
    }

    return `
      <div class="eol-page">
        <div class="eol-page-header">
          <button class="eol-back-btn" data-nav="route" data-id="categories" aria-label="Back to categories">&#8592;</button>
          <h1 class="eol-title">${category.name}</h1>
          <span class="eol-subtitle">${apps.length} apps</span>
        </div>
        ${TileComponent.renderListGrid(sorted)}
      </div>`;
  }
  return { render };
})();
