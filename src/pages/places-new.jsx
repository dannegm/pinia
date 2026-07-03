import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useQueryState, parseAsFloat } from 'nuqs';
import { PlaceForm } from '@/components/place-form';
import { PanelHeader } from '@/components/panel-header';
import { createPlaceMutation } from '@/queries/places';

export const AddPlacePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [lat] = useQueryState('lat', parseAsFloat);
    const [lng] = useQueryState('lng', parseAsFloat);

    const goBack = () => navigate({ to: '/places' });

    const mutation = useMutation(
        createPlaceMutation({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['places'] });
                goBack();
            },
        }),
    );

    return (
        <div className='flex h-full flex-col gap-3'>
            <PanelHeader title='Nuevo lugar' onBack={goBack} />

            <PlaceForm
                initialCoords={lat != null && lng != null ? { lat, lng } : undefined}
                onSubmit={values => mutation.mutate(values)}
                submitLabel='Guardar lugar'
                pending={mutation.isPending}
            />
        </div>
    );
};
