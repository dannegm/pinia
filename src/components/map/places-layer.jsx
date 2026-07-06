import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from '@tanstack/react-router';
import { useQueryState } from 'nuqs';
import { MapMarker, MarkerContent, MarkerTooltip, useMap } from '@/ui/map';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { DirectionArrow } from '@/components/map/direction-arrow';
import { PlacePopup } from '@/components/places/place-popup';
import { PlaceContextMenu } from '@/components/places/place-context-menu';
import { placesQuery } from '@/queries/places';
import { usePanelOffset } from '@/hooks/use-panel-offset';
import { cn } from '@/helpers/utils';

export const PlacesLayer = ({ topOffset = 0, readOnly = false, pinnedIds = null }) => {
    const { map, isLoaded } = useMap();
    const { data: allPlaces = [], isSuccess: placesLoaded } = useQuery(placesQuery());
    const places = pinnedIds ? allPlaces.filter(place => pinnedIds.includes(place.id)) : allPlaces;
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

        const place = allPlaces.find(p => p.id === focusedPlaceId);
        if (!place) return;

        map.flyTo({ center: [place.lng, place.lat], zoom: 16, duration: 800 });
    }, [placesLoaded, isLoaded, allPlaces, focusedPlaceId, map]);

    return (
        <>
            {places
                .filter(place => place.id !== editingPlaceId)
                .map(place => {
                    const icon = (
                        <div
                            className={cn(
                                'flex-center size-8 rounded-full border-2 border-white text-white shadow-md shadow-black/50 [&>svg]:size-4 bg-(--place-color)',
                                { 'opacity-15': isPickingPosition },
                            )}
                            style={{ '--place-color': place.category?.color ?? '#6b7280' }}
                        >
                            {place.category?.icon && <DynamicIcon icon={place.category.icon} />}
                        </div>
                    );

                    return (
                        <MapMarker key={place.id} longitude={place.lng} latitude={place.lat}>
                            <MarkerContent>
                                {isPickingPosition || readOnly ? (
                                    icon
                                ) : (
                                    <PlaceContextMenu place={place}>{icon}</PlaceContextMenu>
                                )}
                            </MarkerContent>
                            <MarkerTooltip>{place.name}</MarkerTooltip>
                            <PlacePopup
                                place={place}
                                autoOpen={place.id === focusedPlaceId}
                                readOnly={readOnly}
                            />
                        </MapMarker>
                    );
                })}

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
