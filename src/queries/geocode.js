const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

export const reverseGeocodeMutation = (opts = {}) => ({
    mutationFn: async ({ lat, lng }) => {
        const params = new URLSearchParams({
            api_key: ORS_API_KEY,
            'point.lon': lng,
            'point.lat': lat,
        });
        const response = await fetch(`https://api.openrouteservice.org/geocode/reverse?${params}`);
        if (!response.ok) throw new Error('No se pudo obtener la dirección');
        const data = await response.json();
        const [feature] = data.features;
        if (!feature) throw new Error('No se encontró una dirección para este punto');
        return feature.properties.label;
    },
    ...opts,
});
