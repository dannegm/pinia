---
name: google-to-maplibre-style
description: >
  Converts a Google Maps JS style JSON (featureType/elementType/stylers) into
  edits on Pinia's MapLibre map style, using a documented mapping table and
  real HSL math instead of ad-hoc guessing. Auto-trigger whenever the owner
  pastes a Google Maps style JSON array (objects with featureType/stylers
  keys) and wants it applied to the map, or asks to adjust the map's visual
  style using a Google-style reference.
  Invoke as: /google-to-maplibre-style <paste the Google style JSON>
---

# /google-to-maplibre-style

Pinia's map uses MapLibre GL (via mapcn), not Google Maps JS — the two have
incompatible style formats. Google's `featureType`/`elementType`/`stylers`
JSON cannot be pasted in directly; it has to be translated. This skill does
that translation mechanically, based on `mapping.cjs` (the featureType →
CARTO-layer table) and `convert.cjs` (the converter), instead of
reinterpreting each pasted style from scratch — that inconsistency was the
whole reason this skill exists (see `src/constants/map-style-sources/`'s
history for what went wrong before it did).

## What to do when invoked

1. **Save the pasted JSON verbatim** as the next numbered file in
   `src/constants/map-style-sources/`, e.g. `004-<short-slug>.json` (slug
   describes what the paste changes, kebab-case, a few words). Don't edit or
   "clean up" the JSON — save exactly what was pasted.
2. **Run the converter** from the project root:
   ```bash
   node .agents/skills/google-to-maplibre-style/convert.cjs
   ```
   This rebuilds `src/constants/map-style.json` from scratch every time:
   pristine base (`map-style-base.json`, never edited directly) + every file
   in `map-style-sources/` replayed in filename order. It never edits the
   previous output — that's what caused compounding drift before.
3. **Report back verbatim** what the script printed: the "Applied" list (what
   changed and on which layers) and the "Skipped / unsupported" list (with
   reasons). Don't paraphrase or summarize away the skipped items — the owner
   explicitly wants to know when something couldn't be applied, not have it
   silently dropped.
4. If the script reports a featureType with **no mapping entry at all**
   (`unknown featureType, not in mapping.js`), that's a gap in `mapping.cjs`,
   not a dead end — read `mapping.cjs`, figure out which CARTO Positron
   layer(s) in `src/constants/map-style-base.json` correspond to that
   featureType (grep the layer `id`/`source-layer`/`filter` fields), add an
   entry to the `ZONES` table, then re-run the converter. Ask the owner only
   if the right CARTO layer genuinely isn't findable.

## Rules the converter encodes (don't relitigate these without the owner)

- **A blanket `featureType: "all"` selector never shifts saturation/lightness.**
  Real trial and error showed this drifts colors nobody asked to change (a
  subtly blue-gray admin color turned visibly blue). `"all"` still applies
  `visibility` and `weight` (line-width) globally — those don't have this
  drift problem.
- **Saturation/lightness stylers shift the CURRENT color of a layer**, which
  because sources replay in order already reflects any earlier source's
  explicit `color` styler on that same zone. This is what "respect the colors
  already used" means mechanically — never invent an unrelated hue by hand.
- **`visibility: "simplified"` has no MapLibre equivalent** (no vector LOD
  control at the style level) — treated as `"visible"`, documented as an
  approximation, not silently treated as `"on"` without a trace.
- **Known unsupported zones** (already in `mapping.cjs`, marked
  `unsupported: true` with a `reason`): `administrative.land_parcel` (no
  cadastral data in this tileset), `landscape.natural.terrain` (implies
  hillshade/DEM, not vector), `transit` and all its subtypes (CARTO's
  `carto.streets` source has no transit layer at all), several `poi.*`
  subtypes CARTO Positron doesn't pre-define as their own layer
  (`poi.business`, `poi.government`, `poi.medical`, `poi.school`,
  `poi.place_of_worship`) even though the underlying vector tiles likely
  carry those classes — adding brand-new filtered layers for those is out of
  scope for this skill; report them, don't invent a layer.
- **Zoom-interpolated colors (`{stops: [...]}`) aren't saturation/lightness-
  shiftable** — the HSL math only operates on flat `#rrggbb` strings. `color`
  stylers still overwrite them directly. If a saturation/lightness rule
  targets a layer whose current color is a stops object (e.g. `building`),
  it's silently left unchanged today — flag this to the owner if it matters
  for a specific layer, since fixing it means picking a representative flat
  color to shift instead of the zoom-based gradient.

## If the mapping needs to grow

`mapping.cjs`'s `ZONES` table only covers featureTypes actually seen so far.
Extending it for a new featureType:
1. Find the matching layer(s) in `src/constants/map-style-base.json` — grep
   by `source-layer` (OpenMapTiles source-layers: `landcover`, `landuse`,
   `water`, `waterway`, `transportation`, `transportation_name`, `building`,
   `boundary`, `place`, `poi`, `aeroway`, `water_name`) and by `filter`
   (`class`/`subclass` values).
2. Add a `ZONES` entry: `geometryLayers` (fill/line/background layer ids) and
   `labelLayers` (symbol layer ids). Leave either empty array if that
   dimension doesn't apply (e.g. `poi.park`'s geometry is the park fill
   layers, its labels are `poi_park`).
3. If genuinely nothing in the base style corresponds, mark it
   `{ unsupported: true, reason: '...' }` instead of forcing a bad mapping.

## If the base style ever changes providers

`ZONES`'s layer ids are CARTO Positron's own naming
(`carto.streets`/`positron-gl-style`). A different OpenMapTiles-schema
provider (OpenFreeMap, MapTiler, self-hosted) uses the same source-layer/class
vocabulary but different layer `id`s — re-derive the `ZONES` table against the
new base style's actual layer ids, the translation logic in `convert.cjs`
doesn't need to change.
