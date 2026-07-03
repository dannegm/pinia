import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { PlaceForm } from '@/components/place-form';
import { PanelHeader } from '@/components/panel-header';
import { createPlaceMutation } from '@/queries/places';

export const AddPlacePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

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
                onSubmit={values => mutation.mutate(values)}
                submitLabel='Guardar lugar'
                pending={mutation.isPending}
            />
        </div>
    );
};
