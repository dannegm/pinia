import { useQuery } from '@tanstack/react-query';
import { MapMarker, MarkerContent, MarkerPopup } from '@/ui/map';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { placesQuery } from '@/queries/places';

export const PlacesLayer = () => {
    const { data: places = [] } = useQuery(placesQuery());

    return places.map(place => (
        <MapMarker key={place.id} longitude={place.lng} latitude={place.lat}>
            <MarkerContent>
                <div
                    className='flex-center size-7 rounded-full border-2 border-white text-white shadow-md shadow-black/50 [&>svg]:size-3.5 bg-(--place-color)'
                    style={{ '--place-color': place.category?.color ?? '#6b7280' }}
                >
                    {place.category?.icon && <DynamicIcon icon={place.category.icon} />}
                </div>
            </MarkerContent>
            <MarkerPopup closeButton>
                <p className='text-sm font-medium text-foreground/90'>{place.name}</p>
                {place.category?.name && (
                    <p className='text-xs text-foreground/70'>{place.category.name}</p>
                )}
                {place.address && <p className='text-xs text-foreground/70'>{place.address}</p>}
            </MarkerPopup>
        </MapMarker>
    ));
};
