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
