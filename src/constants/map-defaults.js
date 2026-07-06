import { parseAsFloatWithLimits } from '@/helpers/query-params';

export const DEFAULT_VIEWPORT = {
    center: [-108.4693, 25.5691],
    zoom: 14,
};

export const MIN_ZOOM = 4;
export const MAX_ZOOM = 18;

// Zoom level used whenever the map flies to focus a single place/point.
export const FOCUS_ZOOM = 14;

// Places cluster together (screen-space, via supercluster) up to this zoom;
// past it, every place always renders as its own marker.
export const CLUSTER_MAX_ZOOM = 16;
export const CLUSTER_RADIUS = 48;

export const parseAsZoom = parseAsFloatWithLimits(MIN_ZOOM, MAX_ZOOM);

// Brand blue — mirrors --primary in index.css. Kept as a literal hex here
// because MapLibre paint properties and inline marker styles can't read CSS
// custom properties.
export const BRAND_COLOR = '#2563eb';

// Favorite marker color (amber-500) — shared by the toggle in the place form
// and the map popup so "favorito" always renders the same color.
export const FAVORITE_COLOR = '#f59e0b';

export const MAP_STYLES = [
    {
        id: 'streets',
        label: 'Calles',
        icon: 'Map',
        url: `https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
    },
    {
        id: 'satellite',
        label: 'Satélite',
        icon: 'Satellite',
        url: `https://api.maptiler.com/maps/hybrid/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
    },
    { id: 'light', label: 'Claro', icon: 'Sun', url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' },
    { id: 'dark', label: 'Oscuro', icon: 'Moon', url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' },
];

export const DEFAULT_MAP_STYLE_ID = 'streets';
