# EOLStore

EOLStore ("Everyoneonline") — a Windows 8.1 Metro/Store-style app storefront,
built first as a website and structured for a future Windows 8.1 Metro/APPX
conversion.

## Running it locally

No build step, no dependencies. From this folder:

```
python -m http.server 8080
```

Then open `http://localhost:8080/index.html`. (Any static file server works —
IIS, `npx serve`, VS Code Live Server, etc.)

## One thing changed from your brief, on purpose

Your mockups' featured area uses actual Halo / Spartan Assault promotional
art. That artwork is Microsoft/343 Industries' copyrighted IP, so I couldn't
reproduce it pixel-for-pixel. Instead, `js/components/heroComponent.js`
procedurally generates an original abstract scene (diagonal shards + orbit
rings) from each app's `hero.bg` / `hero.accent` catalog fields — same
diagonal-Metro *composition* as your reference, different actual artwork.
When you're ready, drop real hero images into `images/<app>/hero.jpg` and
point `hero.bg` at them; the layout doesn't change.

Everything else — blue header, tile layout, spacing, selector rail,
navigation structure — follows your mockups directly.

## Project structure

```
EOLStore/
├── index.html              Shell: header/nav chrome + script includes
├── css/metro.css            All styling (Metro tiles, diagonal backdrop, etc.)
├── data/catalog.json        The entire app catalog — see "Catalog" below
└── js/
    ├── config.js             Catalog URL, rotation timing, storage keys
    ├── models.js             App record shape + formatters (size/date/stars)
    ├── navigation.js         Hash router + header nav state
    ├── ui.js                 Shared data-nav click delegation
    ├── app.js                Bootstraps routes, wires header search
    ├── services/
    │   ├── catalogService.js   Fetches/caches catalog.json
    │   ├── searchService.js    Name/desc/category/publisher/tag search
    │   ├── featuredService.js  Featured selection + shuffle/rotation logic
    │   └── myAppsService.js    Simulated install state (localStorage)
    ├── components/
    │   ├── tileComponent.js    Small + list-style app cards
    │   ├── heroComponent.js    Hero stage + vertical selector rail
    │   └── categoryComponent.js Category tiles
    └── pages/
        ├── homePage.js, appsPage.js, gamesPage.js
        ├── categoriesPage.js, categoryDetailPage.js
        ├── searchPage.js, detailsPage.js, myAppsPage.js
```

UI never touches `catalog.json` directly — everything goes through
`CatalogService`, so swapping the data source is a one-line change (see
below).

## Catalog

`data/catalog.json` holds `categories` and `apps`. Each app supports every
field from your spec: id, name, description, publisher, version, category,
icon, hero image, screenshots, package URL, size, release date, rating,
downloads, tags, changelog, minimum Windows version, architectures, and
featured status. The 20 sample apps are original/fictional (Nova Strike,
TuneCrate, Chatterbox, etc.) rather than real branded apps, so the catalog
is genuinely yours to reskin.

## Pointing at your IIS server

Change one line in `js/config.js`:

```js
catalogUrl: "https://YOUR-SERVER/catalog.json",
```

Keep your IIS layout as planned:

```
MyStore/
├── catalog.json
├── apps/*.appx(bundle) / *.msix(bundle)
└── images/<app>/icon.png, hero.jpg, screenshot*.jpg
```

`packageUrl` values in the catalog already use this relative shape
(`/apps/<id>/<file>.appxbundle`), so they resolve correctly once the JSON is
served from IIS.

## Featured system

- Homepage loads every app flagged `"featured": true`, shuffles the order
  (`FeaturedService.getFeaturedSet`), and picks a random starting hero each
  load — refresh the page a few times to see it change.
- Clicking a selector swaps the hero immediately and resets the rotation
  timer so the manual pick sticks around.
- It auto-advances every `EOLConfig.featuredRotationIntervalMs` (6s by
  default) if left alone.
- All of this reads only `app.featured` / `app.featuredOrder` — control it
  entirely from `catalog.json`, no code changes needed.

## My Apps / install state

The browser can't install a real Windows package, so `myAppsService.js`
simulates "installed" state in `localStorage` — install/update/launch all
work and persist across reloads, but "Launch" is honest about what it is (an
alert explaining the real launch happens in the future APPX client). This
service is the one piece designed to be swapped wholesale for real
`Windows.ApplicationModel` package APIs later; every calling page already
treats it as an async black box.

## Migrating to Windows 8.1 Metro/APPX

Nothing here depends on Windows 10/11-only APIs. The path forward:

1. Wrap this same HTML/CSS/JS in a Windows 8.1 JS/HTML app project (or
   reimplement the pages as XAML views reusing `catalogService`/
   `searchService`/`featuredService` as plain JS/TS modules — they have no
   DOM dependency and translate directly).
2. Replace `myAppsService.js`'s localStorage calls with
   `Windows.ApplicationModel.Package` / `PackageManager` install and launch
   APIs.
3. Point `EOLConfig.catalogUrl` at your IIS-hosted `catalog.json`.
4. Package as `.appx`/`.appxbundle` targeting Windows 8.1.

## Asset update (branding, background, category icons, music)

This update added a real asset pipeline plus a few visual/behavior
features, without touching the existing pages, catalog shape, install
flow, or navigation:

```
assets/
├── branding/eolstore-logo.png     ← drop your logo here (see its README.txt)
├── backgrounds/store-background.jpg  ← already in place (your uploaded photo)
├── categories/<id>.png            ← one icon per category id (see README.txt)
├── audio/store-theme.mp3          ← optional custom loop (see README.txt)
└── apps/<id>/...                  ← optional real per-app art (see README.txt)
```

Every path above is also a single value in `EOLConfig.assets` (`js/config.js`)
— nothing else references a literal path, so renaming/relocating a folder
is a one-line change.

**What's wired up already:**
- **Background image** — shown behind every page with a dark overlay for
  readability. Missing file → falls back to the original diagonal Metro
  backdrop automatically (see `wireBackground()` in `js/app.js`).
- **Logo** — shown in the header at a fixed height, true aspect ratio,
  never stretched. Missing file → falls back to the "E" mark
  (`index.html`'s inline `onerror`).
- **Category icons** — each category in `catalog.json` has an `icon`
  path. Missing file → falls back to a plain colored monogram (never an
  emoji), via `UI.imageWithFallback()` in `js/ui.js`.
- **Category showcase rotation** — every category tile (Categories page +
  home's "Browse by category") now cycles its background art every
  `EOLConfig.categoryShowcaseIntervalMs` (3.2s default) through a few apps
  in that category — see `CategoryComponent.initShowcase()`.
- **Looping background music** — the header's music-note button plays
  `assets/audio/store-theme.mp3` on a loop if present; otherwise it
  generates a short original synthesized loop in-browser
  (`js/services/audioService.js`) so the feature works with zero setup.
  Browsers block audio until a user gesture, so playback only starts from
  that button's click — this is normal and not a bug.

**One thing I couldn't use as-supplied:** the three game-cover reference
images (a real title's box art, an Xbox-branded promotional graphic, and
another game's character art) are official third-party promotional
material, and the extended "Windows 98 startup sound" track is a
recreation of Microsoft's trademarked startup jingle. Both are protected
IP, and embedding either would also cut against this store's own
"independent, not affiliated with Microsoft" positioning. The category
rotation and background-music *features* they inspired are fully built —
just pointed at original art/audio instead. Swap in your own licensed
assets at the paths above any time.

