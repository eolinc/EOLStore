/**
 * My Apps service
 * -----------------
 * The website cannot install real Windows packages from a browser, so this
 * service simulates "installed" state using localStorage. Every method
 * here is written so the future APPX client can swap the storage layer for
 * real Windows.ApplicationModel package APIs without changing callers:
 * isInstalled/getInstalledVersion/install/update all stay the same shape.
 */
const MyAppsService = (function () {
  function readState() {
    try {
      const raw = localStorage.getItem(EOLConfig.storageKeys.myApps);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function writeState(state) {
    try {
      localStorage.setItem(EOLConfig.storageKeys.myApps, JSON.stringify(state));
    } catch (e) {
      /* localStorage unavailable - installs simply won't persist this session */
    }
  }

  function isInstalled(appId) {
    return !!readState()[appId];
  }

  function getInstalledVersion(appId) {
    const state = readState();
    return state[appId] ? state[appId].installedVersion : null;
  }

  /** Simulates installing an app at its current catalog version. */
  function install(app) {
    const state = readState();
    state[app.id] = {
      installedVersion: app.version,
      installedAt: new Date().toISOString()
    };
    writeState(state);
  }

  /** Simulates updating an installed app to its current catalog version. */
  function update(app) {
    install(app);
  }

  function uninstall(appId) {
    const state = readState();
    delete state[appId];
    writeState(state);
  }

  /** Cross-references installed IDs against the live catalog for the My Apps page. */
  async function getInstalledApps() {
    const state = readState();
    const ids = Object.keys(state);
    if (!ids.length) return [];
    const apps = await CatalogService.getAllApps();
    return ids
      .map((id) => {
        const app = apps.find((a) => a.id === id);
        if (!app) return null;
        return {
          app,
          installedVersion: state[id].installedVersion,
          updateAvailable: state[id].installedVersion !== app.version
        };
      })
      .filter(Boolean);
  }

  return {
    isInstalled,
    getInstalledVersion,
    install,
    update,
    uninstall,
    getInstalledApps
  };
})();
