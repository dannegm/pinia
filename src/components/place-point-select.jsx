import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, PersonStanding } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group';
import { ScrollArea } from '@/ui/scroll-area';
import { PlaceOption } from '@/components/place-select';
import { placesQuery } from '@/queries/places';
import { systemPlaceQuery } from '@/queries/system-places';
import { useGeolocation } from '@/hooks/use-geolocation';
import { cn } from '@/helpers/utils';

const CURRENT_LOCATION_COLOR = '#3b82f6';

const matchesQuery = (place, q) =>
    place.name.toLowerCase().includes(q) || (place.address ?? '').toLowerCase().includes(q);

const CurrentLocationOption = () => (
    <>
        <span
            className='size-2 shrink-0 rounded-full bg-(--point-color)'
            style={{ '--point-color': CURRENT_LOCATION_COLOR }}
        />
        <span className='flex-center shrink-0 text-foreground/70 [&>svg]:size-4'>
            <PersonStanding />
        </span>
        Mi ubicación actual
    </>
);

export const PlacePointSelect = ({ value, onChange, placeholder, className }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const currentLocation = useGeolocation();
    const { data: casa } = useQuery(systemPlaceQuery('casa'));
    const { data: places = [] } = useQuery(placesQuery());
    const selectedPlace = places.find(place => place.id === value?.placeId);
    const isSelectedCurrentLocation = !value?.placeId && value?.label === 'Mi ubicación actual';

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? places.filter(place => matchesQuery(place, q)) : places;
    }, [places, query]);

    const handleSelect = point => {
        onChange(point);
        setOpen(false);
        setQuery('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <button
                        type='button'
                        className={cn(
                            'flex h-8 w-full items-center gap-1.5 rounded-lg border border-border px-2 text-left text-sm text-foreground/90 transition-colors hover:bg-accent',
                            className,
                        )}
                    />
                }
            >
                {selectedPlace ? (
                    <PlaceOption place={selectedPlace} label={value.label} />
                ) : isSelectedCurrentLocation ? (
                    <CurrentLocationOption />
                ) : (
                    <span className='truncate text-foreground/50'>{value?.label ?? placeholder}</span>
                )}
            </PopoverTrigger>
            <PopoverContent className='w-64 gap-2 p-2' align='start'>
                <InputGroup>
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder='Buscar lugar'
                    />
                </InputGroup>

                <ScrollArea className='h-56'>
                    <div className='flex flex-col gap-0.5 p-0.5'>
                        {currentLocation && (
                            <button
                                type='button'
                                onClick={() =>
                                    handleSelect({
                                        lat: currentLocation.lat,
                                        lng: currentLocation.lng,
                                        label: 'Mi ubicación actual',
                                    })
                                }
                                className='flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-foreground/90 hover:bg-accent'
                            >
                                <CurrentLocationOption />
                            </button>
                        )}
                        {casa?.place && (
                            <button
                                type='button'
                                onClick={() =>
                                    handleSelect({
                                        lat: casa.place.lat,
                                        lng: casa.place.lng,
                                        label: 'Casa',
                                        placeId: casa.place.id,
                                    })
                                }
                                className='flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-foreground/90 hover:bg-accent'
                            >
                                <PlaceOption place={casa.place} label='Casa' />
                            </button>
                        )}
                        {results.map(place => (
                            <button
                                key={place.id}
                                type='button'
                                onClick={() =>
                                    handleSelect({
                                        lat: place.lat,
                                        lng: place.lng,
                                        label: place.name,
                                        placeId: place.id,
                                    })
                                }
                                className='flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-foreground/90 hover:bg-accent'
                            >
                                <PlaceOption place={place} />
                            </button>
                        ))}
                        {results.length === 0 && (
                            <p className='p-4 text-center text-sm text-foreground/70'>Sin resultados.</p>
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};
