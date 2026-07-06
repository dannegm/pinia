import { useEffect, useMemo, useState } from 'react';
import Supercluster from 'supercluster';
import { useMap } from '@/ui/map';
import { CLUSTER_MAX_ZOOM, CLUSTER_RADIUS } from '@/constants/map-defaults';

export const useClusteredPlaces = places => {
    const { map, isLoaded } = useMap();
    const [viewState, setViewState] = useState(null);

    const index = useMemo(() => {
        const nextIndex = new Supercluster({ radius: CLUSTER_RADIUS, maxZoom: CLUSTER_MAX_ZOOM });
        nextIndex.load(
            places.map(place => ({
                type: 'Feature',
                properties: { placeId: place.id },
                geometry: { type: 'Point', coordinates: [place.lng, place.lat] },
            })),
        );
        return nextIndex;
    }, [places]);

    useEffect(() => {
        if (!isLoaded || !map) return;

        const sync = () => {
            const bounds = map.getBounds();
            setViewState({
                bbox: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
                zoom: Math.round(map.getZoom()),
            });
        };

        sync();
        map.on('move', sync);

        return () => map.off('move', sync);
    }, [isLoaded, map]);

    const placesById = useMemo(() => new Map(places.map(place => [place.id, place])), [places]);

    const items = useMemo(() => {
        if (!viewState) return [];

        return index.getClusters(viewState.bbox, viewState.zoom).map(feature => {
            const [lng, lat] = feature.geometry.coordinates;

            if (!feature.properties.cluster) {
                return { type: 'place', place: placesById.get(feature.properties.placeId) };
            }

            const clusterId = feature.properties.cluster_id;
            const leafPlaces = index
                .getLeaves(clusterId, feature.properties.point_count)
                .map(leaf => placesById.get(leaf.properties.placeId))
                .filter(Boolean);

            return { type: 'cluster', id: clusterId, lng, lat, count: feature.properties.point_count, places: leafPlaces };
        });
    }, [index, viewState, placesById]);

    const zoomToCluster = (clusterId, lng, lat) => {
        if (!map) return;
        const zoom = index.getClusterExpansionZoom(clusterId);
        map.easeTo({ center: [lng, lat], zoom, duration: 500 });
    };

    return { items, zoomToCluster };
};
