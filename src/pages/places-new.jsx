import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useQueryState, parseAsFloat } from 'nuqs';
import { Maximize, Pin, Pencil } from 'lucide-react';
import { PlaceForm } from '@/components/place-form';
import { PanelHeader } from '@/components/panel-header';
import { createPlaceMutation } from '@/queries/places';
import { useEvents } from '@/providers/bus-provider';
import { useMediaQuery } from '@/hooks/use-media-query';

export const AddPlacePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [lat] = useQueryState('lat', parseAsFloat);
    const [lng] = useQueryState('lng', parseAsFloat);
    const isDesktop = useMediaQuery('(min-width: 640px)');
    const { emit } = useEvents();
    const [collapsed, setCollapsed] = useState(false);

    const goBack = () => navigate({ to: '/places' });

    const toggleCollapsed = () => {
        const next = !collapsed;
        setCollapsed(next);
        emit('panel:collapse', next);
    };

    const mutation = useMutation(
        createPlaceMutation({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['places'] });
                goBack();
            },
        }),
    );

    return (
        <div className='flex h-full min-h-0 flex-col'>
            <PanelHeader
                title='Nuevo lugar'
                onBack={goBack}
                action={
                    !isDesktop && (
                        <button
                            type='button'
                            onClick={toggleCollapsed}
                            aria-label={collapsed ? 'Restaurar panel' : 'Despejar mapa'}
                            className='flex-center -mr-1.5 size-9 shrink-0 rounded-lg text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground [&>svg]:size-5'
                        >
                            <Maximize>
                                {collapsed ? (
                                    <Pencil size={12} x={6} y={6} absoluteStrokeWidth className='text-foreground' />
                                ) : (
                                    <Pin size={12} x={6} y={6} absoluteStrokeWidth className='text-foreground' />
                                )}
                            </Maximize>
                        </button>
                    )
                }
            />

            <PlaceForm
                initialCoords={lat != null && lng != null ? { lat, lng } : undefined}
                onSubmit={values => mutation.mutate(values)}
                submitLabel='Guardar lugar'
                pending={mutation.isPending}
            />
        </div>
    );
};
