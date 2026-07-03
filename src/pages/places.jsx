import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import Fuse from 'fuse.js';
import { Plus, Pencil, Search, X, MapPinOff } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/ui/button';
import { Alert, AlertDescription } from '@/ui/alert';
import { DeletePlaceButton } from '@/components/delete-place-button';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/ui/input-group';
import { useMap } from '@/ui/map';
import { CategoryFilterSelect, useCategoryFilter } from '@/components/category-filter-select';
import { PanelHeader } from '@/components/panel-header';
import { placesQuery, deletePlaceMutation } from '@/queries/places';

export const PlacesPage = () => {
    const navigate = useNavigate();
    const { map } = useMap();
    const queryClient = useQueryClient();
    const [error, setError] = useState(null);
    const [query, setQuery] = useQueryState('q', { defaultValue: '' });
    const [selectedCategoryIds, setSelectedCategoryIds] = useCategoryFilter();
    const { data: places = [] } = useQuery(placesQuery());

    const categoryFilteredPlaces =
        selectedCategoryIds.length === 0
            ? places
            : places.filter(place => selectedCategoryIds.includes(place.category_id));

    const fuse = useMemo(
        () =>
            new Fuse(categoryFilteredPlaces, {
                keys: ['name', 'address', 'category.name'],
                threshold: 0.3,
            }),
        [categoryFilteredPlaces],
    );

    const filteredPlaces = query.trim()
        ? fuse.search(query.trim()).map(result => result.item)
        : categoryFilteredPlaces;

    const toggleCategory = id =>
        setSelectedCategoryIds(current =>
            current.includes(id) ? current.filter(c => c !== id) : [...current, id],
        );

    const deleteMutation = useMutation(
        deletePlaceMutation({
            onSuccess: () => {
                setError(null);
                queryClient.invalidateQueries({ queryKey: ['places'] });
                queryClient.invalidateQueries({ queryKey: ['system-places'] });
            },
            onError: () => setError('No se pudo eliminar el lugar.'),
        }),
    );

    const hasFilter = selectedCategoryIds.length > 0 || Boolean(query.trim());
    const plural = filteredPlaces.length === 1 ? 'lugar' : 'lugares';
    const summary =
        places.length === 0
            ? 'Aún no hay lugares guardados.'
            : hasFilter
              ? `${filteredPlaces.length} ${plural} con este filtro.`
              : `${filteredPlaces.length} ${plural} guardado${filteredPlaces.length === 1 ? '' : 's'}.`;

    return (
        <div className='flex h-full min-h-0 flex-col'>
            <PanelHeader title='Lugares' description={summary} />

            <div className='flex shrink-0 flex-col gap-3 p-4 pb-3'>
                <InputGroup>
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder='Filtrar lugares'
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

                <CategoryFilterSelect
                    selected={selectedCategoryIds}
                    onToggle={toggleCategory}
                    onClear={() => setSelectedCategoryIds([])}
                />

                {error && (
                    <Alert variant='destructive'>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </div>

            <div className='flex-1 min-h-0 overflow-y-auto p-4 pt-0'>
                <div className='flex flex-col gap-2'>
                    {filteredPlaces.map(place => (
                        <div
                            key={place.id}
                            className='flex items-center gap-2 squircle-lg border border-border/70 bg-card p-2.5 shadow-sm shadow-black/5 transition-colors hover:border-border hover:bg-muted/40'
                        >
                            <button
                                type='button'
                                onClick={() =>
                                    map.flyTo({ center: [place.lng, place.lat], zoom: 16, duration: 800 })
                                }
                                className='flex flex-1 items-center gap-2.5 text-left'
                            >
                                {place.category?.icon && (
                                    <div
                                        className='flex-center size-7 shrink-0 rounded-full text-white ring-4 ring-(--place-color)/10 [&>svg]:size-3.5 bg-(--place-color)'
                                        style={{ '--place-color': place.category.color }}
                                    >
                                        <DynamicIcon icon={place.category.icon} />
                                    </div>
                                )}
                                <Tooltip>
                                    <TooltipTrigger
                                        render={
                                            <p className='line-clamp-1 min-w-0 flex-1 text-left text-sm break-all text-foreground/90' />
                                        }
                                    >
                                        {place.name}
                                    </TooltipTrigger>
                                    <TooltipContent>{place.name}</TooltipContent>
                                </Tooltip>
                            </button>
                            <button
                                type='button'
                                aria-label='Editar'
                                onClick={() =>
                                    navigate({ to: '/places/$placeId/edit', params: { placeId: place.id } })
                                }
                                className='flex-center size-8 shrink-0 rounded-md text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground [&>svg]:size-4'
                            >
                                <Pencil />
                            </button>
                            <DeletePlaceButton place={place} onConfirm={() => deleteMutation.mutate(place.id)} />
                        </div>
                    ))}

                    {places.length === 0 && (
                        <div className='flex flex-col items-center gap-2 py-10 text-center'>
                            <MapPinOff className='size-6 text-foreground/40' />
                            <p className='text-sm text-foreground/70'>Aún no guardas ningún lugar.</p>
                            <p className='text-xs text-foreground/50'>
                                Agrégalos desde aquí o con clic derecho en el mapa.
                            </p>
                        </div>
                    )}

                    {places.length > 0 && filteredPlaces.length === 0 && (
                        <div className='flex flex-col items-center gap-2 py-10 text-center'>
                            <MapPinOff className='size-6 text-foreground/40' />
                            <p className='text-sm text-foreground/70'>Ningún lugar coincide con este filtro.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className='shrink-0 border-t border-border/70 p-4 pt-3'>
                <Button className='h-10 w-full' onClick={() => navigate({ to: '/places/new' })}>
                    <Plus />
                    Agregar lugar
                </Button>
            </div>
        </div>
    );
};
