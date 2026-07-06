import { useEffect, useRef } from 'react';
import { Plus, Minus, LocateFixed, Scan, PersonStanding } from 'lucide-react';
import { useMap } from '@/ui/map';
import { useSettings } from '@/hooks/use-settings';
import { useGeolocation } from '@/hooks/use-geolocation';
import { DEFAULT_VIEWPORT, FOCUS_ZOOM } from '@/constants/map-defaults';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip';
import { CompassNeedleIcon } from '@/ui/icons';
import { cn } from '@/helpers/utils';

const ToolbarGroup = ({ children }) => (
    <div className='flex flex-col items-center gap-0.5 rounded-sm bg-background p-0.75 shadow-md shadow-black/10'>
        {children}
    </div>
);

const ToolbarButton = ({ onClick, label, children, disabled = false }) => (
    <Tooltip>
        <TooltipTrigger
            render={
                <button
                    type='button'
                    onClick={onClick}
                    aria-label={label}
                    disabled={disabled}
                    className={cn(
                        'flex size-7 items-center justify-center rounded-sm text-foreground/70 transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                        'disabled:pointer-events-none disabled:opacity-50',
                    )}
                />
            }
        >
            {children}
        </TooltipTrigger>
        <TooltipContent side='left'>{label}</TooltipContent>
    </Tooltip>
);

export const ZoomControl = () => {
    const { map } = useMap();

    const handleZoomIn = () => map?.zoomTo(map.getZoom() + 1, { duration: 300 });
    const handleZoomOut = () => map?.zoomTo(map.getZoom() - 1, { duration: 300 });

    return (
        <ToolbarGroup>
            <ToolbarButton onClick={handleZoomIn} label='Acercar'>
                <Plus className='size-4' />
            </ToolbarButton>
            <ToolbarButton onClick={handleZoomOut} label='Alejar'>
                <Minus className='size-4' />
            </ToolbarButton>
        </ToolbarGroup>
    );
};

export const CompassControl = () => {
    const { map } = useMap();
    const $compass = useRef(null);

    useEffect(() => {
        if (!map || !$compass.current) return;
        const compass = $compass.current;

        const updateRotation = () => {
            const bearing = map.getBearing();
            const pitch = map.getPitch();
            compass.style.transform = `rotateX(${pitch}deg) rotateZ(${-bearing}deg)`;
        };

        map.on('rotate', updateRotation);
        map.on('pitch', updateRotation);
        updateRotation();

        return () => {
            map.off('rotate', updateRotation);
            map.off('pitch', updateRotation);
        };
    }, [map]);

    const handleResetBearing = () => map?.resetNorthPitch({ duration: 300 });

    return (
        <ToolbarGroup>
            <ToolbarButton onClick={handleResetBearing} label='Reiniciar orientación'>
                <CompassNeedleIcon
                    ref={$compass}
                    className='size-6 transform-3d transition-transform duration-200'
                />
            </ToolbarButton>
        </ToolbarGroup>
    );
};

export const LocateControl = () => {
    const { map } = useMap();
    const currentLocation = useGeolocation();

    const handleLocate = () =>
        currentLocation &&
        map?.flyTo({ center: [currentLocation.lng, currentLocation.lat], zoom: FOCUS_ZOOM, duration: 500 });

    return (
        <ToolbarGroup>
            <ToolbarButton onClick={handleLocate} label='Centrar en mi ubicación' disabled={!currentLocation}>
                <Scan className='size-4'>
                    <PersonStanding size={20} x={2} y={2} absoluteStrokeWidth className='text-foreground' />
                </Scan>
            </ToolbarButton>
        </ToolbarGroup>
    );
};

export const CenterControl = () => {
    const { map } = useMap();
    const [center] = useSettings('mapCenter', DEFAULT_VIEWPORT.center);

    const handleCenter = () => map?.flyTo({ center, zoom: DEFAULT_VIEWPORT.zoom, duration: 500 });

    return (
        <ToolbarGroup>
            <ToolbarButton onClick={handleCenter} label='Centrar mapa'>
                <LocateFixed className='size-4' />
            </ToolbarButton>
        </ToolbarGroup>
    );
};
