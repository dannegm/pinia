import { useQuery } from '@tanstack/react-query';
import { MapMarker, MarkerContent } from '@/ui/map';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { DirectionArrow } from '@/components/direction-arrow';
import { PlacePopup } from '@/components/place-popup';
import { placesQuery } from '@/queries/places';

export const PlacesLayer = () => {
    const { data: places = [] } = useQuery(placesQuery());

    return (
        <>
            {places.map(place => (
                <MapMarker key={place.id} longitude={place.lng} latitude={place.lat}>
                    <MarkerContent>
                        <div
                            className='flex-center size-7 rounded-full border-2 border-white text-white shadow-md shadow-black/50 [&>svg]:size-3.5 bg-(--place-color)'
                            style={{ '--place-color': place.category?.color ?? '#6b7280' }}
                        >
                            {place.category?.icon && <DynamicIcon icon={place.category.icon} />}
                        </div>
                    </MarkerContent>
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
                    />
                ))}
        </>
    );
};
