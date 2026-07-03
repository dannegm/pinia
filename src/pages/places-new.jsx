import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { MapPin, X } from 'lucide-react';
import { MapMarker, MarkerContent, useMap } from '@/ui/map';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { NumberScrubber } from '@/ui/number-scrubber';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { categoriesQuery } from '@/queries/categories';
import { createPlaceMutation } from '@/queries/places';

export const AddPlacePage = () => {
    const { map } = useMap();
    const navigate = useNavigate();
    const [coords, setCoords] = useState(() => {
        const center = map.getCenter();
        return { lat: center.lat, lng: center.lng };
    });
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [address, setAddress] = useState('');
    const { data: categories = [] } = useQuery(categoriesQuery());
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

    const handleSubmit = e => {
        e.preventDefault();
        if (!name.trim() || !categoryId) return;
        mutation.mutate({
            name: name.trim(),
            categoryId,
            address: address.trim() || null,
            lat: coords.lat,
            lng: coords.lng,
        });
    };

    return (
        <>
            <MapMarker longitude={coords.lng} latitude={coords.lat} draggable onDrag={setCoords}>
                <MarkerContent>
                    <div className='flex-center size-6 rounded-full border-2 border-white bg-red-500 text-white shadow-md shadow-black/50 [&>svg]:size-3.5'>
                        <MapPin />
                    </div>
                </MarkerContent>
            </MapMarker>

            <form onSubmit={handleSubmit} className='flex h-full flex-col gap-3'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-base font-medium text-foreground/90'>Nuevo lugar</h2>
                    <button
                        type='button'
                        aria-label='Cancelar'
                        onClick={goBack}
                        className='flex-center size-6 rounded-md hover:bg-accent [&>svg]:size-4'
                    >
                        <X />
                    </button>
                </div>

                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor='place-name'>Nombre</FieldLabel>
                        <Input
                            id='place-name'
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder='Tiendita de la esquina'
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Categoría</FieldLabel>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Elige una categoría' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.id}>
                                            <DynamicIcon icon={category.icon} />
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {categories.length === 0 && (
                            <p className='text-xs text-foreground/70'>Crea una categoría primero.</p>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor='place-address'>Dirección</FieldLabel>
                        <Input
                            id='place-address'
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder='Opcional'
                        />
                    </Field>

                    <Field orientation='horizontal'>
                        <FieldLabel htmlFor='place-lat'>Lat</FieldLabel>
                        <NumberScrubber
                            id='place-lat'
                            value={coords.lat}
                            min={-90}
                            max={90}
                            step={0.0001}
                            onChange={lat => setCoords(c => ({ ...c, lat }))}
                        />
                    </Field>
                    <Field orientation='horizontal'>
                        <FieldLabel htmlFor='place-lng'>Lng</FieldLabel>
                        <NumberScrubber
                            id='place-lng'
                            value={coords.lng}
                            min={-180}
                            max={180}
                            step={0.0001}
                            onChange={lng => setCoords(c => ({ ...c, lng }))}
                        />
                    </Field>
                </FieldGroup>

                <Button
                    type='submit'
                    disabled={mutation.isPending || categories.length === 0}
                    className='mt-auto'
                >
                    Guardar lugar
                </Button>
            </form>
        </>
    );
};
