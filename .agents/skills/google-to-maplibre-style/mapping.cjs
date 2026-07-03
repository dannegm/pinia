// Maps Google Maps JS style selectors (featureType + elementType) to concrete
// layers in our CARTO Positron-based MapLibre style
// (src/constants/map-style-base.json). Layer ids below are CARTO's own naming —
// re-derive this table if the base style is ever swapped for a different
// OpenMapTiles-schema provider (layer ids differ per vendor even though the
// underlying vector tile classes are the same).

const ROAD_LAYER_IDS = {
    highway: [
        'road_mot_case_ramp', 'road_trunk_case_ramp', 'road_mot_case_noramp', 'road_trunk_case_noramp',
        'road_mot_fill_ramp', 'road_trunk_fill_ramp', 'road_mot_fill_noramp', 'road_trunk_fill_noramp',
        'tunnel_trunk_case', 'tunnel_mot_case', 'tunnel_trunk_fill', 'tunnel_mot_fill',
        'bridge_trunk_case', 'bridge_mot_case', 'bridge_trunk_fill', 'bridge_mot_fill',
    ],
    arterial: [
        'road_sec_case_noramp', 'road_pri_case_ramp', 'road_pri_case_noramp',
        'road_sec_fill_noramp', 'road_pri_fill_ramp', 'road_pri_fill_noramp',
        'tunnel_sec_case', 'tunnel_pri_case', 'tunnel_sec_fill', 'tunnel_pri_fill',
        'bridge_sec_case', 'bridge_pri_case', 'bridge_sec_fill', 'bridge_pri_fill',
    ],
    local: [
        'road_service_case', 'road_minor_case', 'road_path',
        'road_service_fill', 'road_minor_fill',
        'tunnel_service_case', 'tunnel_minor_case', 'tunnel_path',
        'tunnel_service_fill', 'tunnel_minor_fill',
        'bridge_service_case', 'bridge_minor_case', 'bridge_path',
        'bridge_service_fill', 'bridge_minor_fill',
    ],
};
ROAD_LAYER_IDS.all = [...ROAD_LAYER_IDS.highway, ...ROAD_LAYER_IDS.arterial, ...ROAD_LAYER_IDS.local];

const ROAD_LABEL_IDS = {
    highway: ['roadname_major'],
    arterial: ['roadname_sec', 'roadname_pri'],
    local: ['roadname_minor'],
};
ROAD_LABEL_IDS.all = [...ROAD_LABEL_IDS.highway, ...ROAD_LABEL_IDS.arterial, ...ROAD_LABEL_IDS.local];

const PLACE_LABEL_IDS = {
    country: ['place_country_1', 'place_country_2'],
    province: ['place_state'],
    locality: ['place_town', 'place_villages', 'place_city_r6', 'place_city_r5', 'place_city_dot_r7', 'place_city_dot_r4', 'place_city_dot_r2', 'place_city_dot_z7', 'place_capital_dot_z7'],
    neighborhood: ['place_hamlet', 'place_suburbs'],
};
PLACE_LABEL_IDS.all = Object.values(PLACE_LABEL_IDS).flat();

