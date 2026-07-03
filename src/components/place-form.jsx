import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, FlagTriangleRight } from 'lucide-react';
import { MapMarker, MarkerContent, useMap } from '@/ui/map';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/ui/field';
import { Textarea } from '@/ui/textarea';
import { NumberScrubber } from '@/ui/number-scrubber';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { ToggleIconButton } from '@/ui/toggle-icon-button';
import { PinDrop } from '@/components/pin-drop';
import { CategorySelect } from '@/components/category-select';
import { cn } from '@/helpers/utils';
import { categoriesQuery } from '@/queries/categories';

export const PlaceForm = ({
    initialCoords,
    initialValues,
    onSubmit,
    submitLabel,
    pending,
    secondaryAction,
    mode = 'create',
}) => {
    const { map } = useMap();
    const [coords, setCoords] = useState(
        initialCoords ??
            (() => {
                const center = map.getCenter();
                return { lat: center.lat, lng: center.lng };
            }),
    );
    const [name, setName] = useState(initialValues?.name ?? '');
    const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '');
    const [address, setAddress] = useState(initialValues?.address ?? '');
    const [hours, setHours] = useState(initialValues?.hours ?? '');
    const [notes, setNotes] = useState(initialValues?.notes ?? '');
    const [isFavorite, setIsFavorite] = useState(initialValues?.isFavorite ?? false);
    const [isBeacon, setIsBeacon] = useState(initialValues?.isBeacon ?? false);
    const { data: categories = [] } = useQuery(categoriesQuery());
    const selectedCategory = categories.find(category => category.id === categoryId);

    const handleSubmit = e => {
        e.preventDefault();
        if (!name.trim() || !categoryId) return;
        onSubmit({
            name: name.trim(),
            categoryId,
            address: address.trim() || null,
            hours: hours.trim() || null,
            notes: notes.trim() || null,
            lat: coords.lat,
            lng: coords.lng,
            isFavorite,
            isBeacon,
        });
    };

    return (
        <>
            {mode === 'create' ? (
                <PinDrop coords={coords} onCoordsChange={setCoords} />
            ) : (
                <MapMarker longitude={coords.lng} latitude={coords.lat} draggable onDrag={setCoords}>
                    <MarkerContent>
                        <div
                            className='flex-center size-8 rounded-full border-2 border-white text-white shadow-md shadow-black/50 [&>svg]:size-4 bg-(--place-color)'
                            style={{ '--place-color': selectedCategory?.color ?? '#6b7280' }}
                        >
                            {selectedCategory?.icon && <DynamicIcon icon={selectedCategory.icon} />}
                        </div>
                    </MarkerContent>
                </MapMarker>
            )}

            <form onSubmit={handleSubmit} className='flex h-full flex-col gap-3'>
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
                        <CategorySelect value={categoryId} onChange={setCategoryId} />
                        {categories.length === 0 && (
                            <p className='text-xs text-foreground/70'>Crea una categoría primero.</p>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel>Marcadores</FieldLabel>
                        <div className='flex gap-1.5'>
                            <ToggleIconButton
                                active={isFavorite}
                                onClick={() => setIsFavorite(v => !v)}
                                label='Favorito'
                                activeClassName='border-amber-500 bg-amber-500/10 text-amber-500'
                            >
                                <Star className={cn(isFavorite && 'fill-current')} />
                            </ToggleIconButton>
                            <ToggleIconButton
                                active={isBeacon}
                                onClick={() => setIsBeacon(v => !v)}
                                label='Beacon'
                                activeClassName='border-red-500 bg-red-500/10 text-red-500'
                            >
                                <FlagTriangleRight />
                            </ToggleIconButton>
                        </div>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor='place-address'>Dirección</FieldLabel>
                        <Textarea
                            id='place-address'
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder='Opcional'
                            rows={2}
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor='place-hours'>Horario</FieldLabel>
                        <Textarea
                            id='place-hours'
                            value={hours}
                            onChange={e => setHours(e.target.value)}
                            placeholder='Lun-Vie 4-6pm (opcional)'
                            rows={2}
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor='place-notes'>Notas</FieldLabel>
                        <Textarea
                            id='place-notes'
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder='Opcional'
                            rows={3}
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

                <div className='mt-auto flex flex-col gap-2'>
                    {secondaryAction}
                    <Button type='submit' disabled={pending || categories.length === 0} className='h-10 w-full'>
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </>
    );
};
