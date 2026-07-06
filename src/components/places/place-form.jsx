import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, FlagTriangleRight, MapPin, Clock, NotebookText, Info, Maximize, Pin } from 'lucide-react';
import { MapMarker, MarkerContent, useMap } from '@/ui/map';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@/ui/field';
import { Popover, PopoverContent, PopoverTrigger, PopoverHeader, PopoverTitle, PopoverDescription } from '@/ui/popover';
import { Textarea } from '@/ui/textarea';
import { NumberScrubber } from '@/ui/number-scrubber';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { Alert, AlertDescription } from '@/ui/alert';
import { PanelFooter } from '@/components/panel-footer';
import { PinDrop } from '@/components/pin-drop';
import { PinGlyph } from '@/components/pin-glyph';
import { CenterPin } from '@/components/center-pin';
import { CategorySelect } from '@/components/category-select';
import { cn } from '@/helpers/utils';
import { useIsTouchDevice } from '@/hooks/use-is-touch-device';
import { BRAND_COLOR, FAVORITE_COLOR } from '@/constants/map-defaults';
import { categoriesQuery } from '@/queries/categories';

const MarkerToggleRow = ({ active, onClick, color, label, description, children }) => (
    <button
        type='button'
        onClick={onClick}
        aria-pressed={active}
        style={active ? { '--marker-color': color } : undefined}
        className='flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/40 active:scale-[0.99]'
    >
        <span
            className={cn(
                'flex-center size-9 shrink-0 rounded-full border transition-all duration-150 [&>svg]:size-4',
                active
                    ? 'border-(--marker-color) bg-(--marker-color) text-white'
                    : 'border-border text-foreground/40',
            )}
        >
            {children}
        </span>
        <span className='flex flex-col'>
            <span className='text-sm font-medium text-foreground'>{label}</span>
            <span className='text-xs text-foreground/60'>{description}</span>
        </span>
    </button>
);

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
    const isTouch = useIsTouchDevice();
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

    useEffect(() => {
        if (mode !== 'edit' || !initialCoords) return;
        map.flyTo({ center: [initialCoords.lng, initialCoords.lat], zoom: 16, duration: 800 });
    }, []);

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
                isTouch ? (
                    <CenterPin onCoordsChange={setCoords}>
                        {isPanning => <PinGlyph lifted={isPanning} />}
                    </CenterPin>
                ) : (
                    <PinDrop coords={coords} onCoordsChange={setCoords} />
                )
            ) : isTouch ? (
                <CenterPin onCoordsChange={setCoords}>
                    {isPanning => (
                        <div
                            className={cn(
                                'flex-center size-8 rounded-full border-2 border-white text-white shadow-md shadow-black/50 transition-transform duration-150 ease-out [&>svg]:size-4 bg-(--place-color)',
                                isPanning && 'scale-110',
                            )}
                            style={{ '--place-color': selectedCategory?.color ?? '#6b7280' }}
                        >
                            {selectedCategory?.icon && <DynamicIcon icon={selectedCategory.icon} />}
                        </div>
                    )}
                </CenterPin>
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

            <form onSubmit={handleSubmit} className='flex flex-1 min-h-0 flex-col'>
                <div className='flex-1 min-h-0 overflow-y-auto p-4'>
                    <FieldGroup>
                        <Alert className='sm:hidden'>
                            <Maximize>
                                <Pin size={12} x={6} y={6} absoluteStrokeWidth className='text-foreground' />
                            </Maximize>
                            <AlertDescription>
                                {isTouch
                                    ? 'Usa el botón de arriba para achicar el panel y mueve el mapa para posicionar el pin en el centro.'
                                    : 'Usa el botón de arriba para achicar el panel y mover el pin en el mapa.'}
                            </AlertDescription>
                        </Alert>

                        <Field>
                            <FieldLabel htmlFor='place-name'>Nombre</FieldLabel>
                            <div className='flex items-center gap-2'>
                                <div
                                    className={cn(
                                        'flex-center size-9 shrink-0 rounded-full transition-colors [&>svg]:size-4',
                                        selectedCategory
                                            ? 'text-white bg-(--place-color)'
                                            : 'bg-muted text-foreground/40',
                                    )}
                                    style={
                                        selectedCategory
                                            ? { '--place-color': selectedCategory.color }
                                            : undefined
                                    }
                                >
                                    {selectedCategory?.icon ? (
                                        <DynamicIcon icon={selectedCategory.icon} />
                                    ) : (
                                        <MapPin />
                                    )}
                                </div>
                                <Input
                                    id='place-name'
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder='Tiendita de la esquina'
                                    className='flex-1'
                                />
                            </div>
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
                            <div className='flex flex-col divide-y divide-border/70 overflow-hidden squircle-lg border border-border/70'>
                                <MarkerToggleRow
                                    active={isFavorite}
                                    onClick={() => setIsFavorite(v => !v)}
                                    color={FAVORITE_COLOR}
                                    label='Favorito'
                                    description='Se agrega a accesos rápidos.'
                                >
                                    <Star className={cn(isFavorite && 'fill-current')} />
                                </MarkerToggleRow>
                                <MarkerToggleRow
                                    active={isBeacon}
                                    onClick={() => setIsBeacon(v => !v)}
                                    color={selectedCategory?.color ?? BRAND_COLOR}
                                    label='Beacon'
                                    description='Le pone flecha en el mapa cuando está fuera de vista.'
                                >
                                    <FlagTriangleRight className={cn(isBeacon && 'fill-current')} />
                                </MarkerToggleRow>
                            </div>
                        </Field>

                        <FieldSeparator>Detalles</FieldSeparator>

                        <Field>
                            <FieldLabel htmlFor='place-address'>
                                <MapPin className='size-3.5 text-foreground/40' />
                                Dirección
                            </FieldLabel>
                            <Textarea
                                id='place-address'
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder='Opcional'
                                rows={2}
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor='place-hours'>
                                <Clock className='size-3.5 text-foreground/40' />
                                Horario
                            </FieldLabel>
                            <Textarea
                                id='place-hours'
                                value={hours}
                                onChange={e => setHours(e.target.value)}
                                placeholder='Lun-Vie 4-6pm (opcional)'
                                rows={2}
                            />
                        </Field>

                        <Field>
                            <div className='flex items-center justify-between'>
                                <FieldLabel htmlFor='place-notes'>
                                    <NotebookText className='size-3.5 text-foreground/40' />
                                    Notas
                                </FieldLabel>
                                <Popover>
                                    <PopoverTrigger
                                        render={
                                            <button
                                                type='button'
                                                aria-label='Ver formato de notas'
                                                className='flex-center size-5 shrink-0 rounded-full text-foreground/40 transition-colors hover:bg-accent hover:text-accent-foreground [&>svg]:size-3.5'
                                            />
                                        }
                                    >
                                        <Info />
                                    </PopoverTrigger>
                                    <PopoverContent className='w-80' side='right' align='center'>
                                        <PopoverHeader>
                                            <PopoverTitle>Formato de notas</PopoverTitle>
                                            <PopoverDescription>
                                                Se aplica automáticamente al mostrar el lugar.
                                            </PopoverDescription>
                                        </PopoverHeader>

                                        <div className='flex flex-col gap-2.5'>
                                            <div>
                                                <p className='mb-1 text-sm font-medium text-foreground/90'>Texto</p>
                                                <ul className='flex flex-col gap-1 text-sm text-foreground/70'>
                                                    <li>
                                                        <code className='rounded bg-muted px-1 py-0.5 text-foreground/90'>
                                                            **negrita**
                                                        </code>
                                                    </li>
                                                    <li>
                                                        <code className='rounded bg-muted px-1 py-0.5 text-foreground/90'>
                                                            *cursiva*
                                                        </code>
                                                    </li>
                                                    <li>
                                                        <code className='rounded bg-muted px-1 py-0.5 text-foreground/90'>
                                                            - item
                                                        </code>{' '}
                                                        para listas
                                                    </li>
                                                </ul>
                                            </div>

                                            <div>
                                                <p className='mb-1 text-sm font-medium text-foreground/90'>
                                                    Etiquetas
                                                </p>
                                                <ul className='flex flex-col gap-1 text-sm text-foreground/70'>
                                                    <li>
                                                        <code className='rounded bg-muted px-1 py-0.5 text-foreground/90'>
                                                            #tag
                                                        </code>
                                                    </li>
                                                    <li>
                                                        <code className='rounded bg-muted px-1 py-0.5 text-foreground/90'>
                                                            !comando
                                                        </code>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div>
                                                <p className='mb-1 text-sm font-medium text-foreground/90'>
                                                    Badges (en su propia línea)
                                                </p>
                                                <ul className='grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-foreground/70'>
                                                    <li>
                                                        <code className='rounded bg-muted px-1 py-0.5 text-foreground/90'>
                                                            tel:
                                                        </code>{' '}
                                                        Teléfono
                                                    </li>
                                                    <li>
                                                        <code className='rounded bg-muted px-1 py-0.5 text-foreground/90'>
                                                            wa:
                                                        </code>{' '}
                                                        WhatsApp
                                                    </li>
                                                    <li>
                                                        <code className='rounded bg-muted px-1 py-0.5 text-foreground/90'>
                                                            ig:
                                                        </code>{' '}
                                                        Instagram
                                                    </li>
                                                    <li>
                                                        <code className='rounded bg-muted px-1 py-0.5 text-foreground/90'>
                                                            x: / tw:
                                                        </code>{' '}
                                                        X
                                                    </li>
                                                    <li>
                                                        <code className='rounded bg-muted px-1 py-0.5 text-foreground/90'>
                                                            fb:
                                                        </code>{' '}
                                                        Facebook
                                                    </li>
                                                    <li>
                                                        <code className='rounded bg-muted px-1 py-0.5 text-foreground/90'>
                                                            tg:
                                                        </code>{' '}
                                                        Telegram
                                                    </li>
                                                    <li>
                                                        <code className='rounded bg-muted px-1 py-0.5 text-foreground/90'>
                                                            url:
                                                        </code>{' '}
                                                        Enlace
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Textarea
                                id='place-notes'
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder='Opcional'
                                rows={3}
                            />
                        </Field>

                        <FieldSeparator>Coordenadas</FieldSeparator>

                        <Field>
                            <div className='grid grid-cols-2 gap-2'>
                                <div className='flex flex-col gap-1'>
                                    <FieldLabel
                                        htmlFor='place-lat'
                                        className='text-xs font-normal text-foreground/50'
                                    >
                                        Lat
                                    </FieldLabel>
                                    <NumberScrubber
                                        id='place-lat'
                                        value={coords.lat}
                                        min={-90}
                                        max={90}
                                        step={0.0001}
                                        onChange={lat => setCoords(c => ({ ...c, lat }))}
                                    />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <FieldLabel
                                        htmlFor='place-lng'
                                        className='text-xs font-normal text-foreground/50'
                                    >
                                        Lng
                                    </FieldLabel>
                                    <NumberScrubber
                                        id='place-lng'
                                        value={coords.lng}
                                        min={-180}
                                        max={180}
                                        step={0.0001}
                                        onChange={lng => setCoords(c => ({ ...c, lng }))}
                                    />
                                </div>
                            </div>
                        </Field>
                    </FieldGroup>
                </div>

                <PanelFooter>
                    {secondaryAction}
                    <Button type='submit' disabled={pending || categories.length === 0} className='h-10 w-full'>
                        {submitLabel}
                    </Button>
                </PanelFooter>
            </form>
        </>
    );
};
