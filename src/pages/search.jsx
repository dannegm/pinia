import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { Search } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { useMap } from '@/ui/map';
import { placesQuery } from '@/queries/places';
import { match } from '@/helpers/utils';

const matchesQuery = (place, q) =>
    place.name.toLowerCase().includes(q) ||
    place.address?.toLowerCase().includes(q) ||
    place.category?.name?.toLowerCase().includes(q);

const SearchResults = ({ query, places }) => {
    const { map } = useMap();

    const results = useMemo(() => {
        if (!query.trim()) return null;
        const q = query.trim().toLowerCase();
        return places.filter(place => matchesQuery(place, q));
    }, [query, places]);

    return match({ type: results === null ? 'idle' : results.length === 0 ? 'empty' : 'results' })
        .with({ type: 'idle' }, () => (
            <p className='text-sm text-foreground/70'>Escribe para buscar lugares.</p>
        ))
        .with({ type: 'empty' }, () => (
            <p className='text-sm text-foreground/70'>Sin resultados para "{query}".</p>
        ))
        .with({ type: 'results' }, () => (
            <div className='flex flex-col gap-2'>
                {results.map(place => (
                    <button
                        key={place.id}
                        type='button'
                        onClick={() =>
                            map.flyTo({ center: [place.lng, place.lat], zoom: 16, duration: 800 })
                        }
                        className='flex items-center gap-2 rounded-md border border-border p-2 text-left hover:bg-accent'
                    >
                        {place.category?.icon && (
                            <div
                                className='flex-center size-6 shrink-0 rounded-full text-white [&>svg]:size-3.5 bg-(--place-color)'
                                style={{ '--place-color': place.category.color }}
                            >
                                <DynamicIcon icon={place.category.icon} />
                            </div>
                        )}
                        <div>
                            <p className='text-sm text-foreground/90'>{place.name}</p>
                            {place.address && (
                                <p className='text-xs text-foreground/70'>{place.address}</p>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        ))
        .run();
};

export const SearchPage = () => {
    const [query, setQuery] = useQueryState('q', { defaultValue: '' });
    const { data: places = [] } = useQuery(placesQuery());

    return (
        <div className='flex flex-col gap-3'>
            <h2 className='text-base font-medium text-foreground/90'>Buscar</h2>

            <InputGroup>
                <InputGroupAddon>
                    <Search />
                </InputGroupAddon>
                <InputGroupInput
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder='Nombre, categoría o dirección'
                />
            </InputGroup>

            <SearchResults query={query} places={places} />
        </div>
    );
};
