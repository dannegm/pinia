import { LocateFixed } from 'lucide-react';
import { Map, MapControls, useMap } from '@/ui/map';
import { DEFAULT_VIEWPORT, MIN_ZOOM, MAX_ZOOM } from '@/constants/map-defaults';
import { cn } from '@/helpers/utils';
import { useGeolocation } from '@/hooks/use-geolocation';
import { CurrentLocationMarker } from '@/components/current-location-marker';
import { DirectionArrow } from '@/components/direction-arrow';

const CenterButton = () => {
    const { map } = useMap();

    const handleCenter = () => {
        map?.flyTo({ center: DEFAULT_VIEWPORT.center, zoom: DEFAULT_VIEWPORT.zoom, duration: 500 });
    };

    return (
        <div className='border-border bg-background flex flex-col overflow-hidden rounded-md border shadow-sm shadow-black/10'>
            <button
                type='button'
                onClick={handleCenter}
                aria-label='Centrar mapa'
                className={cn(
                    'flex size-8 items-center justify-center transition-colors',
                    'hover:bg-accent',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                )}
            >
                <LocateFixed className='size-4' />
            </button>
        </div>
    );
};

export const MapView = () => {
    const currentLocation = useGeolocation();

    return (
        <Map
            theme='light'
            viewport={DEFAULT_VIEWPORT}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            className='h-full w-full'
        >
            {currentLocation && (
                <>
                    <CurrentLocationMarker coords={currentLocation} />
                    <DirectionArrow coords={currentLocation} className='bg-blue-500 hover:bg-blue-400' />
                </>
            )}

            <div className='absolute right-2 bottom-10 z-10 flex flex-col gap-1.5'>
                <MapControls position='bottom-right' showZoom showCompass className='static' />
                <CenterButton />
            </div>
        </Map>
    );
};
