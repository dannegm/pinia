import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group';
import { ScrollArea } from '@/ui/scroll-area';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { placesQuery } from '@/queries/places';

const matchesQuery = (place, q) =>
    place.name.toLowerCase().includes(q) || (place.address ?? '').toLowerCase().includes(q);

export const PlaceOption = ({ place, label = place.name }) => (
    <>
        <span
            className='size-2 shrink-0 rounded-full bg-(--place-color)'
            style={{ '--place-color': place.category?.color ?? '#6b7280' }}
        />
        <span className='flex-center shrink-0 text-foreground/70 [&>svg]:size-4'>
            {place.category?.icon && <DynamicIcon icon={place.category.icon} />}
        </span>
        {label}
    </>
);

export const PlaceSelect = ({ value, onChange, placeholder = 'Elige un lugar' }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { data: places = [] } = useQuery(placesQuery());
    const selected = places.find(place => place.id === value);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? places.filter(place => matchesQuery(place, q)) : places;
    }, [places, query]);

    const handleSelect = place => {
        onChange(place.id);
        setOpen(false);
        setQuery('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <button
                        type='button'
                        className='flex h-8 w-full items-center gap-1.5 rounded-md border border-border px-2 text-left text-sm text-foreground/90 transition-colors hover:bg-accent'
                    />
                }
            >
                {selected ? <PlaceOption place={selected} /> : <span className='text-foreground/50'>{placeholder}</span>}
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
                        {results.map(place => (
                            <button
                                key={place.id}
                                type='button'
                                onClick={() => handleSelect(place)}
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
