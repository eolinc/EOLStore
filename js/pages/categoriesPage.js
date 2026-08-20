/**
 * Categories page
 * -----------------
 * Lists every category from the catalog. Clicking one routes to
 * #/category/:id, handled by CategoryDetailPage.
 */
const CategoriesPage = (function () {
  async function render() {
    const categories = await CatalogService.getCategories();
    const html = `
      <div class="eol-page">
        <div class="eol-page-header">
          <h1 class="eol-title">Categories</h1>
        </div>
        ${CategoryComponent.renderGrid(categories)}
      </div>`;
    return html;
  }
  return { render };
})();
