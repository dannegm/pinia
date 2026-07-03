# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Guasave is a personal, mobile-first web map for cataloging places of interest around Guasave, Sinaloa (malls, tienditas, restaurants, bus stops, houses, etc.). The owner calls it his "mapa de supervivencia" for himself and his girlfriend — a day-to-day reference tool, not a generic places directory.

**Status: pre-scaffold.** As of this writing the repository only contains planning artifacts (`.agents/skills`, `.claude/skills`, this file) — no `package.json`, source tree, or Supabase schema exists yet. There are no build/lint/test/dev commands to document until scaffolding begins; update this file once they exist.

## Stack

- React + Vite 8, plain JavaScript (JSX) — no TypeScript, ever (see Code Conventions)
- Package manager: pnpm. Runtime: Node 24.
- TanStack Router for routing, TanStack Query for async/server state
- nuqs for URL-synced state (e.g. filters/search reflected in the URL)
- Tailwind CSS v4, CSS-based config (`@theme` in `index.css`) — no `tailwind.config.js`
- shadcn/ui built on base-ui primitives (not Radix)
- Icons: Lucide + Lucide-lab
- Typography: Google Fonts imported at the top of `index.css` (before the Tailwind import) — Atkinson Hyperlegible, chosen for low-vision legibility
- Map: mapcn (`@mapcn/map`, https://mapcn.dev) — a shadcn-style registry of React map components built on MapLibre GL, free CARTO basemap tiles, no API key required
- Data: Supabase (Postgres), in a dedicated `guasave` schema (not `public`) — see Database
- Routing/directions: OpenRouteService (free API key, no credit card) computes route geometry; mapcn's `MapRoute` only renders the resulting line, it does not calculate routes itself
- No authentication — the app is open-access by design
- Light mode only for now (no dark mode yet)
- Deployment: Vercel, deployed manually by the project owner

## Build-order rule

Before implementing any map feature, check whether mapcn already provides it — `Controls`, `Markers`, `Popups`, `Routes`, `Arcs`, `GeoJSON`, `Clusters`, or one of its pre-built Blocks (e.g. Store Locator: searchable list synced with map markers, install via `npx shadcn@latest add @mapcn/store-locator`). Check `https://www.mapcn.dev/llms.txt` for the current component/block inventory and links — don't crawl or guess routes beyond what it lists. Same rule for general UI: check shadcn/ui and `src/ui/` before writing anything custom.

If neither has what's needed, ask the owner and design the custom solution together — nothing custom gets built without that conversation first.

Known, already-agreed exception: the off-screen "beacon" direction-arrow indicator (see Features) has no mapcn equivalent and is a confirmed custom build, ported from the sibling project `puedopasar` — see Reference implementations below.

## Database

- Supabase Postgres, dedicated schema `guasave` (the owner's standing convention across all his projects: one schema per project, never the default `public` schema).
- `db.sql` is the canonical, self-contained schema — running it end-to-end on a fresh Supabase project reproduces the full database (tables, RLS policies, grants). It is not a migration history; it always reflects current desired state.
- `migrations/NNN_slug.sql` holds the incremental history. Every schema change goes through the `/migrate` skill (`.agents/skills/migrate`, already adapted for this project's `guasave` schema), which creates the next numbered migration file AND updates `db.sql` in the same step. Never hand-edit `db.sql` directly or write ad-hoc SQL outside this flow.
- No auth, so RLS policies follow an "allow all" pattern (`using (true) with check (true)`) rather than per-user scoping.

## Features (confirmed scope)

Core:
- Full-viewport map; search, filters, the place list, and controls all float over it as overlay UI — no side-by-side panels.
- UI panels (search, places, categories, settings) follow a confirmed VSCode-style pattern, implemented as real TanStack Router sub-routes (not URL query state): the map lives in a persistent layout, `src/components/map-shell.jsx`, rendered by a pathless `shellRoute` in `src/router.jsx`, and never remounts as panels change. `/`, `/search`, `/places`, `/places/new`, `/categories`, `/categories/new`, and `/settings` are all children of `shellRoute`; each panel's content is a normal page component in `src/pages/*.jsx`. `src/components/panel-nav.jsx` is the icon rail — full-height on the left edge on desktop (`sm:w-14`), a bottom nav bar on mobile — clicking an icon navigates to its route, clicking the active one navigates back to `/` (closed state). `src/components/panel-container.jsx` renders a single `<Outlet/>` for the active panel: a persistent left sidebar (`w-1/4`, positioned right after the rail) on desktop, or a non-modal `Drawer` (bottom sheet, swipe-to-dismiss wired to the same "navigate to `/`" as the rail toggle) on mobile. It picks exactly ONE of these two containers via `src/hooks/use-media-query.js` (`useMediaQuery('(min-width: 640px)')`) — never both — because rendering `<Outlet/>` twice would mount the panel's route component twice simultaneously. The map's logical center compensates for both the always-visible rail and the open panel's actual measured width via MapLibre's native `padding` option (`map.easeTo({ padding: {...} })`, panel width measured live via `ResizeObserver`) — this keeps the visual "center" of the visible map area correct instead of the geometric center of the full container. nuqs is still used, but scoped to the search box's URL-synced query text on `/search`, not panel navigation.
- Search by place name, category, and address; quick-access category filter chips.
- Each place stores a free-text address AND lat/lng coordinates. Pins are placeable via drag-and-drop on the map (mapcn's `Markers` supports this natively via `draggable`/`onDrag`) or by typing coordinates directly.
- Categories have a color plus an icon stored as a single `icon jsonb not null` column on `guasave.categories`, shaped `{ library, name }` — `library` is `'lucide'` (renders via `lucide-react`'s `icons` map) or `'lucide-lab'` (renders via `lucide-react`'s generic `Icon` component with an `iconNode` from `@lucide/lab`). Supabase returns/accepts jsonb columns as plain JS objects already, so query code needs no manual (de)serialization. `src/ui/dynamic-icon.jsx` resolves either shape; always pass the whole `icon` object (`<DynamicIcon icon={category.icon} />`), never just a name string.
- Hours: a single free-text field (e.g. "Lun-Vie 4-6pm"), always optional.
- Geolocation: show the current position on the map + a "center on my location" control.
- Map zoom bounds: confirmed — min 9, max 18, default 14 (`MIN_ZOOM`/`MAX_ZOOM`/`DEFAULT_VIEWPORT` in `src/constants/map-defaults.js`). `maxBounds` (pan-limiting lat/lng box) is still open/undecided.
- Marker clustering: deferred. mapcn's `Clusters` is a separate GeoJSON-based layer, not directly compatible with per-marker drag/popup interactivity — revisit only if plain markers become visually unmanageable.

Place-specific:
- Bus stops ("paradas de camión") and houses are plain place categories — no special fields or map behavior beyond a distinct icon.
- `is_favorite`: boolean per place, independent of the beacon flag, used for quick access (e.g. picking a route origin).
- `is_beacon`: boolean per place. Named "beacon" (not "anchor") deliberately, to avoid colliding with MapLibre's own marker-anchor concept or "waypoint"/route-stop terminology. Any beaconed place gets a persistent off-screen direction arrow when it's outside the viewport — video-game-minimap style. Multiple places can be beaconed at once; the map renders one arrow per active beacon.
- Place detail popup (via mapcn's `Popups`, which supports arbitrary React content): shows name, category, address, hours, notes, and a navigation row with route-origin shortcuts — "desde mi ubicación actual", "desde casa", "desde algún favorito", and "pedir Uber" (deep link via Uber's public universal-link scheme, `m.uber.com/ul/?action=setPickup&dropoff[...]`, no Uber API key needed).

System places:
- A dedicated `system_places` table (key → place reference) instead of one-off boolean flags on `places` for singleton concepts — named to avoid colliding with the app's local `useSettings` hook. Only one slot is used for now, `casa` (home), needed for the "desde casa" routing shortcut. Designed to extend later (e.g. `trabajo`, `escuela`) without a schema change.
- Has its own screen: search for a place, assign it to a system-place slot.

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
- Providers tree lives in `src/providers/providers.jsx`, built with `createProviders` (`src/helpers/providers.js`, ported from `bins`): an array of `[Provider, props]` tuples, `reduceRight`-nested around `children`, so the first entry is outermost. Confirmed final order (outermost → innermost): `QueryProvider` → `NuqsAdapter` (`nuqs/adapters/tanstack-router`) → `BusProvider` → `DeviceProvider` → app content. No `IdentityProvider`/`SettingsProvider`/`ThemeProvider` — not needed for this project (no auth, settings is a plain module singleton with no Context, light-mode only). Router setup lives in a single `src/router.jsx` file (code-based routing, not a `src/routes/` folder) — its root route wraps `Providers` around `Outlet`.
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

## Reusable components

- `ColorSelector`: source `/Users/danielgarcia/Desktop/Workspace/bins/src/ui/color-selector.jsx` → `src/ui/color-selector.jsx` here (yes, `ui/` not `components/`, matching the source precedent). **Use this for category color picking** (see Features). HSL gradient picker + hue slider + hex/rgb/hsl input + optional native `EyeDropper()` button, controlled: `<ColorSelector value="#6366f1" onChange={hex => ...} />`. Deps: `color`, `lucide-react` (`PipetteIcon`), `@base-ui/react/slider`, `@/ui/button`, `@/ui/input-group`, `@/helpers/utils`.
- `input-group`: source `/Users/danielgarcia/Desktop/Workspace/bins/src/ui/input-group.jsx` → `src/ui/input-group.jsx`. Exports `InputGroup`/`InputGroupAddon`/`InputGroupButton`/`InputGroupInput` — check `npx shadcn@latest add input-group` first, this may be a standard shadcn registry component rather than custom.
- `ColorPicker`: source `/Users/danielgarcia/Desktop/Workspace/bins/src/ui/color-picker.jsx` → `src/ui/color-picker.jsx`. Wraps `ColorSelector` in a shadcn `Popover`, triggered by an arbitrary `children` element: `<ColorPicker value={hex} onChange={setHex}><Button>...</Button></ColorPicker>`. Note: uses base-ui's `render` prop for the trigger (`<PopoverTrigger render={children} />`), not Radix's `asChild` — the general pattern for triggers in this base-ui stack. Likely the actual component to use for the category color picker (not `ColorSelector` inline).
- `IconWrapper` + custom icons (`icons.jsx`): source `/Users/danielgarcia/Desktop/Workspace/bins/src/ui/icons.jsx` → `src/ui/icons.jsx`. Generic SVG shell matching Lucide's ergonomics (`size` prop, `currentColor` fill) for wrapping icons that exist in neither Lucide nor Lucide-lab — wrap the raw SVG path here (`<IconWrapper viewBox="..."><path d="..." /></IconWrapper>`) instead of pulling in a new icon package.
- `NumberScrubber`: source `/Users/danielgarcia/Desktop/Workspace/bins/src/ui/number-scrubber.jsx` → `src/ui/number-scrubber.jsx`. Draggable number input (Figma/Photoshop-style scrub-to-change), wraps `@/ui/input`, clamped to `min`/`max`/`step`. **When porting, rename its `useRef` variables to the `$`-prefixed form** (`isDragging` → `$isDragging`, etc.) — the source file doesn't follow that naming convention, but Guasave should.
- `JsonViewer` (dev/debug tool): wraps `@microlink/react-json-view` in a shadcn `ScrollArea`, fixed `'ocean'` theme. Goes in `src/ui/json-viewer.jsx`. No exact match found in `bins` — closest relative is `src/ui/themed-json-view.jsx` (`ThemedJsonView`, dynamic-theme variant, different component, don't substitute without asking). Its ~12px text is a confirmed, accepted special-case exception to the 14px standard — don't bump it, and don't treat 12px as generally acceptable elsewhere.

## Tailwind + shadcn setup (`index.css`)

- In `@layer base`, add:
  ```css
  html {
      @apply font-sans bg-background;
  }
  ```

- Custom variants and utilities, in separate CSS files imported into `index.css` (proposed split, confirm filenames if it matters):

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

  `utilities.css`:
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

  Additional custom variants for `variants.css`, keyed off `data-*` attributes set by `DeviceProvider` (`data-browser`/`data-os`/`data-device`/`data-page`). **No custom `dark` variant here** — Guasave is light-mode-only for now; if dark mode is ever added, use shadcn's own default `dark` variant mechanism, not a custom `data-theme-gama` one from other projects:
  ```css
  @custom-variant short (@media (max-height: 600px));

  @custom-variant page-home (&:where([data-page='home'], [data-page='home'] *));
  @custom-variant page-settings (&:where([data-page='settings'], [data-page='settings'] *));
  @custom-variant page-admin (&:where([data-page='admin'], [data-page='admin'] *));

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
  The `page-*` variants shown are examples from the source project — update them to match Guasave's actual routes once they exist.

## Development process

- One feature at a time: implement, stop, wait for the owner to manually test it, then continue. No automated tests exist or are expected — all verification is manual.
- After each unit of work, summarize what was implemented, what to test, and what's next, then stop and wait for explicit confirmation before moving on. Don't ask "should we start?" or similar — the owner says when ready.
- Keep this file, `AGENTS.md`, and any `/docs/*.md` in sync after every significant change (there's a `sync-instructions` skill for keeping a group of instruction files identical — use it when applicable).
- Never run `git add`, `git commit`, or push — the owner handles all git operations manually, always.
- Never suggest adding login/authentication.

## Reference implementations (sibling projects)

The sibling project `puedopasar` (`/Users/danielgarcia/Desktop/Workspace/puedopasar`) has two patterns worth knowing about:
- Off-screen direction arrow ("beacon"): `src/components/map-card.jsx`, `DirectionArrow` component — screen-space projection + edge-clamping algorithm, confirmed as the pattern to port for the beacon feature (mapcn has no equivalent).
- Custom map controls (zoom/compass/geolocate/fullscreen): `src/ui/map.jsx`, `MapControls`/`ControlGroup`/`ControlButton` — superseded for this project by mapcn's own built-in `MapControls`, which already covers the same ground; kept here only as a possible styling reference.

The owner is also porting standing utilities from his other projects, one at a time, to be reused as-is (only project-scoped constants change):
- `cache` (localStorage helper): source at `/Users/danielgarcia/Desktop/Workspace/bins/src/services/cache.js` → goes in `src/helpers/cache.js` here. Rename its `STORAGE_KEY` from `'bins:cache'` to a Guasave-scoped key (e.g. `'guasave:cache'`) — never reuse the original verbatim.
- `settings` (localStorage-backed, path-based, cross-tab-synced settings store — backs the `SettingsProvider`/local `useSettings` hook): source at `/Users/danielgarcia/Desktop/Workspace/bins/src/services/settings.js` → goes in `src/helpers/settings.js` here. Rename `STORAGE_KEY` from `'bins:settings'` to `'guasave:settings'`. Depends on `src/helpers/objects.js` (`getByPath`/`setByPath`, portable as-is, source `/Users/danielgarcia/Desktop/Workspace/bins/src/helpers/objects.js`, itself depending on `trim` from `src/helpers/strings.js` — check that file before porting) and `src/constants/default-settings.js` (the `bins` version is entirely bins-specific — port only the *pattern*, not its contents; Guasave's actual defaults are undecided, ask the owner).
- `useSettings` hook: source `/Users/danielgarcia/Desktop/Workspace/bins/src/hooks/use-settings.js` → goes in `src/hooks/use-settings.js` here (update its settings-service import path to `@/helpers/settings`). `useSettings(path, defaultValue)` returns `[value, set]` like `useState`, backed by the `settings` service above, reactive to cross-tab changes via `settings.subscribe`; `set` accepts a plain value or a functional updater.
- `ntfy` (push notifications + remote command channel, built on ntfy.sh): source `/Users/danielgarcia/Desktop/Workspace/bins/src/services/ntfy.js` → goes in `src/helpers/ntfy.js` here. `push(message)` POSTs to `https://ntfy.sh/{topic}`; `subscribe(callback)` opens a `wss://ntfy.sh/{topic}/ws` WebSocket with a 60s heartbeat and exponential-backoff reconnect (1s → 30s cap); `buildCommand`/`parseCommand` encode/decode a `name({...json})` command string, likely meant to pair with `settings.js`'s `handleCommand`. Env var `VITE_NTFY_TOPIC` — must be a unique, project-scoped topic (ntfy.sh topics are a shared public namespace). Distinct from the `/notify` skill's own `NTFY_TOPIC` env var (no `VITE_` prefix) — confirm with the owner whether both should share the same value.
- `useNtfy` hook: source `/Users/danielgarcia/Desktop/Workspace/bins/src/hooks/use-ntfy.js` → goes in `src/hooks/use-ntfy.js` here (update its import to `@/helpers/ntfy`). Thin wrapper subscribing `onMessage` to the `ntfy` service on mount; its effect intentionally has an empty `[]` dependency array (subscribes once, doesn't re-track `onMessage`) — keep this as-is when porting.
- `redirectInternal`/`redirectExternal` helpers: source `/Users/danielgarcia/Desktop/Workspace/bins/src/helpers/redirect.js` → same path here (`src/helpers/redirect.js`, no changes needed). Factory functions returning a route component that redirects in a mount-only effect and renders `null` — `redirectInternal({ to, params, search })` via TanStack Router's `useNavigate({ replace: true })`, `redirectExternal({ to, target })` via `window.location.replace`/`window.open`. Use for declaring redirect routes concisely in the router config.
- `src/helpers/utils.js` (source `/Users/danielgarcia/Desktop/Workspace/bins/src/helpers/utils.js`, same path here, no changes needed): `cn(...inputs)` = `twMerge(clsx(inputs))` (needs `clsx` + `tailwind-merge` deps); `delay(ms)` = sleep promise; `match(action)` = fluent pattern-matching builder (`.with(pattern, handler).when(matcher, handler).otherwise(handler).run()`, first match wins) for dispatching `{ type, ...payload }`-shaped objects to handlers.
- `BusProvider` (event bus): source `/Users/danielgarcia/Desktop/Workspace/bins/src/providers/bus-provider.jsx` → same relative path here (`src/providers/bus-provider.jsx`, no changes needed).
- `DeviceProvider`: source `/Users/danielgarcia/Desktop/Workspace/bins/src/providers/device-provider.jsx` → `src/providers/device-provider.jsx` here. Depends on `src/helpers/ua-parser.js` (source `/Users/danielgarcia/Desktop/Workspace/bins/src/helpers/ua-parser.js`, not yet inspected). Position in the providers tree not yet confirmed — ask before wiring in.
- Supabase client factory, already Guasave-scoped, goes in `src/helpers/supabase.js`:
  ```js
  import { createClient } from '@supabase/supabase-js';

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  let _client = null;

  export const supabase = () => {
      if (_client) return _client;
      _client = createClient(SUPABASE_URL, SUPABASE_KEY, {
          db: { schema: 'guasave' },
      });
      return _client;
  };
  ```
  `supabase()` is a function to call at each use site (lazy-init singleton), not a ready-made client export. Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
