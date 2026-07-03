import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { useMap } from '@/ui/map';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/ui/button';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/ui/field';
import { PanelHeader } from '@/components/panel-header';
import { PlaceSelect } from '@/components/place-select';
import { DEFAULT_VIEWPORT } from '@/constants/map-defaults';
import { systemPlaceQuery, setSystemPlaceMutation } from '@/queries/system-places';

const MapCenterSetting = () => {
    const { map } = useMap();
    const [center, setCenter] = useSettings('mapCenter', DEFAULT_VIEWPORT.center);
    const isDefault =
        center[0] === DEFAULT_VIEWPORT.center[0] && center[1] === DEFAULT_VIEWPORT.center[1];

    const useCurrentCenter = () => {
        const { lng, lat } = map.getCenter();
        setCenter([lng, lat]);
    };

    return (
        <Field>
            <FieldLabel>Centro del mapa</FieldLabel>
            <FieldDescription>
                {center[1].toFixed(4)}, {center[0].toFixed(4)}
            </FieldDescription>
            <div className='flex gap-1.5'>
                <Button type='button' variant='outline' onClick={useCurrentCenter}>
                    Usar centro actual
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    aria-label='Revertir al centro por defecto'
                    title='Revertir al centro por defecto'
                    disabled={isDefault}
                    onClick={() => setCenter(DEFAULT_VIEWPORT.center)}
                >
                    <RotateCcw />
                </Button>
            </div>
        </Field>
    );
};

const HomePlaceSetting = () => {
    const { data: casa } = useQuery(systemPlaceQuery('casa'));
    const queryClient = useQueryClient();

    const mutation = useMutation(
        setSystemPlaceMutation({
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ['system-places', 'casa'] }),
        }),
    );

    return (
        <Field>
            <FieldLabel>Casa</FieldLabel>
            <FieldDescription>Se usa como origen para "desde casa" al pedir rutas.</FieldDescription>
            <PlaceSelect
                value={casa?.place_id ?? null}
                onChange={placeId => mutation.mutate({ key: 'casa', placeId })}
            />
        </Field>
    );
};

export const SettingsPage = () => {
    return (
        <div className='flex flex-col gap-4'>
            <PanelHeader title='Ajustes' />
            <FieldGroup>
                <MapCenterSetting />
                <HomePlaceSetting />
            </FieldGroup>
        </div>
    );
};
