import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { LocateFixed, MapPinPlus, Navigation } from 'lucide-react';
import { Map } from '@/ui/map';
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
} from '@/ui/context-menu';
import {
    DEFAULT_VIEWPORT,
    MIN_ZOOM,
    MAX_ZOOM,
    FOCUS_ZOOM,
    BRAND_COLOR,
    MAP_STYLES,
    DEFAULT_MAP_STYLE_ID,
    parseAsZoom,
} from '@/constants/map-defaults';
import { useSettings } from '@/hooks/use-settings';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useListener } from '@/providers/bus-provider';
import { usePanelOffset } from '@/hooks/use-panel-offset';
import { CurrentLocationMarker } from '@/components/map/current-location-marker';
import { DirectionArrow } from '@/components/map/direction-arrow';
import { PlacesLayer } from '@/components/map/places-layer';
import { PointNemoMarker } from '@/components/map/point-nemo-marker';
import { PanelContainer } from '@/components/panels/panel-container';
import { ContextMenuPulse } from '@/components/map/context-menu-pulse';
import { ContextMenuPin } from '@/components/map/context-menu-pin';
import { ClickPulse } from '@/components/map/click-pulse';
import { ZoomSync } from '@/components/map/zoom-sync';
import { RoutePanel, ROUTE_PANEL_HEIGHT, ROUTE_PANEL_HEIGHT_MOBILE } from '@/components/map/route-panel';
import { MapStyleSwitcher } from '@/components/map/map-style-switcher';
import { ZoomControl, CompassControl, CenterControl } from '@/components/map/map-toolbar';
import { placesQuery } from '@/queries/places';
import { systemPlaceQuery } from '@/queries/system-places';

const placeToPoint = place => ({ lat: place.lat, lng: place.lng, label: place.name, placeId: place.id });

const CURRENT_LOCATION_LABEL = 'Mi ubicación actual';

const findRoutePointPlace = (point, places) =>
    point?.placeId ? places?.find(place => place.id === point.placeId) : undefined;

const shouldShowRouteBeacon = (point, places) => {
    if (!point) return false;
    if (!point.placeId && point.label === CURRENT_LOCATION_LABEL) return false;
    return !findRoutePointPlace(point, places)?.is_beacon;
};

const getRouteBeaconColor = (point, places) => findRoutePointPlace(point, places)?.category?.color ?? BRAND_COLOR;

