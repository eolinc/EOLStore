/**
 * My Apps page
 * --------------
 * Route: #/myapps. Reads installed state from MyAppsService (localStorage
 * on the website, real Windows package APIs in the future APPX client)
 * and cross-references it against the live catalog so version/update
 * checks always reflect current catalog data.
 */
const MyAppsPage = (function () {
  function renderRow(entry) {
    const { app, installedVersion, updateAvailable } = entry;
    return `
      <div class="eol-myapp-row">
        <div class="eol-tile-art" style="background:${app.icon.bg};color:${app.icon.fg}">${app.icon.glyph}</div>
        <div>
          <div class="eol-list-card-name" style="cursor:pointer" data-nav="details" data-id="${app.id}">${app.name}</div>
          <div class="eol-myapp-versions">
            Installed v${installedVersion}${updateAvailable ? ` &rarr; v${app.version} available` : ""}
          </div>
        </div>
        ${updateAvailable ? `<span class="eol-badge-update">Update</span>` : `<span></span>`}
        <div style="display:flex;gap:8px;">
          ${updateAvailable
            ? `<button class="eol-primary-btn" data-myapp-action="update" data-id="${app.id}">Update</button>`
            : `<button class="eol-primary-btn" data-myapp-action="launch" data-id="${app.id}">Launch</button>`
          }
        </div>
      </div>`;
  }

  async function render() {
    let installed = await MyAppsService.getInstalledApps();

    async function paint(container) {
      installed = await MyAppsService.getInstalledApps();
      const listEl = container.querySelector("#myapps-list");
      listEl.innerHTML = installed.length
        ? installed.map(renderRow).join("")
        : `<div class="eol-empty-state"><div class="glyph">&#9635;</div>
             <p>No apps installed yet.</p>
             <button class="eol-primary-btn" data-nav="route" data-id="apps">Browse apps</button>
           </div>`;
    }

    const html = `
      <div class="eol-page">
        <div class="eol-page-header">
          <h1 class="eol-title">My Apps</h1>
        </div>
        <div id="myapps-list" class="eol-myapps-list">
          ${installed.length
            ? installed.map(renderRow).join("")
            : `<div class="eol-empty-state"><div class="glyph">&#9635;</div>
                 <p>No apps installed yet.</p>
                 <button class="eol-primary-btn" data-nav="route" data-id="apps">Browse apps</button>
               </div>`
          }
        </div>
      </div>`;

    function afterRender(container) {
      async function onClick(e) {
        const btn = e.target.closest("[data-myapp-action]");
        if (!btn) return;
        const id = btn.dataset.myappAction === "update" ? btn.dataset.id : null;
        if (btn.dataset.myappAction === "update") {
          const app = await CatalogService.getAppById(btn.dataset.id);
          if (app) MyAppsService.update(app);
          await paint(container);
        } else if (btn.dataset.myappAction === "launch") {
          const app = await CatalogService.getAppById(btn.dataset.id);
          window.alert(`${app ? app.name : "This app"} would launch here in the Windows 8.1 Metro client.`);
        }
      }
      container.addEventListener("click", onClick);
      return () => container.removeEventListener("click", onClick);
    }

    return { html, afterRender };
  }

  return { render };
})();
