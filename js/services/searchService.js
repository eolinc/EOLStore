/**
 * Search service
 * ---------------
 * Pure function search over the in-memory catalog. Kept separate from
 * CatalogService (which only loads data) and from the search page (which
 * only renders results), so the matching logic can be unit-tested or
 * swapped for a server-side search later without touching either.
 */
const SearchService = (function () {
  function normalize(str) {
    return (str || "").toString().toLowerCase();
  }

  /**
   * Scores an app against a query. Higher is more relevant, 0 means "no
   * match". Name matches rank highest, then tags/category/publisher, then
   * description - mirroring how the Store mockups surface exact-name hits
   * first.
   */
  function scoreApp(app, query) {
    const q = normalize(query);
    if (!q) return 0;

    const name = normalize(app.name);
    const publisher = normalize(app.publisher);
    const category = normalize(app.category);
    const description = normalize(app.description);
    const tags = (app.tags || []).map(normalize);

    let score = 0;
    if (name === q) score += 100;
    else if (name.startsWith(q)) score += 60;
    else if (name.includes(q)) score += 40;

    if (tags.some((t) => t === q)) score += 30;
    else if (tags.some((t) => t.includes(q))) score += 15;

    if (category.includes(q)) score += 20;
    if (publisher.includes(q)) score += 15;
    if (description.includes(q)) score += 8;

    return score;
  }

  async function search(query) {
    const apps = await CatalogService.getAllApps();
    if (!query || !query.trim()) return [];

    return apps
      .map((app) => ({ app, score: scoreApp(app, query) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.app);
  }

  return { search };
})();
