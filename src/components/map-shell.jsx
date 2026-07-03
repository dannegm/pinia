import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { LocateFixed, Plus, Navigation } from 'lucide-react';
import { Map, MapControls, useMap } from '@/ui/map';
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
} from '@/ui/context-menu';
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
import { systemPlaceQuery } from '@/queries/system-places';

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
    const navigate = useNavigate();
    const currentLocation = useGeolocation();
    const [savedCenter] = useSettings('mapCenter', DEFAULT_VIEWPORT.center);
    const [route, setRoute] = useState(null);
    const [routeParam, setRouteParam] = useQueryState('route', { defaultValue: '' });
    const { data: places, isSuccess: placesLoaded } = useQuery(placesQuery());
    const { data: casa } = useQuery(systemPlaceQuery('casa'));
    const $hydratedRoute = useRef(false);
    const $map = useRef(null);
    const [rightClickCoords, setRightClickCoords] = useState(null);
    const { left: panelLeft, bottom: panelBottom } = usePanelOffset();
    const routeTopOffset = route ? ROUTE_PANEL_HEIGHT : 0;

    const handleContextMenu = e => {
        if (e.target.closest('.maplibregl-marker')) {
            e.preventBaseUIHandler?.();
            return;
        }
        const map = $map.current;
        if (!map) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const { lng, lat } = map.unproject([e.clientX - rect.left, e.clientY - rect.top]);
        setRightClickCoords({ lat, lng });
    };

    const handleCreatePlace = () => {
        if (!rightClickCoords) return;
        navigate({ to: '/places/new', search: { lat: rightClickCoords.lat, lng: rightClickCoords.lng } });
    };

    const handleCenterHere = () => {
        if (!rightClickCoords) return;
        $map.current?.flyTo({ center: [rightClickCoords.lng, rightClickCoords.lat], duration: 500 });
    };

    const handleNavigateFromHome = () => {
        if (!rightClickCoords || !casa?.place) return;
        setRoute({
            origin: {
                lat: casa.place.lat,
                lng: casa.place.lng,
                label: 'Casa',
                placeId: casa.place.id,
            },
            destination: { lat: rightClickCoords.lat, lng: rightClickCoords.lng, label: 'Punto seleccionado' },
        });
    };

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
        <ContextMenu>
            <ContextMenuTrigger
                onContextMenu={handleContextMenu}
                className='relative block h-dvh w-dvw overflow-hidden'
            >
                <Map
                    ref={$map}
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

                    <MapControls position='top-right' showZoom showCompass />

                    <div className='absolute right-2 bottom-2 z-10'>
                        <CenterButton />
                    </div>
                </Map>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={handleCreatePlace}>
                    <Plus />
                    Crear lugar
                </ContextMenuItem>
                <ContextMenuItem onClick={handleCenterHere}>
                    <LocateFixed />
                    Centrar aquí
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={handleNavigateFromHome} disabled={!casa?.place}>
                    <Navigation />
                    Navegar hasta aquí
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};
