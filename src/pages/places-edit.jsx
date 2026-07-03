import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { PlaceForm } from '@/components/place-form';
import { placesQuery, updatePlaceMutation } from '@/queries/places';

export const EditPlacePage = () => {
    const navigate = useNavigate();
    const { placeId } = useParams({ strict: false });
    const queryClient = useQueryClient();
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

    if (!place) return null;

    return (
        <div className='flex h-full flex-col gap-3'>
            <div className='flex items-center justify-between'>
                <h2 className='text-base font-medium text-foreground/90'>Editar lugar</h2>
                <button
                    type='button'
                    aria-label='Cancelar'
                    onClick={goBack}
                    className='flex-center size-6 rounded-md hover:bg-accent [&>svg]:size-4'
                >
                    <X />
                </button>
            </div>

            <PlaceForm
                initialCoords={{ lat: place.lat, lng: place.lng }}
                initialValues={{ name: place.name, categoryId: place.category_id, address: place.address }}
                onSubmit={({ categoryId, ...rest }) =>
                    mutation.mutate({ id: placeId, category_id: categoryId, ...rest })
                }
                submitLabel='Guardar cambios'
                pending={mutation.isPending}
            />
        </div>
    );
};
