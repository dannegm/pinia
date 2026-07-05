const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

export const routeQuery = (origin, destination, opts = {}) => ({
    queryKey: ['route', origin, destination],
    queryFn: async () => {
        const params = new URLSearchParams({
            api_key: ORS_API_KEY,
            start: `${origin.lng},${origin.lat}`,
            end: `${destination.lng},${destination.lat}`,
        });
        const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?${params}`);
        if (!response.ok) throw new Error('No se pudo calcular la ruta');
        const data = await response.json();
        const [feature] = data.features;
        return {
            coordinates: feature.geometry.coordinates,
            distance: feature.properties.summary.distance,
            duration: feature.properties.summary.duration,
        };
    },
    enabled: Boolean(origin && destination),
    ...opts,
});
