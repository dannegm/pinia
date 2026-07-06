# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pinia is a personal, mobile-first web map for cataloging places of interest around town (malls, tienditas, restaurants, bus stops, houses, etc.). The owner calls it his "mapa de supervivencia" for himself and his girlfriend — a day-to-day reference tool, not a generic places directory.

**Status: in active development, core scope mostly built.** The scaffold, providers tree, router, database schema, and every feature listed under Features below are implemented and running. Commands: `pnpm dev`, `pnpm build`, `pnpm preview`. Remaining work happens feature-by-feature per the Development process below — update this file after every significant change.

## Stack

- React + Vite 8, plain JavaScript (JSX) — no TypeScript, ever (see Code Conventions)
- Package manager: pnpm. Runtime: Node 24.
- TanStack Router for routing, TanStack Query for async/server state
- nuqs for URL-synced state (e.g. filters/search reflected in the URL)
- Tailwind CSS v4, CSS-based config (`@theme` in `index.css`) — no `tailwind.config.js`
- shadcn/ui built on base-ui primitives (not Radix)
- Icons: Lucide + Lucide-lab
- Typography: Google Fonts imported at the top of `index.css` (before the Tailwind import) — Montserrat. (Previously Atkinson Hyperlegible for low-vision legibility; switched away because in practice it read poorly for the owner — evaluate any future typeface change against actual legibility for him, not just accessibility literature.)
- Map: mapcn (`@mapcn/map`, https://mapcn.dev) — a shadcn-style registry of React map components built on MapLibre GL. Basemap style: a hosted MapTiler style (`streets-v2`), not mapcn's default free CARTO style — requires `VITE_MAPTILER_KEY` (see Custom map style under Features for why).
- Data: Supabase (Postgres), in a dedicated `pinia` schema (not `public`) — see Database
- Routing/directions: **implemented.** OpenRouteService (`VITE_ORS_API_KEY` env var, free tier, no credit card) computes route geometry via `src/queries/route.js`'s `routeQuery(origin, destination)` (plain `fetch` against `/v2/directions/driving-car`, not Supabase — still follows the query-factory convention), returning `{coordinates, distance, duration}` (`distance` is fetched but not currently rendered anywhere — only `duration` shows in `RoutePanel`). mapcn's `MapRoute` (`src/ui/map.jsx`) only renders the resulting line, it does not calculate routes itself.
- No authentication — the app is open-access by design
- Light mode only for now (no dark mode yet)
- Deployment: Vercel, deployed manually by the project owner. `vercel.json` has a single catch-all SPA rewrite (`/(.*)`→`/index.html`) so TanStack Router's client-side routes resolve correctly on refresh/direct-link.

## Build-order rule

Before implementing any map feature, check whether mapcn already provides it — `Controls`, `Markers`, `Popups`, `Routes`, `Arcs`, `GeoJSON`, `Clusters`, or one of its pre-built Blocks (e.g. Store Locator: searchable list synced with map markers, install via `npx shadcn@latest add @mapcn/store-locator`). Check `https://www.mapcn.dev/llms.txt` for the current component/block inventory and links — don't crawl or guess routes beyond what it lists. Same rule for general UI: check shadcn/ui and `src/ui/` before writing anything custom.

If neither has what's needed, ask the owner and design the custom solution together — nothing custom gets built without that conversation first.

Known, already-built exception: the off-screen "beacon" direction-arrow indicator (see Features) has no mapcn equivalent — `src/components/direction-arrow.jsx` is a confirmed custom component (screen-space projection + edge-clamping against the map's current bounds, re-evaluated on every `move`/`zoom` event).

## Database

- Supabase Postgres, dedicated schema `pinia` (the owner's standing convention across all his projects: one schema per project, never the default `public` schema).
- `db.sql` is the canonical, self-contained schema — running it end-to-end on a fresh Supabase project reproduces the full database (tables, RLS policies, grants). It is not a migration history; it always reflects current desired state.
- `migrations/NNN_slug.sql` holds the incremental history. Every schema change goes through the `/migrate` skill (`.agents/skills/migrate`, already adapted for this project's `pinia` schema), which creates the next numbered migration file AND updates `db.sql` in the same step. Never hand-edit `db.sql` directly or write ad-hoc SQL outside this flow.
- No auth, so RLS policies follow an "allow all" pattern (`using (true) with check (true)`) rather than per-user scoping.
- `categories.id` and `places.id` are `text` columns holding a client-generated `nanoid(8)` (via the `nanoid` package), not a DB-generated `uuid` — chosen for shorter, friendlier ids in URLs (`/places/$placeId/edit`, the `?route=id1:id2` query param). `createCategoryMutation`/`createPlaceMutation` (`src/queries/categories.js`/`places.js`) always pass `id: nanoid(8)` explicitly on insert; the columns have no default. `places.category_id` and `system_places.place_id` are `text` too, to match. Migration `002_change_id_columns_to_text.sql` covers the switch from the original `uuid`/`gen_random_uuid()` scheme.
- Deletes cascade: `places.category_id` and `system_places.place_id` are both `on delete cascade` (migration `003_cascade_delete_places_system_places.sql`) — deleting a category deletes its places, and deleting a place deletes any `system_places` row pointing at it. Nothing blocks on FK violations anymore for these; the app instead warns *before* deleting (see Features below) and just lets the cascade happen. `deleteCategoryMutation`/`deletePlaceMutation` (`src/queries/categories.js`/`places.js`) have no special-case error handling for this — callers invalidate `['categories']`/`['places']`/`['system-places']` together on success since a single delete can affect all three tables.
- `categories` has two visibility flags (migration `004_add_visibility_flags_to_categories.sql`): `is_visible boolean not null default true` — a soft per-category toggle ("Visible en el mapa" switch in `CategoryForm`, also an eye-icon button on `/categories`) that hides the category and its places from the list/map; `categoriesQuery()`/`placesQuery()` don't filter on it server-side, filtering happens client-side (`CategoryFilterSelect` only lists visible categories, `placesQuery({ includeHidden })` defaults to excluding places whose category is hidden but callers like `PlaceSelect` pass `includeHidden: true` so hidden-category places stay pickable in forms). `is_secret boolean not null default false` — a hard, unconditional filter applied in both queries (`.eq('is_secret', false)`, ignores `includeHidden`) with no UI to set it; a secret category/its places never appear anywhere in the app regardless of the hidden toggle, and must be set directly in the DB.

## Features (confirmed scope)

Core:
- Full-viewport map; search, filters, the place list, and controls all float over it as overlay UI — no side-by-side panels.
- UI panels (places, categories, settings) follow a confirmed VSCode-style pattern, implemented as real TanStack Router sub-routes (not URL query state): the map lives in a persistent layout, `src/components/map-shell.jsx`, rendered by a pathless `shellRoute` in `src/router.jsx`, and never remounts as panels change. `/`, `/places`, `/places/new`, `/places/$placeId/edit`, `/categories`, `/categories/new`, `/categories/$categoryId/edit`, and `/settings` are all children of `shellRoute` (plus a catch-all `$` route and a `notFoundComponent` on `shellRoute` itself, both rendering `src/pages/not-found.jsx`); each panel's content is a normal page component in `src/pages/*.jsx`. `src/components/panel-nav-buttons.jsx` is the icon rail — full-height on the left edge on desktop (`sm:w-14`), a bottom nav bar on mobile — clicking an icon navigates to its route, clicking the active one navigates back to `/` (closed state). `src/components/panel-container.jsx` renders a single `<Outlet/>` for the active panel: a persistent left sidebar (`w-1/4`, positioned right after the rail) on desktop, or the custom `src/components/mobile-panel-sheet.jsx` bottom sheet (drag-to-dismiss, wired to the same "navigate to `/`" as the rail toggle — see Place-specific below for its mechanics) on mobile. It picks exactly ONE of these two containers via `src/hooks/use-media-query.js` (`useMediaQuery('(min-width: 640px)')`) — never both — because rendering `<Outlet/>` twice would mount the panel's route component twice simultaneously. The map's logical center compensates for both the always-visible rail and the open panel's actual measured width via MapLibre's native `padding` option (`map.easeTo({ padding: {...} })`, panel width measured live via `ResizeObserver`) — this keeps the visual "center" of the visible map area correct instead of the geometric center of the full container. nuqs is still used, but scoped to `/places`'s own URL-synced filter query text and category selection, not panel navigation. A standalone `/search` panel existed early on but was removed — redundant with `/places`'s own filtering.
- Search by place name, category, and address lives inside `/places`: a free-text filter box combined with a category multi-select dropdown — **implemented**, `src/components/category-filter-select.jsx` — its own search input to filter the category list, checkbox-style multi-select rows (dot + icon + label + checkmark), state synced to the URL via nuqs (`useCategoryFilter`, `?categories=id1,id2`). The two filters combine (category selection narrows first, then the text filter searches within that set). The free-text filter is fuzzy, via `fuse.js` (`new Fuse(places, { keys: ['name', 'address', 'category.name', 'notes'], threshold: 0.3 })` in `src/pages/places.jsx`; same pattern for the `/categories` name search). The smaller picker comboboxes (`PlaceSelect`, `CategorySelect`, `PlacePointSelect`) intentionally stay on plain substring `.includes()` matching, not fuse.js.
- Sorting and favorites filter on `/places` — **implemented**: sort by name (alphabetical), date added (default), category name, or distance from the current location, each with an asc/desc toggle, state synced via nuqs (`sort`/`dir`). A "Favoritos" toggle in `CategoryFilterSelect`'s popover filters to `is_favorite` places only. Distance sort is backed by `useGeolocation()` (continuous `watchPosition`) piped through `useStableLocation()` (rounds to 5 decimals, commits after 2.5s of stability) so GPS jitter doesn't constantly re-sort the list, then `haversineDistance()` (`src/helpers/geo.js`) computes km per place. If distance sort is selected with no geolocation available, it falls back to date-added.
- Each place stores a free-text address AND lat/lng coordinates. Pins are placeable via drag-and-drop on the map (mapcn's `Markers` supports this natively via `draggable`/`onDrag`) or by typing coordinates directly.
- Categories have a color plus an icon stored as a single `icon jsonb not null` column on `pinia.categories`, shaped `{ library, name }` — `library` is `'lucide'` (renders via `lucide-react`'s `icons` map) or `'lucide-lab'` (renders via `lucide-react`'s generic `Icon` component with an `iconNode` from `@lucide/lab`). Supabase returns/accepts jsonb columns as plain JS objects already, so query code needs no manual (de)serialization. `src/ui/dynamic-icon.jsx` resolves either shape; always pass the whole `icon` object (`<DynamicIcon icon={category.icon} />`), never just a name string. Icon selection UI: **implemented**, `src/ui/icon-picker.jsx` — a popover with a search input and a `Tabs` switch between "Lucide" and "Lucide Lab", each rendering a searchable `grid-cols-6` icon grid (capped at 120 results) sourced from the generated catalogues `src/constants/lucide-icons.js`/`lucide-lab-icons.js`. Category color picking uses `ColorPicker`/`ColorSelector` (`src/ui/color-picker.jsx`/`color-selector.jsx`).
- Hours: a single free-text field (e.g. "Lun-Vie 4-6pm"), always optional.
- Geolocation: show the current position on the map + a "center on my location" control.
- Map zoom bounds: confirmed — min 9, max 18, default 14 (`MIN_ZOOM`/`MAX_ZOOM`/`DEFAULT_VIEWPORT` in `src/constants/map-defaults.js`). `maxBounds` (pan-limiting lat/lng box): confirmed — none. Panning is unrestricted; don't add a `maxBounds` prop to `<Map>`.
- Zoom is settable via `?zoom=<number>` on both the main map (`map-shell.jsx`) and the embed view (`embed-map-shell.jsx`) — nuqs has no built-in min/max option on its parsers, so `src/helpers/query-params.js` exports `parseAsFloatWithLimits(min, max)`, a reusable factory (built with nuqs' `createParser`) that clamps at parse time; `parseAsZoom` (`src/constants/map-defaults.js`) is just `parseAsFloatWithLimits(MIN_ZOOM, MAX_ZOOM)`, used as `useQueryState('zoom', parseAsZoom.withDefault(DEFAULT_VIEWPORT.zoom))`. Reach for `parseAsFloatWithLimits` directly for any other bounded-number query param, rather than duplicating the clamp logic. This is instead of relying on MapLibre's own `minZoom`/`maxZoom` props to silently clamp an out-of-range initial value.
  - Bidirectional on both the main map and the embed view: `src/components/zoom-sync.jsx` is a small shared component (a child of `<Map>`, using `useMap()` to reach the MapLibre instance) that listens for the map's native `zoomend` event and calls whatever setter it's given — `map-shell.jsx` and `embed-map-shell.jsx` each render `<ZoomSync onZoomChange={setZoom} />` wired to their own `zoom` query state setter. Any zoom change, whether a manual scroll/pinch/`ZoomControl` click or a programmatic `flyTo`/`fitBounds` (centering on a place, fitting a route), keeps `?zoom=` in sync with what's actually on screen. This works safely with no feedback loop because neither shell's `<Map>` has an `onViewportChange` prop, so `src/ui/map.jsx` treats it as uncontrolled and never re-applies the `viewport` prop reactively — `viewport={{center, zoom}}` only seeds the *initial* MapLibre instance. The embed's "Abrir mapa completo" button reads `?zoom=` straight from `window.location.search`, so it always carries over whatever zoom the person last landed on.
- Custom map style: **implemented, but via a different path than originally planned.** `map-shell.jsx`'s `<Map>` now passes `styles={{ light: MAP_STYLE_URL }}`, where `MAP_STYLE_URL` (`src/constants/map-defaults.js`) is a hosted MapTiler style URL (`https://api.maptiler.com/maps/streets-v2/style.json?key=${VITE_MAPTILER_KEY}`) — this is why `VITE_MAPTILER_KEY` is now a required env var and the "no API key required" claim about mapcn's default basemap no longer applies once this style is active.
  - The earlier effort to hand-translate Google Maps JS style JSON (`featureType`/`elementType`/`stylers`) into a custom MapLibre style over the free CARTO Positron tiles is **preserved but dormant** — the owner shelved it, not this MapTiler approach. `src/constants/map-style-base.json`, `src/constants/map-style-sources/*.json`, and `src/constants/map-style.json` still exist and are still buildable, just unreferenced by the app right now.
  - The `/google-to-maplibre-style` skill (`.agents/skills/google-to-maplibre-style/`) still does that translation if this direction is ever revisited: a `mapping.cjs` table (Google featureType/elementType → CARTO Positron layer ids) plus `convert.cjs`, which always rebuilds `map-style.json` from the pristine base + every source file replayed in order. See the skill's `SKILL.md` for the encoded rules and known unsupported zones.
  - To switch back to the CARTO-based custom style: swap `styles={{ light: MAP_STYLE_URL }}` for `styles={{ light: customMapStyle }}` (import from `@/constants/map-style.json`) in `map-shell.jsx`.
- Marker clustering: deferred. mapcn's `Clusters` is a separate GeoJSON-based layer, not directly compatible with per-marker drag/popup interactivity — revisit only if plain markers become visually unmanageable.
- Point Nemo marker: a purely decorative Easter egg, `src/components/point-nemo-marker.jsx` — a permanent marker always rendered at the real-world "Point Nemo" coordinates (oceanic pole of inaccessibility), styled with a `Link2Off` icon; clicking it opens a glitchy "404 / SEÑAL PERDIDA" popup with CRT-scanline/glitch CSS animations (`animate-glitch`, `bg-scanlines`, `animate-crt-flicker` utilities in `src/utilities.css`). Not tied to any data — just a joke.
- Notes markup: **implemented**, `src/helpers/notes.js` parses lightweight markup inside the free-text `notes` field. Whole lines matching `tel|wa|ig|x|tw|fb|tg|url: value` are pulled out and rendered as clickable badges (`src/components/note-badge.jsx`, e.g. a `tel:` line becomes a phone badge, `ig:` an Instagram link). Remaining body text supports `**bold**`, `*italic*`, `#tag`, `!command` inline markup and `-`/`*` list items, rendered by `src/components/notes-viewer.jsx`. Clicking a `#tag` navigates to `/places?q=%23tag` — it re-uses the fuzzy notes search rather than being a real relational tag system.

Place-specific:
- Bus stops ("paradas de camión") and houses are plain place categories — no special fields or map behavior beyond a distinct icon.
- `is_favorite`: boolean per place, independent of the beacon flag, used for quick access (e.g. picking a route origin).
- `is_beacon`: boolean per place. Named "beacon" (not "anchor") deliberately, to avoid colliding with MapLibre's own marker-anchor concept or "waypoint"/route-stop terminology. Any beaconed place gets a persistent off-screen direction arrow when it's outside the viewport — video-game-minimap style. Multiple places can be beaconed at once; the map renders one arrow per active beacon.
- **Implemented**: clicking a place marker opens `src/components/place-popup.jsx` (via mapcn's `MarkerPopup`) — name, category, address, hours, notes, plus favorite (star) and beacon (radar icon) toggle buttons that call `updatePlaceMutation` (`src/queries/places.js`). `src/components/places-layer.jsx` renders one `DirectionArrow` per place with `is_beacon = true` (reusing the same generic component built for the current-location beacon). `hours`/`notes` are now exposed as fields in the create/edit place form (`src/components/place-form.jsx`), not just schema-only.
- Place detail popup navigation row: **fully implemented**, `src/components/place-navigation-row.jsx` — "desde mi ubicación actual" (`useGeolocation`), "desde casa" (`system_places` 'casa' via `systemPlaceQuery`), "desde algún favorito" (popover listing `is_favorite` places) each set an `origin` state that feeds `routeQuery(origin, destination)`; the resulting geometry renders via mapcn's `MapRoute` and the map fits to the route's bounds. An "✕ quitar ruta" button appears once a route is active, clearing it. "Pedir Uber" (deep link via Uber's public universal-link scheme, `m.uber.com/ul/?action=setPickup&dropoff[...]`, no API key needed) builds the URL with `URL`/`URLSearchParams` and `window.open`s it. Known gap: since `MapMarker`'s children (including this row) don't unmount when only the popup visually closes, an active route stays drawn until manually cleared, a different origin is picked, or the page reloads — not tied to popup open/close state. A second entry point exists via right-click: `src/components/place-context-menu.jsx` offers the same "navegar desde casa"/"navegar desde mi ubicación" shortcuts (plus centrar/editar/favorito/beacon/eliminar) and hands off to the same routing flow by emitting `route:set` on the bus. `src/components/place-point-select.jsx` is the combobox used to pick a route origin/destination (mi ubicación / casa / any place, by name/address search).
- Route panel: **implemented**, `src/components/route-panel.jsx` — shows trip duration (`formatDuration`, e.g. "12 min" / "1 h 5 min"); `distance` is fetched by `routeQuery` but not yet rendered. Layout is responsive via `usePanelOffset()` (`src/hooks/use-panel-offset.js` — a small hook deriving fixed `left`/`bottom` pixel offsets from the current route pathname and a `sm:` breakpoint check, not a `ResizeObserver`), stacking vertically on mobile and switching to a row on `sm:` and up. `map-shell.jsx` owns the route-beacon suppression/coloring logic: `shouldShowRouteBeacon` hides the floating direction-arrow for a route endpoint that's already a beaconed place (it has its own persistent marker instead), and `getRouteBeaconColor` colors the arrow using the matched place's category color (falling back to the brand color).
- Deleting a category or place: **implemented**, `src/ui/delete-confirm-dialog.jsx` (generic type-to-confirm dialog, wrapped by `src/components/delete-category-button.jsx` and `delete-place-button.jsx`) — the confirm button stays disabled until the person types the item's exact name. Deleting a category also lists every place that will cascade-delete with it, flagging any that are a system place (`del sistema` badge, checked against `systemPlacesQuery()`). Deleting a place that *is* a system place shows a non-blocking warning ("tendrás que asignar otro") instead of preventing the delete — deletion is never blocked, only warned about, since the DB cascades on delete (see Database).
- Mobile panel sheet mechanics: pointer-based drag-to-dismiss (`setPointerCapture`, `preventDefault()` during an active drag so native scroll doesn't fight it), an 8px move threshold before drag "activates", an 80px release threshold to trigger close, and a 200ms enter/exit transition. shadcn's `Drawer` (`src/ui/drawer.jsx`) is still used elsewhere (e.g. `delete-confirm-dialog.jsx`) — just not for the main panel anymore.

System places:
- A dedicated `system_places` table (key → place reference) instead of one-off boolean flags on `places` for singleton concepts — named to avoid colliding with the app's local `useSettings` hook. Only one slot is used for now, `casa` (home), needed for the "desde casa" routing shortcut. Designed to extend later (e.g. `trabajo`, `escuela`) without a schema change.
- Has its own screen: search for a place, assign it to a system-place slot.

Backup (export/import):
- **Implemented**, in Ajustes (`src/pages/settings.jsx`'s `BackupSetting`) — "Exportar datos" downloads a JSON file (`categories`, `places`, `system_places`, plus `exported_at`) built from `exportDataMutation`; "Importar datos" reads a JSON file back in via `importDataMutation` (`src/queries/backup.js`), inserting categories → places → system_places in that order so foreign keys resolve. Import expects rows shaped exactly like the export (including `id`) — it's a restore, not a form-shaped upload.
- `scripts/remap-ids.js` is a standalone one-off Node script (not part of the app bundle) used for the uuid→nanoid id migration: takes an exported JSON file and rewrites every id to a `nanoid(8)`, remapping `places.category_id` and `system_places.place_id` to match. Not needed for routine backups — only for that one migration (export on the old uuid schema → remap → apply `migrations/002_change_id_columns_to_text.sql` → import the remapped file).

Embed view:
- **Implemented**: a stripped-down, read-only map view meant for `<iframe>` embedding, at its own top-level route `/embed` (added directly as a child of `rootRoute` in `src/router.jsx`, a sibling of `shellRoute` — NOT nested under it, since `shellRoute` always mounts the panel rail). `src/components/embed-map-shell.jsx` is a separate shell component from `map-shell.jsx`, not a variant of it: no `PanelContainer`/rail/mobile nav, no map-level or per-marker context menu (`onContextMenu` is `preventDefault`'d on the outer container; markers skip `PlaceContextMenu` entirely via `PlacesLayer`'s `readOnly` prop), no `MapStyleSwitcher` UI, no current-location marker/beacon.
- Reuses the same query-param mechanisms as the main app rather than inventing new ones: `?place=<id>` (focus + auto-open popup, already handled inside `PlacesLayer` itself), `?route=id1:id2` (same hydration logic as `map-shell.jsx`, duplicated in `embed-map-shell.jsx` since there's no shared shell to hoist it into), `?style=<id>` (resolved against `MAP_STYLES`, just without the switcher control). Two params are new and embed-only: `?zoom=<number>` (initial viewport zoom, via nuqs' `parseAsFloat`, defaults to `DEFAULT_VIEWPORT.zoom`) and `?showPlaces=<boolean>` (via `parseAsBoolean`, default `true` — when `false`, `PlacesLayer`'s `pinnedIds` prop restricts markers/beacons to just the focused place and/or the active route's endpoints instead of hiding none).
- Still shows: place markers (read-only popup — share/center/open-in-Google-Maps only, favorite/beacon toggles and "fijar ruta desde" are hidden via `PlacePopup`'s `readOnly` prop), beacons (`is_beacon` places, via the same `PlacesLayer` beacon rendering), an active route's line + a reduced `RoutePanel` (`readOnly` prop: origin/destination become plain text instead of `PlacePointSelect` pickers, the close/"quitar ruta" button is hidden, but invert/duration/Uber/Google-Maps/share stay functional), and the same `ZoomControl`/`CompassControl`/`CenterControl` as the main map.
- A floating bottom-left button (`ExternalLink` icon) opens the full app (`/`) in a new tab, carrying over whichever of `place`/`route`/`style`/`zoom` are currently set in the embed's URL (reads `window.location.search` directly rather than re-deriving each value, so it always matches exactly what's in the address bar).
- `src/hooks/use-panel-offset.js` was made embed-aware: any pathname under `/embed` now forces `left`/`bottom` offsets to `0` and `isOpen` to `false` regardless of desktop/mobile, since there's no rail/panel/mobile-nav to compensate for — `RoutePanel` and the beacon `DirectionArrow` offsets read this hook directly and needed this to not mis-position themselves as if a panel were open.

## Code conventions

- JavaScript only. No `.ts`/`.tsx`, no JSDoc types, no type annotations anywhere. If a shadcn/mapcn registry block ships `.tsx`, convert it to `.jsx` on install.
- `export const` for everything; `export default` only in `app.jsx`.
- `useRef` variables: `$` prefix, no `Ref` suffix — `$editor`, not `editorRef`.
- `async/await`, never `.then()/.catch()`.
- `kebab-case` for every file and folder, no exceptions. Component files `kebab-case.jsx`, utility files `kebab-case.js`. Inside files: components PascalCase, hooks camelCase with a `use` prefix.
- `src/components/`: general, scope-specific components (feature/domain components). `src/ui/`: primitive components (shadcn/ui-style building blocks). Decide which one a new component belongs in before creating it.
- `src/helpers/` for utility functions (not `src/lib/`) — e.g. `cn()` lives at `src/helpers/utils.js`.
- `src/hooks/` for custom hooks (kebab-case filename matching the camelCase export, e.g. `use-settings.js` exports `useSettings`).
- `src/constants/` for plain constant/config objects (e.g. `default-settings.js`).
- `src/pages/`: each route/page gets its own file here. Don't put page content inline in the router config file. Routing config itself is a single `src/router.jsx` file (code-based TanStack Router route tree, not a `src/routes/` folder) that just imports pages and wires them together.
- Use the event bus (`BusProvider`, `src/providers/bus-provider.jsx`) to avoid prop drilling: `useListener(eventName, handler)` to subscribe, `useEmitter(eventName, ...args)` to get an emit function, `useEvents()` for the raw `{ on, off, emit }`. Reach for this instead of lifting state/callbacks through intermediate components.
- Async data lives in `src/queries/` as TanStack Query factory functions:
  ```js
  export const myQuery = (opts = {}) => ({
      queryKey: ['domain', 'key'],
      queryFn: async () => { ... },
      ...opts,
  })
  ```
  Call sites use `useQuery(myQuery())`. Cross-tab sync triggers `queryClient.invalidateQueries(...)` rather than manually syncing local state across tabs.
- The same factory pattern applies to mutations, co-located in the same `src/queries/*.js` file as the related query:
  ```js
  export const myMutation = (opts = {}) => ({
      mutationFn: async input => { ... },
      ...opts,
  })
  ```
  Call sites use `useMutation(myMutation({ onSuccess: () => queryClient.invalidateQueries({ queryKey: [...] }) }))` — keeps the Supabase call/error-handling/response-shaping out of components, same as queries.
- No obvious comments — code should read clearly on its own.
- Providers tree lives in `src/providers/providers.jsx`, built with `createProviders` (`src/helpers/providers.js`): an array of `[Provider, props]` tuples, `reduceRight`-nested around `children`, so the first entry is outermost. Confirmed final order (outermost → innermost): `QueryProvider` → `NuqsAdapter` (`nuqs/adapters/tanstack-router`) → `BusProvider` → `DeviceProvider` → app content. No `IdentityProvider`/`SettingsProvider`/`ThemeProvider` — not needed for this project (no auth, settings is a plain module singleton with no Context, light-mode only). Router setup lives in a single `src/router.jsx` file (code-based routing, not a `src/routes/` folder) — its root route wraps `Providers` around `Outlet`.
- Every component needs both a mobile and a desktop treatment. Unprefixed Tailwind classes are the mobile styles; layer `sm:`/`lg:`/`xl:` on top for desktop — never the reverse.
- Check `src/ui/` and the shadcn registry before writing custom UI; don't recreate an existing component. Ask before implementing something custom (same rule as the mapcn build-order rule above, generalized to all UI).
- Extract conditional UI states (loading/empty/error) into their own named components with early returns — don't embed `{isLoading && <...>}` or ternaries inline in the main JSX. Use `match()` from `src/helpers/utils.js` (`.with(pattern, handler).otherwise(handler).run()`) to pick the rendered state instead of nested ternaries.
- Runtime values (color, size, offset, anything computed) go through a CSS custom property, referenced via Tailwind's variable syntax — never `style={{ color: value }}` directly:
  ```jsx
  <div className="bg-(--item-color)" style={{ '--item-color': color }} />
  ```
- Conditional classes: an object passed to `cn()` (imported from `@/helpers/utils.js`), never a ternary — `cn('base', { extra: isActive })`, not `cn(isActive ? 'extra' : 'other')`. Never build class strings via template literals or concatenation — Tailwind can't scan those and the classes get purged from the build.
- Icon sizing via `[&>svg]:size-X` on the container, never Lucide's `size` prop. Use `size-X` instead of matching `w-X h-X` pairs (except conditional orientation classes like `data-horizontal:w-full data-vertical:h-full`).
- Prefer `rem` over `px` everywhere except values that must not scale (e.g. 1px borders). Prefer Tailwind's built-in spacing scale over arbitrary `[...]` values.
- Every `shadow-*` needs an explicit color (`shadow-lg shadow-black/30`) — Tailwind v4 shadows have no default color.
- **Accessibility overrides the general opacity conventions in this project**, because the owner has low vision: 14px is the standard text size everywhere (12px only as a special-case exception, e.g. dense dev/debug tooling — never a general default), high contrast, light mode only. Icons are always a fully solid color — avoid transparency on icons by default; it's permitted only for a genuine extreme edge case, and even then via `opacity-X`, never an alpha-channel color class (alpha color makes overlapping stroke paths double up into a visible seam; `opacity` composites the whole icon as one flattened layer instead). Text is solid by default too; if opacity on text is truly unavoidable, the floors are `/90`+ for main labels, `/70`+ for secondary, `/50`+ for hints — never lower.

## Notable UI primitives

- `ColorSelector`/`ColorPicker` (`src/ui/color-selector.jsx`/`color-picker.jsx`): HSL gradient picker + hue slider + hex/rgb/hsl input + optional native `EyeDropper()` button. `ColorPicker` wraps `ColorSelector` in a shadcn `Popover` (base-ui's `render` prop for the trigger, not Radix's `asChild`) — this is what backs category color picking, controlled via `<ColorPicker value={hex} onChange={setHex}>`.
- `IconWrapper` (`src/ui/icons.jsx`): generic SVG shell matching Lucide's ergonomics (`size` prop, `currentColor` fill), for wrapping any one-off icon that exists in neither Lucide nor Lucide-lab, instead of pulling in a new icon package.
- `NumberScrubber` (`src/ui/number-scrubber.jsx`): draggable number input (Figma/Photoshop-style scrub-to-change), wraps `@/ui/input`, clamped to `min`/`max`/`step`.
- `JsonViewer` (`src/ui/json-viewer.jsx`, dev/debug tool): wraps `@microlink/react-json-view` in a shadcn `ScrollArea`, fixed `'ocean'` theme. Built but not currently wired into any page. Its ~12px text is a confirmed, accepted special-case exception to the 14px standard — don't bump it, and don't treat 12px as generally acceptable elsewhere.

## Tailwind + shadcn setup (`index.css`)

- In `@layer base`, add:
  ```css
  html {
      @apply font-sans bg-background;
  }
  ```

- Custom variants and utilities live in separate CSS files imported into `index.css` (`@import './variants.css'`, `'./utilities.css'`, `'./debug.css'`, after `tailwindcss`/`tw-animate-css`/`shadcn/tailwind.css`):

  `variants.css`:
  ```css
  @custom-variant adjacents (&::before, &::after);

  @variant adjacents {
      &::before,
      &::after {
          content: '';
      }
  }
  ```

  `utilities.css` (also grew a few animation utilities for the pin-drop and Point Nemo marker components — `animate-radar-ping`, `bg-scanlines`, `animate-glitch`, `animate-crt-flicker` — not reproduced below, see the file directly):
  ```css
  @utility absolute-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
  }

  @utility all-unset {
      all: unset;
  }

  @utility interpolate-size {
      interpolate-size: allow-keywords;
  }

  @utility flex-center {
      display: flex;
      justify-content: center;
      align-items: center;
  }

  @utility z-max {
      z-index: 999999;
  }

  @utility spacer {
      flex-grow: 1;
  }

  @utility squircle-* {
      --squircle-r: --value(--radius-*);
      border-radius: calc(var(--squircle-r) / 2);

      @supports (corner-shape: squircle) {
          corner-shape: squircle;
          border-radius: var(--squircle-r);
      }
  }

  @utility image-* {
      image-rendering: --value('auto', 'smooth', 'crisp-edges', 'pixelated');
  }
  ```

  `debug.css` (dev-only visual helpers):
  ```css
  @layer utilities {
      .bg-playground {
          background-color: #313131;
          background-image: radial-gradient(rgba(255, 255, 255, 0.171) 1px, transparent 0);
          background-size: 20px 20px;
          background-position: center;
      }
  }

  .debug,
  .debug * {
      outline: 1px pink dashed;
  }
  ```

  Additional custom variants for `variants.css`, keyed off `data-*` attributes set by `DeviceProvider` (`data-browser`/`data-os`/`data-device`/`data-page`). **No custom `dark` variant here** — Pinia is light-mode-only for now; if dark mode is ever added, use shadcn's own default `dark` variant mechanism, not a custom `data-theme-gama` one from other projects:
  ```css
  @custom-variant short (@media (max-height: 600px));

  @custom-variant page-home (&:where([data-page='home'], [data-page='home'] *));

  @custom-variant chrome (&:where([data-browser='chrome'], [data-browser='chrome'] *));
  @custom-variant firefox (&:where([data-browser='firefox'], [data-browser='firefox'] *));
  @custom-variant safari (&:where([data-browser='safari'], [data-browser='safari'] *));
  @custom-variant edge (&:where([data-browser='edge'], [data-browser='edge'] *));
  @custom-variant opera (&:where([data-browser='opera'], [data-browser='opera'] *));

  @custom-variant mobile (&:where([data-device='mobile'], [data-device='mobile'] *));
  @custom-variant tablet (&:where([data-device='tablet'], [data-device='tablet'] *));
  @custom-variant desktop (&:where([data-device='desktop'], [data-device='desktop'] *));
  @custom-variant bot (&:where([data-device='bot'], [data-device='bot'] *));

  @custom-variant windows (&:where([data-os='windows'], [data-os='windows'] *));
  @custom-variant macos (&:where([data-os='macos'], [data-os='macos'] *));
  @custom-variant linux (&:where([data-os='linux'], [data-os='linux'] *));
  @custom-variant android (&:where([data-os='android'], [data-os='android'] *));
  @custom-variant ios (&:where([data-os='ios'], [data-os='ios'] *));
  @custom-variant ipados (&:where([data-os='ipados'], [data-os='ipados'] *));
  @custom-variant chromeos (&:where([data-os='chromeos'], [data-os='chromeos'] *));
  ```
  Only `page-home` is defined so far — add more `page-*` variants (`page-places`, `page-categories`, `page-settings`) if a route-scoped style ever needs one.

## Development process

- One feature at a time: implement, stop, wait for the owner to manually test it, then continue. No automated tests exist or are expected — all verification is manual.
- After each unit of work, summarize what was implemented, what to test, and what's next, then stop and wait for explicit confirmation before moving on. Don't ask "should we start?" or similar — the owner says when ready.
- Keep this file, `AGENTS.md`, and any `/docs/*.md` in sync after every significant change (there's a `sync-instructions` skill for keeping a group of instruction files identical — use it when applicable).
- Never run `git add`, `git commit`, or push — the owner handles all git operations manually, always.
- Never suggest adding login/authentication.

## Standing utilities

These were ported from the owner's other projects early on and are now just part of Pinia's own codebase — described here for what they do, not where they came from:

- `cache` (`src/helpers/cache.js`): localStorage helper, scoped under the `'pinia:cache'` key.
- `settings` (`src/helpers/settings.js`): localStorage-backed, path-based, cross-tab-synced settings store (`'pinia:settings'` key) backing the local `useSettings` hook. Depends on `src/helpers/objects.js` (`getByPath`/`setByPath`) and `src/constants/default-settings.js`.
- `useSettings` (`src/hooks/use-settings.js`): `useSettings(path, defaultValue)` returns `[value, set]` like `useState`, backed by the `settings` service, reactive to cross-tab changes via `settings.subscribe`; `set` accepts a plain value or a functional updater.
- `ntfy` (`src/helpers/ntfy.js`): push notifications + remote command channel built on ntfy.sh. `push(message)` POSTs to `https://ntfy.sh/{topic}`; `subscribe(callback)` opens a `wss://ntfy.sh/{topic}/ws` WebSocket with a 60s heartbeat and exponential-backoff reconnect (1s → 30s cap); `buildCommand`/`parseCommand` encode/decode a `name({...json})` command string. Env var `VITE_NTFY_TOPIC` (a unique, project-scoped topic — ntfy.sh topics are a shared public namespace), distinct from the `/notify` skill's own `NTFY_TOPIC` env var (no `VITE_` prefix).
- `useNtfy` (`src/hooks/use-ntfy.js`): thin wrapper subscribing `onMessage` to the `ntfy` service on mount; its effect intentionally has an empty `[]` dependency array (subscribes once, doesn't re-track `onMessage`).
- `redirectInternal`/`redirectExternal` (`src/helpers/redirect.js`): factory functions returning a route component that redirects in a mount-only effect and renders `null` — `redirectInternal({ to, params, search })` via TanStack Router's `useNavigate({ replace: true })`, `redirectExternal({ to, target })` via `window.location.replace`/`window.open`. Use for declaring redirect routes concisely in the router config.
- `src/helpers/utils.js`: `cn(...inputs)` = `twMerge(clsx(inputs))`; `delay(ms)` = sleep promise; `match(action)` = fluent pattern-matching builder (`.with(pattern, handler).when(matcher, handler).otherwise(handler).run()`, first match wins) for dispatching `{ type, ...payload }`-shaped objects to handlers.
- `BusProvider` (`src/providers/bus-provider.jsx`): the event bus described in Code conventions.
- `DeviceProvider` (`src/providers/device-provider.jsx`): sets the `data-browser`/`data-os`/`data-device`/`data-page` attributes the custom Tailwind variants below key off of. Depends on `src/helpers/ua-parser.js`.
- Supabase client factory, `src/helpers/supabase.js`:
  ```js
  import { createClient } from '@supabase/supabase-js';

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  let _client = null;

  export const supabase = () => {
      if (_client) return _client;
      _client = createClient(SUPABASE_URL, SUPABASE_KEY, {
          db: { schema: 'pinia' },
      });
      return _client;
  };
  ```
  `supabase()` is a function to call at each use site (lazy-init singleton), not a ready-made client export. Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, plus `VITE_ORS_API_KEY` (routing), `VITE_MAPTILER_KEY` (basemap style), `VITE_NTFY_TOPIC` (see above) — all five are the app's full env var surface (`.env.example` at repo root).
