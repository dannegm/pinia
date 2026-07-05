import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from '@tanstack/react-router';
import { useQueryState } from 'nuqs';
import { MapMarker, MarkerContent, MarkerTooltip, useMap } from '@/ui/map';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { DirectionArrow } from '@/components/direction-arrow';
import { PlacePopup } from '@/components/place-popup';
import { PlaceContextMenu } from '@/components/place-context-menu';
import { placesQuery } from '@/queries/places';
import { usePanelOffset } from '@/hooks/use-panel-offset';

export const PlacesLayer = ({ topOffset = 0 }) => {
    const { map, isLoaded } = useMap();
    const { data: places = [], isSuccess: placesLoaded } = useQuery(placesQuery());
    const { left: panelLeft, bottom: panelBottom } = usePanelOffset();
    const { placeId: editingPlaceId } = useParams({ strict: false });
    const { pathname } = useLocation();
    const isPickingPosition = Boolean(editingPlaceId) || pathname === '/places/new';
    const [focusedPlaceId] = useQueryState('place', { defaultValue: '' });
    const $hydratedPlace = useRef(false);

    useEffect(() => {
        if ($hydratedPlace.current || !placesLoaded || !isLoaded) return;
        $hydratedPlace.current = true;
        if (!focusedPlaceId) return;

        const place = places.find(p => p.id === focusedPlaceId);
        if (!place) return;

        map.flyTo({ center: [place.lng, place.lat], zoom: 16, duration: 800 });
    }, [placesLoaded, isLoaded, places, focusedPlaceId, map]);

    return (
        <>
            {places
                .filter(place => place.id !== editingPlaceId)
                .map(place => (
                    <MapMarker key={place.id} longitude={place.lng} latitude={place.lat}>
                        <MarkerContent>
                            {isPickingPosition ? (
                                <div
                                    className='flex-center size-8 rounded-full border-2 border-white text-white opacity-15 shadow-md shadow-black/50 [&>svg]:size-4 bg-(--place-color)'
                                    style={{ '--place-color': place.category?.color ?? '#6b7280' }}
                                >
                                    {place.category?.icon && <DynamicIcon icon={place.category.icon} />}
                                </div>
                            ) : (
                                <PlaceContextMenu place={place}>
                                    <div
                                        className='flex-center size-8 rounded-full border-2 border-white text-white shadow-md shadow-black/50 [&>svg]:size-4 bg-(--place-color)'
                                        style={{ '--place-color': place.category?.color ?? '#6b7280' }}
                                    >
                                        {place.category?.icon && <DynamicIcon icon={place.category.icon} />}
                                    </div>
                                </PlaceContextMenu>
                            )}
                        </MarkerContent>
                        <MarkerTooltip>{place.name}</MarkerTooltip>
                        <PlacePopup place={place} autoOpen={place.id === focusedPlaceId} />
                    </MapMarker>
                ))}

            {places
                .filter(place => place.is_beacon)
                .map(place => (
                    <DirectionArrow
                        key={place.id}
                        coords={{ lat: place.lat, lng: place.lng }}
                        color={place.category?.color ?? '#6b7280'}
                        flyToZoom={16}
                        label={place.name}
                        offsets={{ left: panelLeft, bottom: panelBottom, top: topOffset }}
                    />
                ))}
        </>
    );
};
