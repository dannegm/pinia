import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation, Home, Star } from 'lucide-react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { placesQuery } from '@/queries/places';
import { systemPlaceQuery } from '@/queries/system-places';
import { useEvents } from '@/providers/bus-provider';
import { cn } from '@/helpers/utils';

const navButtonClass = disabled =>
    cn(
        'flex-center size-8 rounded-md border border-border text-foreground/70 transition-colors hover:bg-accent [&>svg]:size-4',
        disabled && 'pointer-events-none opacity-50',
    );

export const PlaceNavigationRow = ({ place }) => {
    const { emit } = useEvents();
    const currentLocation = useGeolocation();
    const { data: casa } = useQuery(systemPlaceQuery('casa'));
    const { data: places = [] } = useQuery(placesQuery());
    const favorites = places.filter(p => p.is_favorite && p.id !== place.id);
    const [favoritesOpen, setFavoritesOpen] = useState(false);

    const destination = { lat: place.lat, lng: place.lng, label: place.name, placeId: place.id };
    const setRoute = origin => emit('route:set', { origin, destination });

    return (
        <div className='flex items-center gap-1 border-t border-border pt-2'>
            <button
                type='button'
                onClick={() =>
                    currentLocation &&
                    setRoute({ lat: currentLocation.lat, lng: currentLocation.lng, label: 'Mi ubicación actual' })
                }
                disabled={!currentLocation}
                title='Desde mi ubicación actual'
                aria-label='Desde mi ubicación actual'
                className={navButtonClass(!currentLocation)}
            >
                <Navigation />
            </button>

            <button
                type='button'
                onClick={() =>
                    casa?.place &&
                    setRoute({
                        lat: casa.place.lat,
                        lng: casa.place.lng,
                        label: 'Casa',
                        placeId: casa.place.id,
                    })
                }
                disabled={!casa?.place}
                title='Desde casa'
                aria-label='Desde casa'
                className={navButtonClass(!casa?.place)}
            >
                <Home />
            </button>

            <Popover open={favoritesOpen} onOpenChange={setFavoritesOpen}>
                <PopoverTrigger
                    render={
                        <button
                            type='button'
                            aria-label='Desde algún favorito'
                            title='Desde algún favorito'
                            disabled={favorites.length === 0}
                            className={navButtonClass(favorites.length === 0)}
                        />
                    }
                >
                    <Star />
                </PopoverTrigger>
                <PopoverContent className='w-56 p-1'>
                    <div className='flex flex-col'>
                        {favorites.map(favorite => (
                            <button
                                key={favorite.id}
                                type='button'
                                onClick={() => {
                                    setFavoritesOpen(false);
                                    setRoute({
                                        lat: favorite.lat,
                                        lng: favorite.lng,
                                        label: favorite.name,
                                        placeId: favorite.id,
                                    });
                                }}
                                className='rounded-md px-2 py-1.5 text-left text-sm text-foreground/90 hover:bg-accent'
                            >
                                {favorite.name}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};
