import { Outlet } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { LocateFixed } from 'lucide-react';
import { Map, MapControls, useMap } from '@/ui/map';
import { DEFAULT_VIEWPORT, MIN_ZOOM, MAX_ZOOM } from '@/constants/map-defaults';
import { cn } from '@/helpers/utils';
import { useSettings } from '@/hooks/use-settings';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useListener } from '@/providers/bus-provider';
import { usePanelOffset } from '@/hooks/use-panel-offset';
import { CurrentLocationMarker } from '@/components/current-location-marker';
import { DirectionArrow } from '@/components/direction-arrow';
import { PlacesLayer } from '@/components/places-layer';
import { PanelContainer } from '@/components/panel-container';
import { RoutePanel, ROUTE_PANEL_HEIGHT } from '@/components/route-panel';
import { placesQuery } from '@/queries/places';

const placeToPoint = place => ({ lat: place.lat, lng: place.lng, label: place.name, placeId: place.id });

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
    const [route, setRoute] = useState(null);
    const [routeParam, setRouteParam] = useQueryState('route', { defaultValue: '' });
    const { data: places, isSuccess: placesLoaded } = useQuery(placesQuery());
    const $hydratedRoute = useRef(false);
    const { left: panelLeft, bottom: panelBottom } = usePanelOffset();
    const routeTopOffset = route ? ROUTE_PANEL_HEIGHT : 0;

    useListener('route:set', setRoute);

    useEffect(() => {
        if ($hydratedRoute.current || !placesLoaded) return;
        $hydratedRoute.current = true;
        if (!routeParam) return;

        const [originId, destinationId] = routeParam.split(':');
        const originPlace = places.find(place => place.id === originId);
        const destinationPlace = places.find(place => place.id === destinationId);
        if (originPlace && destinationPlace) {
            setRoute({ origin: placeToPoint(originPlace), destination: placeToPoint(destinationPlace) });
        }
    }, [placesLoaded, places, routeParam]);

    useEffect(() => {
        if (!$hydratedRoute.current) return;
        setRouteParam(
            route?.origin?.placeId && route?.destination?.placeId
                ? `${route.origin.placeId}:${route.destination.placeId}`
                : '',
        );
    }, [route, setRouteParam]);

    return (
        <div className='relative h-dvh w-dvw overflow-hidden'>
            <Map
                theme='light'
                viewport={{ center: savedCenter, zoom: DEFAULT_VIEWPORT.zoom }}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                className='h-full w-full'
            >
                {currentLocation && (
                    <>
                        <CurrentLocationMarker coords={currentLocation} />
                        <DirectionArrow
                            coords={currentLocation}
                            className='bg-blue-500 hover:bg-blue-400'
                            label='Mi ubicación actual'
                            offsets={{ left: panelLeft, bottom: panelBottom, top: routeTopOffset }}
                        />
                    </>
                )}

                <PlacesLayer topOffset={routeTopOffset} />
                <PanelContainer />

                {route && <RoutePanel route={route} onChange={setRoute} onClose={() => setRoute(null)} />}

                <MapControls position='top-right' showZoom />

                <div className='absolute right-2 bottom-2 z-10'>
                    <CenterButton />
                </div>
            </Map>
        </div>
    );
};
