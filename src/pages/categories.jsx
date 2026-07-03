import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import Fuse from 'fuse.js';
import { Plus, Pencil, Search, X, Eye, EyeOff, Tags } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/ui/button';
import { Alert, AlertDescription } from '@/ui/alert';
import { DeleteCategoryButton } from '@/components/delete-category-button';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/ui/input-group';
import { PanelHeader } from '@/components/panel-header';
import { useHiddenCategories } from '@/hooks/use-hidden-categories';
import { categoriesQuery, deleteCategoryMutation } from '@/queries/categories';

export const CategoriesPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState(null);
    const [query, setQuery] = useQueryState('q', { defaultValue: '' });
    const [hiddenCategoryIds, toggleCategoryVisibility] = useHiddenCategories();
    const { data: categories = [] } = useQuery(categoriesQuery());

    const fuse = useMemo(
        () => new Fuse(categories, { keys: ['name'], threshold: 0.3 }),
        [categories],
    );

    const filteredCategories = query.trim()
        ? fuse.search(query.trim()).map(result => result.item)
        : categories;

    const deleteMutation = useMutation(
        deleteCategoryMutation({
            onSuccess: () => {
                setError(null);
                queryClient.invalidateQueries({ queryKey: ['categories'] });
                queryClient.invalidateQueries({ queryKey: ['places'] });
                queryClient.invalidateQueries({ queryKey: ['system-places'] });
            },
            onError: () => setError('No se pudo eliminar la categoría.'),
        }),
    );

    return (
        <div className='flex h-full min-h-0 flex-col'>
            <PanelHeader
                title='Categorías'
                description={
                    categories.length === 0
                        ? 'Aún no hay categorías.'
                        : query.trim()
                          ? `${filteredCategories.length} categoría${filteredCategories.length === 1 ? '' : 's'} con este filtro.`
                          : `${categories.length} categoría${categories.length === 1 ? '' : 's'}.`
                }
            />

            <div className='flex shrink-0 flex-col gap-3 p-4 pb-3'>
                <InputGroup>
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder='Filtrar categorías'
                    />
                    {query && (
                        <InputGroupAddon align='inline-end'>
                            <InputGroupButton
                                type='button'
                                size='icon-xs'
                                aria-label='Limpiar búsqueda'
                                onClick={() => setQuery('')}
                            >
                                <X />
                            </InputGroupButton>
                        </InputGroupAddon>
                    )}
                </InputGroup>

                {error && (
                    <Alert variant='destructive'>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </div>

            <div className='flex-1 min-h-0 overflow-y-auto p-4 pt-0'>
                <div className='flex flex-col gap-2'>
                    {filteredCategories.map(category => (
                        <div
                            key={category.id}
                            className='flex items-center gap-2.5 squircle-lg border border-border/70 bg-card p-2.5 shadow-sm shadow-black/5 transition-colors hover:border-border hover:bg-muted/40'
                        >
                            <div
                                className='flex-center size-7 shrink-0 rounded-full text-white ring-4 ring-(--category-color)/10 [&>svg]:size-3.5 bg-(--category-color)'
                                style={{ '--category-color': category.color }}
                            >
                                <DynamicIcon icon={category.icon} />
                            </div>
                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <span className='line-clamp-1 min-w-0 flex-1 text-sm break-all text-foreground/90' />
                                    }
                                >
                                    {category.name}
                                </TooltipTrigger>
                                <TooltipContent>{category.name}</TooltipContent>
                            </Tooltip>
                            <button
                                type='button'
                                aria-label={hiddenCategoryIds.includes(category.id) ? 'Mostrar en el mapa' : 'Ocultar del mapa'}
                                title={hiddenCategoryIds.includes(category.id) ? 'Mostrar en el mapa' : 'Ocultar del mapa'}
                                onClick={() => toggleCategoryVisibility(category.id)}
                                className='flex-center size-8 shrink-0 rounded-md text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground [&>svg]:size-4'
                            >
                                {hiddenCategoryIds.includes(category.id) ? <EyeOff /> : <Eye />}
                            </button>
                            <button
                                type='button'
                                aria-label='Editar'
                                onClick={() =>
                                    navigate({
                                        to: '/categories/$categoryId/edit',
                                        params: { categoryId: category.id },
                                    })
                                }
                                className='flex-center size-8 shrink-0 rounded-md text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground [&>svg]:size-4'
                            >
                                <Pencil />
                            </button>
                            <DeleteCategoryButton
                                category={category}
                                onConfirm={() => deleteMutation.mutate(category.id)}
                            />
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <div className='flex flex-col items-center gap-2 py-10 text-center'>
                            <Tags className='size-6 text-foreground/40' />
                            <p className='text-sm text-foreground/70'>Aún no creas ninguna categoría.</p>
                            <p className='text-xs text-foreground/50'>Crea la primera para empezar a guardar lugares.</p>
                        </div>
                    )}

                    {categories.length > 0 && filteredCategories.length === 0 && (
                        <div className='flex flex-col items-center gap-2 py-10 text-center'>
                            <Tags className='size-6 text-foreground/40' />
                            <p className='text-sm text-foreground/70'>Ninguna categoría coincide con este filtro.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className='shrink-0 border-t border-border/70 p-4 pt-3'>
                <Button className='h-10 w-full' onClick={() => navigate({ to: '/categories/new' })}>
                    <Plus />
                    Agregar categoría
                </Button>
            </div>
        </div>
    );
};
