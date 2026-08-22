/**
 * Search page
 * ------------
 * Route: #/search?q=term. Reading the query from the URL (rather than
 * component state) means the header search box and this page's own box
 * both just navigate to a new hash, and results always reflect the URL -
 * shareable/bookmarkable, and consistent with how the rest of the router
 * works.
 */
const SearchPage = (function () {
  async function render({ query }) {
    const q = (query && query.q) || "";
    const results = q ? await SearchService.search(q) : [];

    const html = `
      <div class="eol-page">
        <div class="eol-page-header">
          <h1 class="eol-title">Search</h1>
        </div>
        <form class="eol-searchbox-inline win95-sunken" id="search-page-form" role="search">
          <input type="search" name="q" placeholder="Search for apps" value="${escapeAttr(q)}" autofocus />
          <button type="submit" class="win95-raised" aria-label="Search">&#128269;</button>
        </form>

        <div class="eol-section">
          ${q
            ? `<div class="eol-section-header">
                 <h2 class="eol-section-title">Results for &ldquo;${escapeHtml(q)}&rdquo;</h2>
                 <span class="eol-subtitle">${results.length} found</span>
               </div>
               ${TileComponent.renderListGrid(results)}`
            : `<p class="eol-search-hint">Search by name, publisher, category or tag.</p>`
          }
        </div>
      </div>`;

    function afterRender(container) {
      const form = container.querySelector("#search-page-form");
      function onSubmit(e) {
        e.preventDefault();
        const value = form.elements.q.value.trim();
        Navigation.go(`/search?q=${encodeURIComponent(value)}`);
      }
      form.addEventListener("submit", onSubmit);
      return () => form.removeEventListener("submit", onSubmit);
    }

    return { html, afterRender };
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  return { render };
})();
