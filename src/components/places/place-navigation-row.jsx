import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation, Home, Star, Search } from 'lucide-react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group';
import { ScrollArea } from '@/ui/scroll-area';
import { PlaceOption } from '@/components/places/place-select';
import { placesQuery } from '@/queries/places';
import { systemPlaceQuery } from '@/queries/system-places';
import { useEvents } from '@/providers/bus-provider';
import { cn } from '@/helpers/utils';

const VISIBLE_FAVORITES = 5;

const originButtonClass = disabled =>
    cn(
        'flex-center h-8 flex-1 gap-1.5 rounded-md border border-border px-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0',
        disabled && 'pointer-events-none opacity-50',
    );

const FavoritesList = ({ favorites, onSelect }) => (
    <div className='flex flex-col gap-0.5 p-0.5'>
        {favorites.map(favorite => (
            <button
                key={favorite.id}
                type='button'
                onClick={() =>
                    onSelect({ lat: favorite.lat, lng: favorite.lng, label: favorite.name, placeId: favorite.id })
                }
                className='flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-foreground/90 hover:bg-accent'
            >
                <PlaceOption place={favorite} />
            </button>
        ))}
        {favorites.length === 0 && <p className='p-4 text-center text-sm text-foreground/70'>Sin resultados.</p>}
    </div>
);

export const PlaceNavigationRow = ({ place }) => {
    const { emit } = useEvents();
    const currentLocation = useGeolocation();
    const { data: casa } = useQuery(systemPlaceQuery('casa'));
    const { data: places = [] } = useQuery(placesQuery());
    const favorites = places.filter(p => p.is_favorite && p.id !== place.id);
    const [favoritesOpen, setFavoritesOpen] = useState(false);
    const [query, setQuery] = useState('');
    const showFilter = favorites.length > VISIBLE_FAVORITES;

    const filteredFavorites = useMemo(() => {
        if (!showFilter) return favorites;
        const q = query.trim().toLowerCase();
        return q ? favorites.filter(favorite => favorite.name.toLowerCase().includes(q)) : favorites;
    }, [favorites, query, showFilter]);

    const destination = { lat: place.lat, lng: place.lng, label: place.name, placeId: place.id };
    const setRoute = origin => {
        emit('route:set', { origin, destination });
        setFavoritesOpen(false);
        setQuery('');
    };

    return (
        <div className='flex gap-1.5'>
            <button
                type='button'
                onClick={() =>
                    currentLocation &&
                    setRoute({ lat: currentLocation.lat, lng: currentLocation.lng, label: 'Mi ubicación actual' })
                }
                disabled={!currentLocation}
                className={originButtonClass(!currentLocation)}
            >
                <Navigation />
                Ubicación
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
                className={originButtonClass(!casa?.place)}
            >
                <Home />
                Casa
            </button>

            <Popover open={favoritesOpen} onOpenChange={setFavoritesOpen}>
                <PopoverTrigger
                    render={
                        <button
                            type='button'
                            disabled={favorites.length === 0}
                            className={originButtonClass(favorites.length === 0)}
                        />
                    }
                >
                    <Star />
                    Favorito
                </PopoverTrigger>
                <PopoverContent className='w-64 gap-2 p-2' align='end'>
                    {showFilter && (
                        <InputGroup>
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                            <InputGroupInput
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder='Filtrar favoritos'
                            />
                        </InputGroup>
                    )}

                    {showFilter ? (
                        <ScrollArea className='max-h-44'>
                            <FavoritesList favorites={filteredFavorites} onSelect={setRoute} />
                        </ScrollArea>
                    ) : (
                        <FavoritesList favorites={filteredFavorites} onSelect={setRoute} />
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
};
