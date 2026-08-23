/**
 * Hero component
 * ----------------
 * Renders the Store's featured area exactly like the reference mockup:
 * a collage of several differently-shaped image fragments (not one plain
 * rectangle), a column of plain white vertical rectangles to its left
 * that switch the featured app when clicked, and the app's name/
 * description written into the empty space beside the collage rather
 * than boxed in a card.
 *
 * All art is generated procedurally from each app's own catalog data
 * (hero gradient/accent, screenshot colors) - original abstract
 * compositions, never reproductions of any third-party artwork.
 */
const HeroComponent = (function () {
  function shapeSeed(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return h;
  }

  /** Abstract geometric scene: diagonal shards + orbit rings, tuned to the app's accent color. */
  function renderArtSvg(app, seedOffset = 0) {
    const accent = app.hero.accent || "#ffffff";
    const seed = shapeSeed(app.id) + seedOffset;
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
    const gradId = `g-${app.id}-${seedOffset}`;

    return `
      <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${app.name} artwork">
        <rect width="600" height="600" fill="${app.hero.bg.startsWith('linear') ? `url(#${gradId})` : app.hero.bg}" />
        ${app.hero.bg.startsWith("linear") ? `
          <defs>
            <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
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

  /** Plain white vertical rectangle selector, per the reference mockup - not a colored icon tile. */
  function renderSelector(app, isActive) {
    return `
      <button class="eol-selector ${isActive ? "active" : ""}"
              data-hero-select="${app.id}"
              aria-pressed="${isActive}"
              aria-label="Show ${app.name}">
        <span class="eol-selector-glyph" style="color:${app.icon.bg}">${app.icon.glyph}</span>
      </button>`;
  }

  /**
   * The four-piece collage: one large shard (the app's main art) plus
   * three smaller, differently-clipped fragments built from its
   * screenshot colors - scattered like cut/torn photos, matching the
   * reference mockup rather than a single rectangle.
   */
  function renderCollage(app) {
    const shots = app.screenshots && app.screenshots.length
      ? app.screenshots
      : [{ bg: app.icon.bg }, { bg: app.hero.accent }, { bg: app.icon.bg }];
    const s1 = shots[0] || { bg: app.icon.bg };
    const s2 = shots[1] || shots[0] || { bg: app.icon.bg };
    const s3 = shots[2] || shots[0] || { bg: app.hero.accent };

    return `
      <div class="eol-hero-collage">
        <div class="eol-collage-piece eol-collage-main">${renderArtSvg(app)}</div>
        <div class="eol-collage-piece eol-collage-b win95-raised" style="background:${s1.bg}"></div>
        <div class="eol-collage-piece eol-collage-c win95-raised" style="background:${s2.bg}"></div>
        <div class="eol-collage-piece eol-collage-d win95-raised" style="background:${s3.bg}"></div>
      </div>`;
  }

  function renderStage(app, activeIndex = 0, total = 1) {
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
          ${renderCollage(app)}
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
