import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { PlaceForm } from '@/components/place-form';
import { PanelHeader } from '@/components/panel-header';
import { Alert, AlertDescription } from '@/ui/alert';
import { ConfirmDeleteButton } from '@/ui/confirm-delete-button';
import { placesQuery, updatePlaceMutation, deletePlaceMutation } from '@/queries/places';

export const EditPlacePage = () => {
    const navigate = useNavigate();
    const { placeId } = useParams({ strict: false });
    const queryClient = useQueryClient();
    const [deleteError, setDeleteError] = useState(null);
    const { data: places = [] } = useQuery(placesQuery());
    const place = places.find(p => p.id === placeId);

    const goBack = () => navigate({ to: '/places' });

    const mutation = useMutation(
        updatePlaceMutation({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['places'] });
                goBack();
            },
        }),
    );

    const deleteMutation = useMutation(
        deletePlaceMutation({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['places'] });
                goBack();
            },
            onError: err => {
                setDeleteError(
                    err.code === '23503'
                        ? 'No se puede eliminar: este lugar está asignado como "casa" en Ajustes.'
                        : 'No se pudo eliminar el lugar.',
                );
            },
        }),
    );

    if (!place) return null;

    return (
        <div className='flex h-full flex-col gap-3'>
            <PanelHeader title='Editar lugar' onBack={goBack} />

            {deleteError && (
                <Alert variant='destructive'>
                    <AlertDescription>{deleteError}</AlertDescription>
                </Alert>
            )}

            <PlaceForm
                mode='edit'
                initialCoords={{ lat: place.lat, lng: place.lng }}
                initialValues={{
                    name: place.name,
                    categoryId: place.category_id,
                    address: place.address,
                    hours: place.hours,
                    notes: place.notes,
                    isFavorite: place.is_favorite,
                    isBeacon: place.is_beacon,
                }}
                onSubmit={({ categoryId, isFavorite, isBeacon, ...rest }) =>
                    mutation.mutate({
                        id: placeId,
                        category_id: categoryId,
                        is_favorite: isFavorite,
                        is_beacon: isBeacon,
                        ...rest,
                    })
                }
                submitLabel='Guardar cambios'
                pending={mutation.isPending}
                secondaryAction={
                    <ConfirmDeleteButton
                        itemLabel={`"${place.name}"`}
                        onConfirm={() => deleteMutation.mutate(placeId)}
                        label='Eliminar'
                        className='h-10 w-full'
                    />
                }
            />
        </div>
    );
};