// zone key -> { geometryLayers, labelLayers, iconLayers } (ids into map-style-base.json's `layers`)
// `unsupported: true` means: this Google featureType has no corresponding layer
// in our current base style (either the data doesn't exist in CARTO's tiles at
// all, e.g. transit, or CARTO's default Positron style doesn't pre-define a
// layer for a class that likely exists in the tile data, e.g. poi.school —
// adding a brand-new filtered layer for those is out of scope for this skill;
// report it, don't silently drop it or invent something.
const ZONES = {
    'landscape': { geometryLayers: ['background', 'landcover', 'landuse_residential', 'landuse'], labelLayers: [] },
    'landscape.man_made': { geometryLayers: ['landuse_residential', 'landuse', 'building', 'building-top'], labelLayers: [] },
    'landscape.natural': { geometryLayers: ['landcover'], labelLayers: [] },
    'landscape.natural.landcover': { geometryLayers: ['landcover'], labelLayers: [] },
    'landscape.natural.terrain': { unsupported: true, reason: 'implies hillshade/DEM, not present in this vector style' },

    'water': { geometryLayers: ['water', 'water_shadow', 'waterway'], labelLayers: ['watername_ocean', 'watername_sea', 'watername_lake', 'watername_lake_line', 'waterway_label'] },

    'road': { geometryLayers: ROAD_LAYER_IDS.all, labelLayers: ROAD_LABEL_IDS.all },
    'road.highway': { geometryLayers: ROAD_LAYER_IDS.highway, labelLayers: ROAD_LABEL_IDS.highway },
    'road.highway.controlled_access': { geometryLayers: ROAD_LAYER_IDS.highway, labelLayers: ROAD_LABEL_IDS.highway },
    'road.arterial': { geometryLayers: ROAD_LAYER_IDS.arterial, labelLayers: ROAD_LABEL_IDS.arterial },
    'road.local': { geometryLayers: ROAD_LAYER_IDS.local, labelLayers: ROAD_LABEL_IDS.local },

    'administrative': { geometryLayers: ['boundary_county', 'boundary_state', 'boundary_country_outline', 'boundary_country_inner'], labelLayers: PLACE_LABEL_IDS.all },
    'administrative.country': { geometryLayers: ['boundary_country_outline', 'boundary_country_inner'], labelLayers: PLACE_LABEL_IDS.country },
    'administrative.province': { geometryLayers: ['boundary_state'], labelLayers: PLACE_LABEL_IDS.province },
    'administrative.locality': { geometryLayers: [], labelLayers: PLACE_LABEL_IDS.locality },
    'administrative.neighborhood': { geometryLayers: [], labelLayers: PLACE_LABEL_IDS.neighborhood },
    'administrative.land_parcel': { unsupported: true, reason: 'cadastral parcels not present in this tileset' },

    'poi': { geometryLayers: [], labelLayers: ['poi_stadium'] },
    'poi.park': { geometryLayers: ['park_national_park', 'park_nature_reserve'], labelLayers: ['poi_park'] },
    'poi.attraction': { geometryLayers: [], labelLayers: ['poi_stadium'] },
    'poi.sports_complex': { geometryLayers: [], labelLayers: ['poi_stadium'] },
    'poi.business': { unsupported: true, reason: 'no distinct business POI layer in CARTO Positron' },
    'poi.government': { unsupported: true, reason: 'no distinct government POI layer in CARTO Positron' },
    'poi.medical': { unsupported: true, reason: 'no distinct medical POI layer in CARTO Positron' },
    'poi.school': { unsupported: true, reason: 'no distinct school layer in CARTO Positron (class exists in other OpenMapTiles styles, e.g. osm-bright\'s landuse-school, but not defined here)' },
    'poi.place_of_worship': { unsupported: true, reason: 'no distinct place-of-worship layer in CARTO Positron' },

    'transit': { unsupported: true, reason: 'CARTO Positron/carto.streets has no transit layer at all' },
    'transit.line': { unsupported: true, reason: 'no transit layer in this tileset' },
    'transit.station': { unsupported: true, reason: 'no transit station layer in this tileset' },
    'transit.station.rail': { unsupported: true, reason: 'no transit station layer in this tileset' },
    'transit.station.bus': { unsupported: true, reason: 'no transit station layer in this tileset' },
    'transit.station.airport': { unsupported: true, reason: 'no aerodrome_label layer in this tileset' },

    'all': { geometryLayers: '__ALL_GEOMETRY__', labelLayers: '__ALL_LABELS__' },
};

// Resolve a featureType string to its ZONES entry, falling back to the nearest
// known parent (e.g. `poi.museum` -> `poi`) the way Google's own cascade does,
// then finally to `null` if nothing matches at all.
function resolveZone(featureType) {
    if (ZONES[featureType]) return { key: featureType, ...ZONES[featureType] };
    const parts = featureType.split('.');
    while (parts.length > 1) {
        parts.pop();
        const parent = parts.join('.');
        if (ZONES[parent]) return { key: parent, ...ZONES[parent] };
    }
    return null;
}

module.exports = { ZONES, resolveZone };
