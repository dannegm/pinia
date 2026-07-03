import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from '@tanstack/react-router';
import { MapMarker, MarkerContent, MarkerTooltip } from '@/ui/map';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { DirectionArrow } from '@/components/direction-arrow';
import { PlacePopup } from '@/components/place-popup';
import { placesQuery } from '@/queries/places';
import { usePanelOffset } from '@/hooks/use-panel-offset';
import { useHiddenCategories } from '@/hooks/use-hidden-categories';
import { cn } from '@/helpers/utils';

export const PlacesLayer = ({ topOffset = 0 }) => {
    const { data: allPlaces = [] } = useQuery(placesQuery());
    const { left: panelLeft, bottom: panelBottom } = usePanelOffset();
    const { placeId: editingPlaceId } = useParams({ strict: false });
    const { pathname } = useLocation();
    const isPickingPosition = Boolean(editingPlaceId) || pathname === '/places/new';
    const [hiddenCategoryIds] = useHiddenCategories();

    const places = allPlaces.filter(place => !hiddenCategoryIds.includes(place.category_id));

    return (
        <>
            {places
                .filter(place => place.id !== editingPlaceId)
                .map(place => (
                    <MapMarker key={place.id} longitude={place.lng} latitude={place.lat}>
                        <MarkerContent>
                            <div
                                className={cn(
                                    'flex-center size-8 rounded-full border-2 border-white text-white shadow-md shadow-black/50 [&>svg]:size-4 bg-(--place-color)',
                                    isPickingPosition && 'opacity-15',
                                )}
                                style={{ '--place-color': place.category?.color ?? '#6b7280' }}
                            >
                                {place.category?.icon && <DynamicIcon icon={place.category.icon} />}
                            </div>
                        </MarkerContent>
                        <MarkerTooltip>{place.name}</MarkerTooltip>
                        <PlacePopup place={place} />
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