export const MapShell = () => {
    const navigate = useNavigate();
    const currentLocation = useGeolocation();
    const [savedCenter] = useSettings('mapCenter', DEFAULT_VIEWPORT.center);
    const [mapStyleId, setMapStyleId] = useQueryState('style', { defaultValue: DEFAULT_MAP_STYLE_ID });
    const mapStyleUrl = MAP_STYLES.find(style => style.id === mapStyleId)?.url ?? MAP_STYLES[0].url;
    const [zoom, setZoom] = useQueryState('zoom', parseAsZoom.withDefault(DEFAULT_VIEWPORT.zoom));
    const [route, setRoute] = useState(null);
    const [routeParam, setRouteParam] = useQueryState('route', { defaultValue: '' });
    const { data: places, isSuccess: placesLoaded } = useQuery(placesQuery());
    const { data: casa } = useQuery(systemPlaceQuery('casa'));
    const $hydratedRoute = useRef(false);
    const $map = useRef(null);
    const [rightClickCoords, setRightClickCoords] = useState(null);
    const [contextMenuOpen, setContextMenuOpen] = useState(false);
    const $pulseId = useRef(0);
    const $touchPoint = useRef(null);
    const { left: panelLeft, bottom: panelBottom, isDesktop } = usePanelOffset();
    const routeTopOffset = route ? (isDesktop ? ROUTE_PANEL_HEIGHT : ROUTE_PANEL_HEIGHT_MOBILE) : 0;

    const unprojectClientPoint = (x, y) => {
        const map = $map.current;
        if (!map) return null;
        const rect = map.getContainer().getBoundingClientRect();
        return map.unproject([x - rect.left, y - rect.top]);
    };

    const handleContextMenu = e => {
        if (e.target.closest('.maplibregl-marker')) {
            e.preventBaseUIHandler?.();
            return;
        }
        const point = unprojectClientPoint(e.clientX, e.clientY);
        if (!point) return;
        $pulseId.current += 1;
        setRightClickCoords({ lat: point.lat, lng: point.lng, id: $pulseId.current });
    };

    const handleTouchStart = e => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        $touchPoint.current = { x: touch.clientX, y: touch.clientY };
    };

    const clearTouchPoint = () => {
        $touchPoint.current = null;
    };

    const handleOpenChange = (open, eventDetails) => {
        setContextMenuOpen(open);
        if (!open || eventDetails?.event?.type !== 'touchstart' || !$touchPoint.current) return;
        const point = unprojectClientPoint($touchPoint.current.x, $touchPoint.current.y);
        if (!point) return;
        $pulseId.current += 1;
        setRightClickCoords({ lat: point.lat, lng: point.lng, id: $pulseId.current });
    };

    const handleCreatePlace = () => {
        if (!rightClickCoords) return;
        navigate({ to: '/places/new', search: { lat: rightClickCoords.lat, lng: rightClickCoords.lng } });
    };

    const handleCenterHere = () => {
        if (!rightClickCoords) return;
        $map.current?.flyTo({ center: [rightClickCoords.lng, rightClickCoords.lat], zoom: FOCUS_ZOOM, duration: 500 });
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
        <ContextMenu onOpenChange={handleOpenChange}>
            <ContextMenuTrigger
                onContextMenu={handleContextMenu}
                onTouchStart={handleTouchStart}
                onTouchEnd={clearTouchPoint}
                onTouchCancel={clearTouchPoint}
                className='relative block h-dvh w-dvw overflow-hidden'
            >
                <Map
                    ref={$map}
                    theme='light'
                    styles={{ light: mapStyleUrl }}
                    viewport={{ center: savedCenter, zoom }}
                    minZoom={MIN_ZOOM}
                    maxZoom={MAX_ZOOM}
                    renderWorldCopies
                    attributionControl={false}
                    className='h-full w-full'
                >
                    <ZoomSync onZoomChange={setZoom} />
                    <ClickPulse />

                    {currentLocation && (
                        <>
                            <CurrentLocationMarker coords={currentLocation} />
                            <DirectionArrow
                                coords={currentLocation}
                                className='bg-primary hover:bg-primary/85'
                                label='Mi ubicación actual'
                                offsets={{ left: panelLeft, bottom: panelBottom, top: routeTopOffset }}
                                priority={1}
                            />
                        </>
                    )}

                    <PlacesLayer topOffset={routeTopOffset} />
                    <PointNemoMarker />
                    {rightClickCoords && <ContextMenuPulse key={rightClickCoords.id} coords={rightClickCoords} />}
                    {contextMenuOpen && rightClickCoords && <ContextMenuPin coords={rightClickCoords} />}

                    {route && shouldShowRouteBeacon(route.origin, places) && (
                        <DirectionArrow
                            coords={{ lat: route.origin.lat, lng: route.origin.lng }}
                            color={getRouteBeaconColor(route.origin, places)}
                            label={route.origin.label}
                            offsets={{ left: panelLeft, bottom: panelBottom, top: routeTopOffset }}
                        />
                    )}
                    {route && shouldShowRouteBeacon(route.destination, places) && (
                        <DirectionArrow
                            coords={{ lat: route.destination.lat, lng: route.destination.lng }}
                            color={getRouteBeaconColor(route.destination, places)}
                            label={route.destination.label}
                            offsets={{ left: panelLeft, bottom: panelBottom, top: routeTopOffset }}
                        />
                    )}
                    <PanelContainer routeTopOffset={routeTopOffset} />

                    {route && <RoutePanel route={route} onChange={setRoute} onClose={() => setRoute(null)} />}

                    <div
                        className='absolute top-2 right-2 z-110 flex flex-col items-end gap-2'
                        onContextMenu={e => e.stopPropagation()}
                    >
                        <ZoomControl />
                        <CompassControl />
                        <MapStyleSwitcher
                            value={mapStyleId}
                            onChange={setMapStyleId}
                        />
                    </div>

                    <div
                        className='absolute right-2 z-110'
                        style={{ bottom: `${panelBottom + 8}px` }}
                        onContextMenu={e => e.stopPropagation()}
                    >
                        <CenterControl />
                    </div>
                </Map>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={handleCreatePlace}>
                    <MapPinPlus />
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
