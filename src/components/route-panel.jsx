import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowLeftRight, Map as MapIcon, Car, Share2, X } from 'lucide-react';
import { useMap, MapRoute } from '@/ui/map';
import { usePanelOffset } from '@/hooks/use-panel-offset';
import { routeQuery } from '@/queries/route';
import { PlacePointSelect } from '@/components/place-point-select';
import { CheckIcon } from '@/ui/icons';
import { BRAND_COLOR } from '@/constants/map-defaults';
import { cn } from '@/helpers/utils';

export const ROUTE_PANEL_HEIGHT = 48;

const actionButtonClass = cn(
    'flex-center size-8 shrink-0 rounded-md text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground [&>svg]:size-4',
);

const buildGoogleMapsUrl = (origin, destination) => {
    const url = new URL('https://www.google.com/maps/dir/');
    url.searchParams.set('api', '1');
    url.searchParams.set('origin', `${origin.lat},${origin.lng}`);
    url.searchParams.set('destination', `${destination.lat},${destination.lng}`);
    url.searchParams.set('travelmode', 'driving');
    return url.toString();
};

const buildUberUrl = (origin, destination) => {
    const url = new URL('https://m.uber.com/ul/');
    url.searchParams.set('action', 'setPickup');
    url.searchParams.set('pickup[latitude]', origin.lat);
    url.searchParams.set('pickup[longitude]', origin.lng);
    if (origin.label) url.searchParams.set('pickup[nickname]', origin.label);
    url.searchParams.set('dropoff[latitude]', destination.lat);
    url.searchParams.set('dropoff[longitude]', destination.lng);
    if (destination.label) url.searchParams.set('dropoff[nickname]', destination.label);
    return url.toString();
};

export const RoutePanel = ({ route, onChange, onClose }) => {
    const { map } = useMap();
    const { isDesktop, left } = usePanelOffset();
    const offsetLeft = isDesktop ? left + 16 : 8;
    const [copied, setCopied] = useState(false);

    const { origin, destination } = route;
    const canShare = Boolean(origin.placeId && destination.placeId);

    const handleShare = async () => {
        if (!canShare) return;
        const url = `${window.location.origin}/?route=${origin.placeId}:${destination.placeId}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const {
        data: routeCoordinates,
        isFetching,
        isError,
    } = useQuery(routeQuery(origin, destination));

    useEffect(() => {
        if (!routeCoordinates?.length) return;
        const lngs = routeCoordinates.map(c => c[0]);
        const lats = routeCoordinates.map(c => c[1]);
        map.fitBounds(
            [
                [Math.min(...lngs), Math.min(...lats)],
                [Math.max(...lngs), Math.max(...lats)],
            ],
            { padding: 64, duration: 800 },
        );
    }, [routeCoordinates, map]);

    const handleInvert = () => onChange({ origin: destination, destination: origin });

    return (
        <>
            {routeCoordinates && <MapRoute coordinates={routeCoordinates} color={BRAND_COLOR} width={4} />}

            <div className='absolute top-2 z-20 flex flex-col gap-1' style={{ left: `${offsetLeft}px` }}>
                <div className='flex max-w-[calc(100dvw-1rem)] items-center gap-1.5 overflow-x-auto squircle-lg border border-border bg-background p-1.5 shadow-md shadow-black/10'>
                    <PlacePointSelect
                        value={origin}
                        onChange={next => onChange({ origin: next, destination })}
                        placeholder='Origen'
                        className='w-28 shrink-0 sm:w-36'
                    />

                    <ArrowRight className='size-4 shrink-0 text-foreground/50' />

                    <PlacePointSelect
                        value={destination}
                        onChange={next => onChange({ origin, destination: next })}
                        placeholder='Destino'
                        className='w-28 shrink-0 sm:w-36'
                    />

                    <button
                        type='button'
                        onClick={handleInvert}
                        title='Invertir ruta'
                        aria-label='Invertir ruta'
                        className={actionButtonClass}
                    >
                        <ArrowLeftRight />
                    </button>

                    <div className='h-6 w-px shrink-0 bg-border' />

                    <button
                        type='button'
                        onClick={() => window.open(buildGoogleMapsUrl(origin, destination), '_blank')}
                        title='Abrir en Google Maps'
                        aria-label='Abrir en Google Maps'
                        className={actionButtonClass}
                    >
                        <MapIcon />
                    </button>

                    <button
                        type='button'
                        onClick={() => window.open(buildUberUrl(origin, destination), '_blank')}
                        title='Pedir Uber'
                        aria-label='Pedir Uber'
                        className={actionButtonClass}
                    >
                        <Car />
                    </button>

                    <button
                        type='button'
                        onClick={handleShare}
                        disabled={!canShare}
                        title={canShare ? 'Compartir ruta' : 'Ambos puntos deben ser lugares guardados'}
                        aria-label='Compartir ruta'
                        className={cn(actionButtonClass, !canShare && 'pointer-events-none opacity-50')}
                    >
                        {copied ? <CheckIcon /> : <Share2 />}
                    </button>

                    <button
                        type='button'
                        onClick={onClose}
                        title='Quitar ruta'
                        aria-label='Quitar ruta'
                        className={actionButtonClass}
                    >
                        <X />
                    </button>
                </div>

                {isFetching && <p className='px-1 text-xs text-foreground/70'>Calculando ruta…</p>}
                {isError && <p className='px-1 text-xs text-destructive'>No se pudo calcular la ruta.</p>}
            </div>
        </>
    );
};
