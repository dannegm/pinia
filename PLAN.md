# Guasave — Initial scaffold execution plan

## Context

Over many planning turns, the user (Daniel) has fully specified a personal, mobile-first "survival map" app for Guasave, Sinaloa: a places catalog with categories, search, favorites, off-screen "beacon" direction arrows, and routing, built on React + Vite + mapcn/MapLibre + Supabase. The repo is currently empty except `.agents/skills`, `.claude/skills`, `CLAUDE.md`, and `AGENTS.md` (already written with the accumulated spec). Daniel has also shared a large number of reusable utilities and components from his other project `bins` (`/Users/danielgarcia/Desktop/Workspace/bins`) that should be ported rather than rebuilt, and a reference implementation in `puedopasar` for the beacon/direction-arrow and map-controls patterns.

This plan covers **Phase 0: scaffolding and foundational setup only** — getting the project to a runnable, correctly-configured empty shell with all conventions, providers, and shared utilities wired in. Per Daniel's explicit "one feature at a time, wait for manual testing" process rule, actual product features (places CRUD, map markers, search, beacon, routing, etc.) are NOT part of this plan — they'll each be planned/executed as separate, smaller units after this foundation is in place and confirmed working.

**Before any scaffolding**, `CLAUDE.md`/`AGENTS.md` and Claude's memory need a correction: the providers tree was originally given as `QueryProvider → BusProvider → IdentityProvider → SettingsProvider → ThemeProvider → app`, but Daniel has since confirmed `IdentityProvider`, `SettingsProvider`, and `ThemeProvider` are **not needed** for this project (no auth, no theme-context settings store, light-mode only). The confirmed tree is now:

```
QueryProvider → BusProvider → DeviceProvider → app content
```

Daniel also shared the exact composition pattern used in `bins` for building/reordering this tree easily (`createProviders` + a root-route wrapper), which should be used verbatim.

**Status as of this writing:** Step 1 (docs/memory correction) and Step 8 (initial Supabase migration) have been completed. Steps 2-7 (actual project scaffold) are still pending — resume with those in the next session.

## Step 1 — Correct existing docs/memory ✅ DONE

- Update `CLAUDE.md` and `AGENTS.md` (kept in sync via the `sync-instructions` skill, group = `[CLAUDE.md, AGENTS.md]`): replace the old 5-provider tree with the confirmed 3-provider tree, and document the `createProviders` pattern below.
- Update Claude's own memory (`user_react_app_conventions.md`, `project_guasave_map.md`) to match.

## Step 2 — Project scaffold

- `pnpm create vite@latest . -- --template react` (plain JS template, not `react-ts`) inside `/Users/danielgarcia/Desktop/Workspace/guasave`. Node 24, pnpm as the package manager (`.nvmrc`/`packageManager` field in `package.json` if useful).
- Install core deps: `react-router` is NOT used — instead `@tanstack/react-router` + its Vite plugin, `@tanstack/react-query`, `nuqs` (+ `nuqs/adapters/tanstack-router`), `@supabase/supabase-js`, `maplibre-gl`, `clsx`, `tailwind-merge`, `color`, `lucide-react`, `lucide-lab`, `@microlink/react-json-view`.
- Tailwind v4: `pnpm add tailwindcss @tailwindcss/vite`, configure via the Vite plugin (no `tailwind.config.js`, CSS-based `@theme` config in `index.css`).
- shadcn/ui: initialize with base-ui as the primitives library (not Radix) — `npx shadcn@latest init` and confirm/point it at base-ui during setup; install `@mapcn/map` via `npx shadcn@latest add @mapcn/map`.

## Step 3 — Folder structure

Create the confirmed folder convention under `src/`:
- `src/components/` — feature/domain components
- `src/ui/` — primitives (shadcn output lands here)
- `src/helpers/` — utility functions (`utils.js`, `providers.js`, `cache.js`, `settings.js`, `ntfy.js`, `redirect.js`, `objects.js`, `strings.js`, `supabase.js`, `ua-parser.js`)
- `src/hooks/` — custom hooks (`use-settings.js`, `use-ntfy.js`)
- `src/constants/` — plain config objects (`default-settings.js`)
- `src/pages/` — one file per route/page component
- `src/providers/` — `providers.jsx` + one file per provider (`query-provider.jsx`, `bus-provider.jsx`, `device-provider.jsx`)
- `src/queries/` — TanStack Query factory functions
- `src/router.jsx` — **a single file at `src/` root** (not a `src/routes/` folder) that builds the whole TanStack Router route tree in code, referencing page components from `src/pages/`. This is Daniel's explicit correction: file-based routing (`bins`'s `src/routes/__root.jsx` + per-route files) is NOT the pattern here — Guasave uses one code-based `router.jsx` that assembles routes (including the root route wrapping `Providers`/`Outlet`) manually, importing pages from `src/pages/`.

