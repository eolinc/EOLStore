/**
 * Navigation
 * -----------
 * A tiny hash router. Pages register themselves as render functions keyed
 * by route name; Navigation owns matching the current #hash to a route,
 * updating the active nav-link state, and re-rendering the page container.
 * Keeping this separate from the pages themselves means adding a new
 * section later is just "write a page module + register it here".
 */
const Navigation = (function () {
  const routes = {}; // name -> async (params) => htmlString
  const navLabels = [
    { key: "home", label: "Home" },
    { key: "apps", label: "Apps" },
    { key: "games", label: "Games" },
    { key: "categories", label: "Categories" },
    { key: "myapps", label: "My Apps" }
  ];

  let mainEl = null;
  let headerNavEl = null;

  function register(name, renderFn) {
    routes[name] = renderFn;
  }

  function parseHash() {
    const hash = window.location.hash.replace(/^#\/?/, "");
    const [pathPart, queryPart] = hash.split("?");
    const segments = pathPart.split("/").filter(Boolean);
    const name = segments[0] || "home";
    const param = segments[1] ? decodeURIComponent(segments[1]) : null;
    const query = {};
    if (queryPart) {
      queryPart.split("&").forEach((pair) => {
        const [k, v] = pair.split("=");
        if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || "");
      });
    }
    return { name, param, query };
  }

  function go(hash) {
    window.location.hash = hash;
  }

  function renderHeaderNav(activeName) {
    if (!headerNavEl) return;
    headerNavEl.innerHTML = navLabels.map(({ key, label }) => `
      <button class="eol-nav-link ${activeName === key ? "active" : ""}" data-nav-route="${key}">
        ${label}
      </button>`).join("");
  }

  async function renderCurrentRoute() {
    const { name, param, query } = parseHash();
    const routeName = routes[name] ? name : "home";
    renderHeaderNav(routeName === "details" ? "" : routeName);

    if (!mainEl) return;
    mainEl.setAttribute("aria-busy", "true");
    try {
      if (mainEl._cleanup) { mainEl._cleanup(); mainEl._cleanup = null; }
      const result = await routes[routeName]({ param, query });
      const html = typeof result === "string" ? result : result.html;
      const afterRender = typeof result === "string" ? null : result.afterRender;
      mainEl.innerHTML = html;
      window.scrollTo(0, 0);
      if (afterRender) mainEl._cleanup = afterRender(mainEl) || null;
    } catch (err) {
      console.error("EOLStore: route render failed", err);
      mainEl.innerHTML = `<div class="eol-page"><p class="eol-search-hint">Something went wrong loading this page.</p></div>`;
    } finally {
      mainEl.removeAttribute("aria-busy");
    }
  }

  function init({ main, headerNav }) {
    mainEl = main;
    headerNavEl = headerNav;

    headerNavEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-nav-route]");
      if (!btn) return;
      go("/" + btn.dataset.navRoute);
    });

    UI.wireDynamicHandlers(mainEl);
    window.addEventListener("hashchange", renderCurrentRoute);
    renderCurrentRoute();
  }

  return { register, go, init, parseHash };
})();
