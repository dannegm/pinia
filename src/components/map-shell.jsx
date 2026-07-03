import { Outlet } from '@tanstack/react-router';
import { LocateFixed } from 'lucide-react';
import { Map, MapControls, useMap } from '@/ui/map';
import { DEFAULT_VIEWPORT, MIN_ZOOM, MAX_ZOOM } from '@/constants/map-defaults';
import customMapStyle from '@/constants/map-style.json';
import { cn } from '@/helpers/utils';
import { useSettings } from '@/hooks/use-settings';
import { useGeolocation } from '@/hooks/use-geolocation';
import { CurrentLocationMarker } from '@/components/current-location-marker';
import { DirectionArrow } from '@/components/direction-arrow';
import { PlacesLayer } from '@/components/places-layer';
import { PanelContainer } from '@/components/panel-container';

const CenterButton = () => {
    const { map } = useMap();
    const [center] = useSettings('mapCenter', DEFAULT_VIEWPORT.center);

    const handleCenter = () => {
        map?.flyTo({ center, zoom: DEFAULT_VIEWPORT.zoom, duration: 500 });
    };

    return (
        <div className='flex flex-col overflow-hidden rounded-md border border-border bg-background shadow-sm shadow-black/10'>
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

export const MapShell = () => {
    const currentLocation = useGeolocation();
    const [savedCenter] = useSettings('mapCenter', DEFAULT_VIEWPORT.center);

    return (
        <div className='relative h-dvh w-dvw overflow-hidden'>
            <Map
                theme='light'
                styles={{ light: customMapStyle }}
                viewport={{ center: savedCenter, zoom: DEFAULT_VIEWPORT.zoom }}
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

                <PlacesLayer />
                <PanelContainer />

                <div className='absolute top-2 right-2 z-10 flex flex-col gap-1.5'>
                    <MapControls position='top-right' showZoom showCompass className='static' />
                    <CenterButton />
                </div>
            </Map>
        </div>
    );
};
