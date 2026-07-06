import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQueryState, parseAsBoolean } from 'nuqs';
import { ExternalLink } from 'lucide-react';
import { Map } from '@/ui/map';
import {
    DEFAULT_VIEWPORT,
    MIN_ZOOM,
    MAX_ZOOM,
    BRAND_COLOR,
    MAP_STYLES,
    DEFAULT_MAP_STYLE_ID,
    parseAsZoom,
} from '@/constants/map-defaults';
import { usePanelOffset } from '@/hooks/use-panel-offset';
import { DirectionArrow } from '@/components/direction-arrow';
import { PlacesLayer } from '@/components/places-layer';
import { ZoomSync } from '@/components/zoom-sync';
import { PointNemoMarker } from '@/components/point-nemo-marker';
import { RoutePanel, ROUTE_PANEL_HEIGHT, ROUTE_PANEL_HEIGHT_MOBILE } from '@/components/route-panel';
import { ZoomControl, CompassControl, CenterControl } from '@/components/map-toolbar';
import { placesQuery } from '@/queries/places';

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

const openFullApp = () => {
    const embedParams = new URLSearchParams(window.location.search);
    const params = new URLSearchParams();
    ['place', 'route', 'style', 'zoom'].forEach(key => {
        const value = embedParams.get(key);
        if (value) params.set(key, value);
    });
    const query = params.toString();
    window.open(`${window.location.origin}/${query ? `?${query}` : ''}`, '_blank', 'noopener,noreferrer');
};

export const EmbedMapShell = () => {
    const [route, setRoute] = useState(null);
    const [routeParam] = useQueryState('route', { defaultValue: '' });
    const [focusedPlaceId] = useQueryState('place', { defaultValue: '' });
    const [styleId] = useQueryState('style', { defaultValue: DEFAULT_MAP_STYLE_ID });
    const [zoom, setZoom] = useQueryState('zoom', parseAsZoom.withDefault(DEFAULT_VIEWPORT.zoom));
    const [showPlaces] = useQueryState('showPlaces', parseAsBoolean.withDefault(true));
    const mapStyleUrl = MAP_STYLES.find(style => style.id === styleId)?.url ?? MAP_STYLES[0].url;
    const { data: places, isSuccess: placesLoaded } = useQuery(placesQuery());
    const $hydratedRoute = useRef(false);
    const { left: panelLeft, bottom: panelBottom, isDesktop } = usePanelOffset();
    const routeTopOffset = route ? (isDesktop ? ROUTE_PANEL_HEIGHT : ROUTE_PANEL_HEIGHT_MOBILE) : 0;

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

    const pinnedIds = showPlaces
        ? null
        : [focusedPlaceId, route?.origin?.placeId, route?.destination?.placeId].filter(Boolean);

    return (
        <div
            className='relative block h-dvh w-dvw overflow-hidden'
            onContextMenu={e => e.preventDefault()}
        >
            <Map
                theme='light'
                styles={{ light: mapStyleUrl }}
                viewport={{ center: DEFAULT_VIEWPORT.center, zoom }}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                attributionControl={false}
                className='h-full w-full'
            >
                <ZoomSync onZoomChange={setZoom} />

                <PlacesLayer topOffset={routeTopOffset} readOnly pinnedIds={pinnedIds} />
                <PointNemoMarker />

                {route && shouldShowRouteBeacon(route.origin, places) && (
                    <DirectionArrow
                        coords={{ lat: route.origin.lat, lng: route.origin.lng }}
                        color={getRouteBeaconColor(route.origin, places)}
                        flyToZoom={16}
                        label={route.origin.label}
                        offsets={{ left: panelLeft, bottom: panelBottom, top: routeTopOffset }}
                    />
                )}
                {route && shouldShowRouteBeacon(route.destination, places) && (
                    <DirectionArrow
                        coords={{ lat: route.destination.lat, lng: route.destination.lng }}
                        color={getRouteBeaconColor(route.destination, places)}
                        flyToZoom={16}
                        label={route.destination.label}
                        offsets={{ left: panelLeft, bottom: panelBottom, top: routeTopOffset }}
                    />
                )}

                {route && <RoutePanel route={route} onChange={setRoute} readOnly />}

                <div className='absolute top-2 right-2 z-[110] flex flex-col items-end gap-2'>
                    <ZoomControl />
                    <CompassControl />
                </div>

                <div className='absolute right-2 bottom-2 z-[110]'>
                    <CenterControl />
                </div>

                <div className='absolute bottom-2 left-2 z-[110]'>
                    <button
                        type='button'
                        onClick={openFullApp}
                        className='flex items-center gap-1.5 rounded-sm bg-background px-3 py-2 text-sm font-medium text-foreground/70 shadow-md shadow-black/10 transition-colors hover:bg-accent hover:text-accent-foreground [&>svg]:size-4'
                    >
                        <ExternalLink />
                        Abrir mapa completo
                    </button>
                </div>
            </Map>
        </div>
    );
};
