import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/ui/button';
import { Alert, AlertDescription } from '@/ui/alert';
import { ConfirmDeleteButton } from '@/ui/confirm-delete-button';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { useMap } from '@/ui/map';
import { placesQuery, deletePlaceMutation } from '@/queries/places';

export const PlacesPage = () => {
    const navigate = useNavigate();
    const { map } = useMap();
    const queryClient = useQueryClient();
    const [error, setError] = useState(null);
    const { data: places = [] } = useQuery(placesQuery());

    const deleteMutation = useMutation(
        deletePlaceMutation({
            onSuccess: () => {
                setError(null);
                queryClient.invalidateQueries({ queryKey: ['places'] });
            },
            onError: err => {
                setError(
                    err.code === '23503'
                        ? 'No se puede eliminar: este lugar está asignado como "casa" en Ajustes.'
                        : 'No se pudo eliminar el lugar.',
                );
            },
        }),
    );

    return (
        <div className='flex h-full flex-col gap-3'>
            <div>
                <h2 className='text-base font-medium text-foreground/90'>Lugares</h2>
                <p className='text-sm text-foreground/70'>
                    {places.length === 0
                        ? 'Aún no hay lugares guardados.'
                        : `${places.length} lugar${places.length === 1 ? '' : 'es'} guardado${places.length === 1 ? '' : 's'}.`}
                </p>
            </div>

            {error && (
                <Alert variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className='flex-1 overflow-y-auto'>
                <div className='flex flex-col gap-2'>
                    {places.map(place => (
                        <div
                            key={place.id}
                            className='flex items-center gap-2 rounded-md border border-border p-2'
                        >
                            <button
                                type='button'
                                onClick={() =>
                                    map.flyTo({ center: [place.lng, place.lat], zoom: 16, duration: 800 })
                                }
                                className='flex flex-1 items-center gap-2 text-left'
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
                            <button
                                type='button'
                                aria-label='Editar'
                                onClick={() =>
                                    navigate({ to: '/places/$placeId/edit', params: { placeId: place.id } })
                                }
                                className='flex-center size-8 shrink-0 rounded-md text-foreground/70 transition-colors hover:bg-accent [&>svg]:size-4'
                            >
                                <Pencil />
                            </button>
                            <ConfirmDeleteButton
                                itemLabel={`"${place.name}"`}
                                onConfirm={() => deleteMutation.mutate(place.id)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className='sticky bottom-0'>
                <Button className='w-full' onClick={() => navigate({ to: '/places/new' })}>
                    <Plus />
                    Agregar lugar
                </Button>
            </div>
        </div>
    );
};
