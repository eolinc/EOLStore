/**
 * App details page
 * ------------------
 * Route: #/details/:id. Shows everything the brief's data model calls
 * for, and drives its primary action button off MyAppsService so the
 * install/update/launch state is real (if simulated) rather than a static
 * label. The button never claims to install anything the browser can't
 * actually do - see renderPrimaryAction.
 */
const DetailsPage = (function () {
  function renderPrimaryAction(app) {
    const ext = packageExtension(app.packageUrl);
    const installed = MyAppsService.isInstalled(app.id);
    const installedVersion = MyAppsService.getInstalledVersion(app.id);

    if (installed && installedVersion === app.version) {
      return `
        <button class="eol-primary-btn" data-action="launch" data-id="${app.id}">Launch</button>
        <a class="eol-secondary-btn" href="${app.packageUrl}" download>Download package (${ext || "package"})</a>`;
    }
    if (installed && installedVersion !== app.version) {
      return `
        <button class="eol-primary-btn" data-action="update" data-id="${app.id}">Update</button>
        <button class="eol-secondary-btn" data-action="launch" data-id="${app.id}">Launch</button>`;
    }
    return `
      <button class="eol-primary-btn" data-action="install" data-id="${app.id}">Install${ext ? " " + ext : ""}</button>`;
  }

  function renderStatusLine(app) {
    const installed = MyAppsService.isInstalled(app.id);
    if (!installed) return `<span>Not installed</span>`;
    const v = MyAppsService.getInstalledVersion(app.id);
    return v === app.version
      ? `<span>Installed &middot; v${v}</span>`
      : `<span>Installed v${v} &middot; update to v${app.version} available</span>`;
  }

  async function render({ param }) {
    const app = await CatalogService.getAppById(param);
    if (!app) {
      return `<div class="eol-page"><p class="eol-search-hint">This application could not be found.</p></div>`;
    }

    const screenshots = (app.screenshots.length ? app.screenshots : [{ bg: app.icon.bg, caption: app.name }])
      .map((s) => `<div style="background:${s.bg}">${s.caption || ""}</div>`).join("");

    const changelog = app.changelog.length
      ? app.changelog.map((c) => `
          <div class="eol-changelog-item">
            <span class="eol-changelog-version">v${c.version}</span>
            <span class="eol-changelog-notes">${c.notes}</span>
          </div>`).join("")
      : `<p class="eol-search-hint">No changelog available.</p>`;

    const tags = app.tags.length
      ? `<div class="eol-tag-row">${app.tags.map((t) => `<span class="eol-tag">${t}</span>`).join("")}</div>`
      : "";

    const html = `
      <div class="eol-page">
        <div class="eol-page-header">
          <button class="eol-back-btn" data-nav-back aria-label="Go back">&#8592;</button>
        </div>

        <div class="eol-details-hero">
          <div class="eol-details-icon win95-raised">
            <span class="eol-tile-chip eol-details-chip" style="background:${app.icon.bg};color:${app.icon.fg}">${app.icon.glyph}</span>
          </div>
          <div>
            <h1 class="eol-details-title">${app.name}</h1>
            <div class="eol-details-publisher">${app.publisher}</div>
            <div class="eol-details-meta-row">
              <span class="eol-stars" aria-hidden="true">${formatStars(app.rating)}</span>
              <span>${app.rating.toFixed(1)} (${formatCount(app.ratingCount)} ratings)</span>
              <span>&middot;</span>
              <span>${formatCount(app.downloads)} downloads</span>
              <span>&middot;</span>
              <span id="details-status">${renderStatusLine(app)}</span>
            </div>
          </div>
          <div id="details-actions" style="display:flex;gap:10px;align-items:center;">
            ${renderPrimaryAction(app)}
          </div>
        </div>

        <div class="eol-details-body">
          <div>
            <div class="eol-block-title">Screenshots</div>
            <div class="eol-screens-row">${screenshots}</div>

            <div class="eol-block-title">Description</div>
            <p class="eol-desc-text">${app.description}</p>

            <div class="eol-block-title">Tags</div>
            ${tags}

            <div class="eol-block-title">What's new</div>
            ${changelog}
          </div>

          <aside>
            <div class="eol-side-facts">
              <dl style="margin:0">
                <div class="eol-fact"><dt>Version</dt><dd>${app.version}</dd></div>
                <div class="eol-fact"><dt>Category</dt><dd>${app.category}</dd></div>
                <div class="eol-fact"><dt>Price</dt><dd>${app.price}</dd></div>
                <div class="eol-fact"><dt>File size</dt><dd>${formatSize(app.size)}</dd></div>
                <div class="eol-fact"><dt>Release date</dt><dd>${formatDate(app.releaseDate)}</dd></div>
                <div class="eol-fact"><dt>Minimum Windows version</dt><dd>${app.minWindowsVersion}</dd></div>
                <div class="eol-fact"><dt>Architectures</dt><dd>${app.architectures.join(", ")}</dd></div>
                <div class="eol-fact"><dt>Package type</dt><dd>${packageExtension(app.packageUrl) || "\u2014"}</dd></div>
              </dl>
            </div>
          </aside>
        </div>
      </div>`;

    function afterRender(container) {
      function onClick(e) {
        const backBtn = e.target.closest("[data-nav-back]");
        if (backBtn) { history.back(); return; }

        const actionBtn = e.target.closest("[data-action]");
        if (!actionBtn) return;
        const action = actionBtn.dataset.action;

        if (action === "install") MyAppsService.install(app);
        else if (action === "update") MyAppsService.update(app);
        else if (action === "launch") {
          // The browser can't launch a native Windows package - this is
          // exactly the boundary the future APPX client replaces.
          window.alert(`${app.name} would launch here in the Windows 8.1 Metro client.\nThe website simulates installed state only.`);
          return;
        }

        container.querySelector("#details-actions").innerHTML = renderPrimaryAction(app);
        container.querySelector("#details-status").innerHTML = renderStatusLine(app);
      }
      container.addEventListener("click", onClick);
      return () => container.removeEventListener("click", onClick);
    }

    return { html, afterRender };
  }

  return { render };
})();
