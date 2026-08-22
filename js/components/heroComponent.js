/**
 * Hero component
 * ----------------
 * Renders the homepage's large featured stage plus the vertical selector
 * rail from the mockups. Art is generated procedurally from each app's
 * "hero" gradient/accent (original abstract compositions - diagonal
 * shards, orbits, waveforms - never reproductions of any third-party
 * artwork), so every featured app gets a distinct look driven purely by
 * catalog data.
 *
 * A seeded-per-app shape picker keeps the same app looking the same way
 * every time, while different apps get visibly different scenes.
 */
const HeroComponent = (function () {
  function shapeSeed(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return h;
  }

  /** Abstract geometric scene: diagonal shards + orbit rings, tuned to the app's accent color. */
  function renderArtSvg(app) {
    const accent = app.hero.accent || "#ffffff";
    const seed = shapeSeed(app.id);
    const shardCount = 3 + (seed % 3);
    let shards = "";
    for (let i = 0; i < shardCount; i++) {
      const x = 40 + ((seed >> (i * 3)) % 8) * 30;
      const w = 60 + ((seed >> (i * 2)) % 5) * 14;
      const op = 0.06 + (i % 3) * 0.05;
      shards += `<polygon points="${x},0 ${x + w},0 ${x + w - 90},600 ${x - 90},600" fill="${accent}" opacity="${op.toFixed(2)}" />`;
    }
    const cx = 260 + (seed % 120);
    const cy = 180 + (seed % 90);
    const orbits = [0, 1, 2].map((i) => {
      const r = 60 + i * 46;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${accent}" stroke-opacity="${0.35 - i * 0.09}" stroke-width="1.5" />`;
    }).join("");
    const dot = `<circle cx="${cx}" cy="${cy}" r="5" fill="${accent}" opacity="0.9" />`;

    return `
      <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${app.name} artwork">
        <rect width="600" height="600" fill="${app.hero.bg.startsWith('linear') ? 'url(#g-' + app.id + ')' : app.hero.bg}" />
        ${app.hero.bg.startsWith("linear") ? `
          <defs>
            <linearGradient id="g-${app.id}" x1="0%" y1="0%" x2="100%" y2="100%">
              ${cssGradientToSvgStops(app.hero.bg)}
            </linearGradient>
          </defs>` : ""}
        ${shards}
        ${orbits}
        ${dot}
      </svg>`;
  }

  /** Very small parser: turns "linear-gradient(135deg,#a 0%,#b 100%)" into <stop> tags. */
  function cssGradientToSvgStops(css) {
    const inner = css.slice(css.indexOf("(") + 1, css.lastIndexOf(")"));
    const parts = inner.split(",").map((s) => s.trim());
    const stops = parts.filter((p) => p.startsWith("#"));
    if (!stops.length) return `<stop offset="0%" stop-color="#2E3192"/><stop offset="100%" stop-color="#1f2168"/>`;
    return stops.map((s, i) => {
      const [color, pct] = s.split(/\s+/);
      const offset = pct || `${Math.round((i / Math.max(stops.length - 1, 1)) * 100)}%`;
      return `<stop offset="${offset}" stop-color="${color}"/>`;
    }).join("");
  }

  function renderSelector(app, isActive) {
    return `
      <button class="eol-selector ${isActive ? "active" : ""}"
              data-hero-select="${app.id}"
              style="background:${app.icon.bg}"
              aria-pressed="${isActive}"
              aria-label="Show ${app.name}">
        <span class="eol-selector-icon" style="color:${app.icon.fg}">${app.icon.glyph}</span>
      </button>`;
  }

  function renderStage(app, activeIndex = 0, total = 1) {
    const thumbs = (app.screenshots || []).slice(0, 3).map((s) =>
      `<div class="win95-raised" style="background:${s.bg}"></div>`
    ).join("");

    // Small vertical scroll-position indicator on the hero's left edge -
    // a nod to the horizontal-panning position markers in the reference
    // mockups. Purely visual feedback for "which of N featured apps is
    // showing"; the selector rail to the left of the whole hero block is
    // still what's clickable.
    const thumbPct = total > 1 ? 100 / total : 100;
    const topPct = total > 1 ? (activeIndex / total) * 100 : 0;
    const scrollbar = total > 1 ? `
      <div class="eol-hero-scrollbar" aria-hidden="true">
        <div class="eol-hero-scrollbar-track"></div>
        <div class="eol-hero-scrollbar-thumb" style="height:${thumbPct}%; top:${topPct}%"></div>
      </div>` : "";

    return `
      <button class="eol-hero-stage" data-nav="details" data-id="${app.id}" aria-label="Open ${app.name}">
        <div class="eol-hero-art-wrap">
          ${scrollbar}
          <div class="eol-hero-art">${renderArtSvg(app)}</div>
          <div class="eol-hero-thumbs">${thumbs}</div>
        </div>
        <div class="eol-hero-info">
          <span class="eol-hero-eyebrow">Featured on EOLStore</span>
          <h2 class="eol-hero-title">${app.name}</h2>
          <p class="eol-hero-desc">${app.shortDescription}</p>
          <div class="eol-hero-meta">
            <span class="eol-stars" aria-hidden="true">${formatStars(app.rating)}</span>
            <span>${formatCount(app.ratingCount)} ratings</span>
            <span>&middot;</span>
            <span>${app.price}</span>
          </div>
        </div>
      </button>`;
  }

  /** Renders the full hero block: selector rail + stage for the app at `activeIndex`. */
  function render(featuredApps, activeIndex) {
    if (!featuredApps.length) {
      return `<div class="eol-empty-state"><div class="glyph">&#9635;</div>No featured applications yet.</div>`;
    }
    const active = featuredApps[activeIndex] || featuredApps[0];
    const selectors = featuredApps.map((app, i) => renderSelector(app, i === activeIndex)).join("");
    return `
      <div class="eol-hero">
        <div class="eol-hero-selectors">${selectors}</div>
        <div class="eol-hero-stage-wrap">${renderStage(active, activeIndex, featuredApps.length)}</div>
      </div>`;
  }

  return { render, renderStage, renderSelector };
})();
