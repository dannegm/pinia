import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group';
import { ScrollArea } from '@/ui/scroll-area';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { categoriesQuery } from '@/queries/categories';

const CategoryOption = ({ category }) => (
    <>
        <span
            className='size-2 shrink-0 rounded-full bg-(--category-color)'
            style={{ '--category-color': category.color }}
        />
        <span className='flex-center shrink-0 text-foreground/70 [&>svg]:size-4'>
            <DynamicIcon icon={category.icon} />
        </span>
        {category.name}
    </>
);

export const CategorySelect = ({ value, onChange, placeholder = 'Elige una categoría' }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { data: categories = [] } = useQuery(categoriesQuery());
    const selected = categories.find(category => category.id === value);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? categories.filter(category => category.name.toLowerCase().includes(q)) : categories;
    }, [categories, query]);

    const handleSelect = category => {
        onChange(category.id);
        setOpen(false);
        setQuery('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <button
                        type='button'
                        className='flex h-8 w-full items-center gap-1.5 rounded-lg border border-border px-2 text-left text-sm text-foreground/90 transition-colors hover:bg-accent'
                    />
                }
            >
                {selected ? (
                    <CategoryOption category={selected} />
                ) : (
                    <span className='text-foreground/50'>{placeholder}</span>
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
                        placeholder='Buscar categoría'
                    />
                </InputGroup>

                <ScrollArea className='h-56'>
                    <div className='flex flex-col gap-0.5 p-0.5'>
                        {results.map(category => (
                            <button
                                key={category.id}
                                type='button'
                                onClick={() => handleSelect(category)}
                                className='flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-foreground/90 hover:bg-accent'
                            >
                                <CategoryOption category={category} />
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
