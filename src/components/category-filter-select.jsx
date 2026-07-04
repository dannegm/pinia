import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQueryState, parseAsArrayOf, parseAsString, parseAsBoolean } from 'nuqs';
import { Search, Check, ListFilter, Star } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group';
import { ScrollArea } from '@/ui/scroll-area';
import { Separator } from '@/ui/separator';
import { Button } from '@/ui/button';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { categoriesQuery } from '@/queries/categories';
import { cn } from '@/helpers/utils';

export const useCategoryFilter = () =>
    useQueryState('categories', parseAsArrayOf(parseAsString).withDefault([]));

export const useFavoritesFilter = () => useQueryState('favorites', parseAsBoolean.withDefault(false));

export const CategoryFilterSelect = ({ selected, onToggle, onClear, favoritesOnly, onToggleFavorites }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { data: categories = [] } = useQuery(categoriesQuery());

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? categories.filter(category => category.name.toLowerCase().includes(q)) : categories;
    }, [categories, query]);

    if (categories.length === 0) return null;

    const selectedCategories = categories.filter(category => selected.includes(category.id));
    const activeCount = selected.length + (favoritesOnly ? 1 : 0);
    const activeLabels = [...(favoritesOnly ? ['Favoritos'] : []), ...selectedCategories.map(c => c.name)];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <button
                        type='button'
                        className={cn(
                            'flex h-8 w-full items-center gap-1.5 rounded-lg border px-2 text-left text-sm text-foreground/90 transition-colors',
                            {
                                'border-primary/40 bg-primary/5': activeCount > 0,
                                'border-border hover:bg-accent hover:text-accent-foreground': activeCount === 0,
                            },
                        )}
                    />
                }
            >
                <ListFilter
                    className={cn('size-4 shrink-0 text-foreground/50', { 'text-primary': activeCount > 0 })}
                />
                {activeLabels.length === 0 ? (
                    <span className='text-foreground/50'>Filtrar por categoría</span>
                ) : (
                    <span className='line-clamp-1 min-w-0 flex-1 break-all'>{activeLabels.join(', ')}</span>
                )}
                {activeCount > 0 && (
                    <span className='flex-center size-5 shrink-0 rounded-full bg-primary text-xs font-medium text-primary-foreground'>
                        {activeCount}
                    </span>
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

                <button
                    type='button'
                    onClick={onToggleFavorites}
                    aria-pressed={favoritesOnly}
                    className='flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-foreground/90 hover:bg-accent hover:text-accent-foreground'
                >
                    <span className='flex-center shrink-0 text-foreground/70 [&>svg]:size-4'>
                        <Star className={cn(favoritesOnly && 'fill-current text-amber-500')} />
                    </span>
                    <span className='line-clamp-1 min-w-0 flex-1 break-all'>Favoritos</span>
                    {favoritesOnly && <Check className='size-4 shrink-0 text-primary' />}
                </button>

                <Separator />

                <ScrollArea className='h-56'>
                    <div className='flex flex-col gap-0.5 p-0.5'>
                        {results.map(category => {
                            const active = selected.includes(category.id);
                            return (
                                <button
                                    key={category.id}
                                    type='button'
                                    onClick={() => onToggle(category.id)}
                                    aria-pressed={active}
                                    className='flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-foreground/90 hover:bg-accent hover:text-accent-foreground'
                                >
                                    <span
                                        className='size-2 shrink-0 rounded-full bg-(--category-color)'
                                        style={{ '--category-color': category.color }}
                                    />
                                    <span className='flex-center shrink-0 text-foreground/70 [&>svg]:size-4'>
                                        <DynamicIcon icon={category.icon} />
                                    </span>
                                    <span className='line-clamp-1 min-w-0 flex-1 break-all'>{category.name}</span>
                                    {active && <Check className='size-4 shrink-0 text-primary' />}
                                </button>
                            );
                        })}
                        {results.length === 0 && (
                            <p className='p-4 text-center text-sm text-foreground/70'>Sin resultados.</p>
                        )}
                    </div>
                </ScrollArea>

                {activeCount > 0 && (
                    <Button type='button' variant='ghost' size='sm' onClick={onClear} className='w-full'>
                        Limpiar filtro
                    </Button>
                )}
            </PopoverContent>
        </Popover>
    );
};
