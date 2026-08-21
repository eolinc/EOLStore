/**
 * Categories page
 * -----------------
 * Lists every category from the catalog, each rendered as a Metro tile
 * with its real icon (or a monogram fallback) and a rotating showcase of
 * apps in that category. Clicking one routes to #/category/:id, handled
 * by CategoryDetailPage.
 */
const CategoriesPage = (function () {
  async function render() {
    const [categories, apps] = await Promise.all([
      CatalogService.getCategories(),
      CatalogService.getAllApps()
    ]);

    const appsByCategory = {};
    apps.forEach((app) => {
      (appsByCategory[app.category] = appsByCategory[app.category] || []).push(app);
    });

    const html = `
      <div class="eol-page">
        <div class="eol-page-header">
          <h1 class="eol-title">Categories</h1>
        </div>
        ${CategoryComponent.renderGrid(categories, appsByCategory)}
      </div>`;

    function afterRender(container) {
      return CategoryComponent.initShowcase(container);
    }

    return { html, afterRender };
  }
  return { render };
})();
