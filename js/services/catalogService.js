/**
 * Catalog service
 * ----------------
 * The single place that knows how to load catalog.json. UI code never
 * fetches JSON directly - it asks this service. That means swapping the
 * local file for "https://YOUR-SERVER/catalog.json" (EOLConfig.catalogUrl)
 * requires no changes anywhere else in the project.
 */
const CatalogService = (function () {
  let _catalog = null; // { categories: [...], apps: [App...] }
  let _loadingPromise = null;

  async function load() {
    if (_catalog) return _catalog;
    if (_loadingPromise) return _loadingPromise;

    _loadingPromise = fetch(EOLConfig.catalogUrl, { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(`Catalog request failed: ${res.status}`);
        return res.json();
      })
      .then((raw) => {
        _catalog = {
          storeName: raw.storeName || EOLConfig.storeName,
          categories: raw.categories || [],
          apps: (raw.apps || []).map(createApp)
        };
        return _catalog;
      })
      .catch((err) => {
        console.error("EOLStore: failed to load catalog", err);
        _catalog = { storeName: EOLConfig.storeName, categories: [], apps: [] };
        return _catalog;
      });

    return _loadingPromise;
  }

  async function getAllApps() {
    const catalog = await load();
    return catalog.apps;
  }

  async function getCategories() {
    const catalog = await load();
    return catalog.categories;
  }

  async function getAppById(id) {
    const apps = await getAllApps();
    return apps.find((a) => a.id === id) || null;
  }

  async function getAppsByCategory(categoryId) {
    const apps = await getAllApps();
    return apps.filter((a) => a.category === categoryId);
  }

  async function getFeaturedApps() {
    const apps = await getAllApps();
    return apps
      .filter((a) => a.featured)
      .sort((a, b) => a.featuredOrder - b.featuredOrder);
  }

  async function getTopByDownloads(limit = 8) {
    const apps = await getAllApps();
    return [...apps].sort((a, b) => b.downloads - a.downloads).slice(0, limit);
  }

  async function getNewReleases(limit = 8) {
    const apps = await getAllApps();
    return [...apps]
      .filter((a) => a.releaseDate)
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
      .slice(0, limit);
  }

  return {
    load,
    getAllApps,
    getCategories,
    getAppById,
    getAppsByCategory,
    getFeaturedApps,
    getTopByDownloads,
    getNewReleases
  };
})();
