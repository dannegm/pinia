export const DEFAULT_VIEWPORT = {
    center: [-108.4693, 25.5691],
    zoom: 14,
};

export const MIN_ZOOM = 9;
export const MAX_ZOOM = 18;

// Brand blue — mirrors --primary in index.css. Kept as a literal hex here
// because MapLibre paint properties and inline marker styles can't read CSS
// custom properties.
export const BRAND_COLOR = '#2563eb';

// Favorite marker color (amber-500) — shared by the toggle in the place form
// and the map popup so "favorito" always renders the same color.
export const FAVORITE_COLOR = '#f59e0b';

export const MAP_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`;
