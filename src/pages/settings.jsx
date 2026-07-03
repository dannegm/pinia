import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMap } from '@/ui/map';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/ui/button';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { DEFAULT_VIEWPORT } from '@/constants/map-defaults';
import { placesQuery } from '@/queries/places';
import { systemPlaceQuery, setSystemPlaceMutation } from '@/queries/system-places';

const MapCenterSetting = () => {
    const { map } = useMap();
    const [center, setCenter] = useSettings('mapCenter', DEFAULT_VIEWPORT.center);

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
            <Button type='button' variant='outline' onClick={useCurrentCenter}>
                Usar centro actual
            </Button>
        </Field>
    );
};

const HomePlaceSetting = () => {
    const { data: places = [] } = useQuery(placesQuery());
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
            <Select
                value={casa?.place_id ?? ''}
                onValueChange={placeId => mutation.mutate({ key: 'casa', placeId })}
            >
                <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Elige un lugar' />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {places.map(place => (
                            <SelectItem key={place.id} value={place.id}>
                                {place.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </Field>
    );
};

export const SettingsPage = () => {
    return (
        <div className='flex flex-col gap-4'>
            <h2 className='text-base font-medium text-foreground/90'>Ajustes</h2>
            <FieldGroup>
                <MapCenterSetting />
                <HomePlaceSetting />
            </FieldGroup>
        </div>
    );
};
