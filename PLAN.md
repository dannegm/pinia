# Pinia — Phase 0 scaffold plan (archived)

This plan covered Phase 0 only: getting Pinia from an empty repo to a runnable scaffold (providers tree, router, folder structure, base utilities/UI primitives, initial Supabase schema). All 8 steps completed and were verified — the app has since grown well past this scaffold into the feature set described in `CLAUDE.md`/`AGENTS.md`, which are now the living source of truth for the project's stack, database, and conventions.

Kept here only as a historical record of the initial setup decisions (e.g. the confirmed `QueryProvider → BusProvider → DeviceProvider` provider order, the single code-based `src/router.jsx` over file-based routing). For current state — including the database schema, which has changed twice since this plan was written (`nanoid(8)` text ids, `icon jsonb`, cascade deletes, category visibility flags) — see `CLAUDE.md`.