## Step 4 — Port reusable utilities from `bins`

Source project: `/Users/danielgarcia/Desktop/Workspace/bins`. Port each file below to the Guasave path shown, adjusting only what's noted (nothing else — keep logic/shape identical):

| Source (`bins`) | Destination (`guasave`) | Adjustment needed |
|---|---|---|
| `src/helpers/utils.js` | `src/helpers/utils.js` | None — `cn`, `delay`, `match` as-is |
| `src/helpers/providers.js` | `src/helpers/providers.js` | None — `createProviders` as-is |
| `src/services/cache.js` | `src/helpers/cache.js` | `STORAGE_KEY`: `'bins:cache'` → `'guasave:cache'` |
| `src/services/settings.js` | `src/helpers/settings.js` | `STORAGE_KEY`: `'bins:settings'` → `'guasave:settings'`; import path for `objects.js` |
| `src/helpers/objects.js` | `src/helpers/objects.js` | None (check `strings.js`'s `trim` dependency first) |
| `src/helpers/strings.js` | `src/helpers/strings.js` | Not yet inspected — read it before porting `objects.js` |
| `src/constants/default-settings.js` | `src/constants/default-settings.js` | **Do not copy contents** — it's entirely bins-specific (editor/keybindings). Write a minimal Guasave-appropriate default object instead (can start empty/`{}` and grow later) |
| `src/hooks/use-settings.js` | `src/hooks/use-settings.js` | Import path `@/services/settings` → `@/helpers/settings` |
| `src/services/ntfy.js` | `src/helpers/ntfy.js` | Env var already named `VITE_NTFY_TOPIC` in the pasted version — keep, but needs its own unique topic value in `.env` |
| `src/hooks/use-ntfy.js` | `src/hooks/use-ntfy.js` | Import path `@/services/ntfy` → `@/helpers/ntfy` |
| `src/helpers/redirect.js` | `src/helpers/redirect.js` | None |
| `src/helpers/ua-parser.js` | `src/helpers/ua-parser.js` | Not yet inspected — read before porting `device-provider.jsx` |
| `src/providers/bus-provider.jsx` | `src/providers/bus-provider.jsx` | None |
| `src/providers/device-provider.jsx` | `src/providers/device-provider.jsx` | None (depends on `ua-parser.js` above) |
| (pasted directly, already correct) | `src/helpers/supabase.js` | Already scoped to `schema: 'guasave'` — use as pasted |

`QueryProvider` itself was never pasted — write a standard `QueryClientProvider` wrapper (`src/providers/query-provider.jsx`) following the same one-file-per-provider convention.

## Step 5 — Port reusable UI components from `bins`

| Source (`bins`) | Destination (`guasave`) | Notes |
|---|---|---|
| `src/ui/color-selector.jsx` | `src/ui/color-selector.jsx` | For category color picking (later feature) |
| `src/ui/color-picker.jsx` | `src/ui/color-picker.jsx` | Popover wrapper around `ColorSelector` |
| `src/ui/input-group.jsx` | `src/ui/input-group.jsx` | **Check `npx shadcn@latest add input-group` first** — may be a standard registry component, don't hand-copy if so |
| `src/ui/icons.jsx` | `src/ui/icons.jsx` | `IconWrapper` pattern for icons outside Lucide/Lucide-lab |
| `src/ui/number-scrubber.jsx` | `src/ui/number-scrubber.jsx` | **Rename `useRef` vars to `$`-prefixed form** (`isDragging`→`$isDragging`, etc.) — source doesn't follow that convention |
| (pasted directly) | `src/ui/json-viewer.jsx` | Dev/debug-only tool; ~12px text is an accepted exception, don't "fix" it |

These can be ported opportunistically (they're not needed until later features use them), but it's fine to bring them in now while everything else is being set up, since they're self-contained files with clear destinations.

## Step 6 — Providers tree + router

Confirmed final providers tree — build in this exact order:

`src/providers/providers.jsx`:
```jsx
import { createProviders } from '@/helpers/providers';
import { QueryProvider } from './query-provider';
import { BusProvider } from './bus-provider';
import { DeviceProvider } from './device-provider';

export const Providers = createProviders([
    [QueryProvider],
    [BusProvider],
    [DeviceProvider],
]);
```

**Router correction (Daniel's explicit instruction):** unlike `bins` (which uses TanStack Router's file-based routing — a `src/routes/` folder with `__root.jsx` etc.), Guasave uses a **single `src/router.jsx` file** that builds the route tree in code, referencing page components from `src/pages/`. The root route still wraps `Providers` around `Outlet`, just defined inline in `router.jsx` rather than a separate `__root.jsx`:

```jsx
// src/router.jsx
import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { Providers } from '@/providers/providers';
import { HomePage } from '@/pages/home';
// import further pages as they're built

const rootRoute = createRootRoute({
    component: () => (
        <Providers>
            <Outlet />
        </Providers>
    ),
});

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });

const routeTree = rootRoute.addChildren([homeRoute /* , more routes */]);

export const router = createRouter({ routeTree });
```

## Step 7 — `index.css`

Structure per Daniel's shared setup instructions:
- Google Font import (Atkinson Hyperlegible) at the very top, before the Tailwind import
- `@layer base { html { @apply font-sans bg-background; } }`
- Import three separate files:
  - `variants.css` — `@custom-variant adjacents (...)` + its `@variant` block, plus the `data-*`-keyed variants (`short`, `page-*`, browser/device/os variants) tied to `DeviceProvider`'s attributes. **Omit the custom `dark` variant** — use shadcn's own default dark-mode mechanism if/when dark mode is ever added (not now — light-mode only).
  - `utilities.css` — all the `@utility` definitions (`absolute-center`, `all-unset`, `interpolate-size`, `flex-center`, `z-max`, `spacer`, `squircle-*`, `image-*`)
  - `debug.css` — `.bg-playground` and `.debug`/`.debug *` dev helpers
- The `page-*` variants (`page-home`, `page-settings`, `page-admin`) are examples from `bins` — update to Guasave's actual route slugs once routes exist (can leave as placeholders or omit until routes are built).

## Step 8 — Supabase setup, INCLUDING the first real migration ✅ DONE

- Schema `guasave` on Daniel's existing Supabase project (not `public`).
- `.env` needs: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_NTFY_TOPIC` (Daniel provides these values — do not invent placeholders that look real).
- Generated `migrations/001_initial_schema.sql` and `db.sql`, covering:
  - `guasave.categories` — `id uuid pk default gen_random_uuid()`, `name text not null`, `icon text not null`, `color text not null`, `created_at timestamptz not null default now()`
  - `guasave.places` — `id uuid pk default gen_random_uuid()`, `name text not null`, `category_id uuid references guasave.categories(id)`, `address text`, `lat double precision not null`, `lng double precision not null`, `hours text`, `notes text`, `is_favorite boolean not null default false`, `is_beacon boolean not null default false`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`
  - `guasave.system_places` — `key text primary key`, `place_id uuid references guasave.places(id)` — starts with no seeded row (the `casa` key gets assigned later via the app's settings screen, not hardcoded in the migration)
  - RLS: `enable row level security` + an "allow all" policy (`using (true) with check (true)`) on each table, per the no-auth convention, plus the `alter default privileges` grants pattern.
- **Daniel still needs to run `migrations/001_initial_schema.sql` in the Supabase SQL editor** before implementation resumes.

## Verification

Since there's no existing app to compare against, "verification" here means confirming the scaffold actually runs and is wired correctly:
1. `pnpm install && pnpm dev` — dev server starts without errors.
2. Visit the dev URL in a browser: confirm the page renders (even if blank/placeholder), confirm no console errors from providers (`QueryProvider`, `BusProvider`, `DeviceProvider` all mount cleanly).
3. Inspect `<html>` in devtools: confirm `data-browser`, `data-os`, `data-device`, `data-page` attributes are present (proves `DeviceProvider` works).
4. Confirm `src/helpers/supabase.js`'s `supabase()` can be called without throwing (e.g. a temporary console call) — proves env vars are wired.
5. Confirm Tailwind classes and the custom utilities (e.g. `flex-center`) actually apply.
6. Per the "one feature at a time" process: stop here, report what was built and how to check it, and wait for Daniel to confirm before planning the first real feature (likely: basic full-viewport map + `MapControls`, or the places/categories schema).
