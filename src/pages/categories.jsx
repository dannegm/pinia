import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import Fuse from 'fuse.js';
import { Plus, Pencil, Search, X, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/ui/button';
import { Alert, AlertDescription } from '@/ui/alert';
import { ConfirmDeleteButton } from '@/ui/confirm-delete-button';
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
            },
            onError: err => {
                setError(
                    err.code === '23503'
                        ? 'No se puede eliminar: hay lugares usando esta categoría.'
                        : 'No se pudo eliminar la categoría.',
                );
            },
        }),
    );

    return (
        <div className='flex h-full flex-col gap-3'>
            <div>
                <PanelHeader title='Categorías' />
                <p className='text-sm text-foreground/70'>
                    {categories.length === 0
                        ? 'Aún no hay categorías.'
                        : query.trim()
                          ? `${filteredCategories.length} categoría${filteredCategories.length === 1 ? '' : 's'} con este filtro.`
                          : `${categories.length} categoría${categories.length === 1 ? '' : 's'}.`}
                </p>
            </div>

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

            <div className='flex-1 overflow-y-auto'>
                <div className='flex flex-col gap-2'>
                    {filteredCategories.map(category => (
                        <div
                            key={category.id}
                            className='flex items-center gap-2 rounded-md border border-border p-2'
                        >
                            <div
                                className='flex-center size-6 shrink-0 rounded-full text-white [&>svg]:size-3.5 bg-(--category-color)'
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
                                className='flex-center size-8 shrink-0 rounded-md text-foreground/70 transition-colors hover:bg-accent [&>svg]:size-4'
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
                                className='flex-center size-8 shrink-0 rounded-md text-foreground/70 transition-colors hover:bg-accent [&>svg]:size-4'
                            >
                                <Pencil />
                            </button>
                            <ConfirmDeleteButton
                                itemLabel={`"${category.name}"`}
                                onConfirm={() => deleteMutation.mutate(category.id)}
                            />
                        </div>
                    ))}

                    {categories.length > 0 && filteredCategories.length === 0 && (
                        <p className='text-sm text-foreground/70'>Ninguna categoría coincide con este filtro.</p>
                    )}
                </div>
            </div>

            <div className='sticky bottom-0'>
                <Button className='h-10 w-full' onClick={() => navigate({ to: '/categories/new' })}>
                    <Plus />
                    Agregar categoría
                </Button>
            </div>
        </div>
    );
};
