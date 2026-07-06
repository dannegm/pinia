import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useMap } from '@/ui/map';
import { usePanelOffset } from '@/hooks/use-panel-offset';
import { cn } from '@/helpers/utils';

const TOOLTIP_POSITION_CLASSES = {
    'top:start': 'bottom-full mb-1.5 left-0',
    'top:end': 'bottom-full mb-1.5 right-0',
    'bottom:start': 'top-full mt-1.5 left-0',
    'bottom:end': 'top-full mt-1.5 right-0',
    'left:start': 'right-full mr-1.5 top-0',
    'left:end': 'right-full mr-1.5 bottom-0',
    'right:start': 'left-full ml-1.5 top-0',
    'right:end': 'left-full ml-1.5 bottom-0',
};

export const DirectionArrow = ({
    coords,
    color,
    className,
    flyToZoom = 16,
    label,
    offsets = {},
    priority = 10,
}) => {
    const { map, isLoaded } = useMap();
    const { isDesktop } = usePanelOffset();
    const [arrow, setArrow] = useState(null);
    const { top = 0, right = 0, bottom = 0, left = 0 } = offsets;

    useEffect(() => {
        if (!isLoaded || !map || !coords) return;

        const update = () => {
            const { width, height } = map.getContainer().getBoundingClientRect();
            const projected = map.project([coords.lng, coords.lat]);

            const pad = isDesktop ? 40 : 20;
            const minX = pad + left;
            const maxX = width - pad - right;
            const minY = pad + top;
            const maxY = height - pad - bottom;

            if (projected.x >= minX && projected.x <= maxX && projected.y >= minY && projected.y <= maxY) {
                setArrow(null);
                return;
            }

            const cx = width / 2;
            const cy = height / 2;
            const dx = projected.x - cx;
            const dy = projected.y - cy;

            const scaleX = dx > 0 ? (maxX - cx) / dx : dx < 0 ? (minX - cx) / dx : Infinity;
            const scaleY = dy > 0 ? (maxY - cy) / dy : dy < 0 ? (minY - cy) / dy : Infinity;
            const scale = Math.min(scaleX, scaleY);

            const isHorizontalBound = scaleX <= scaleY;
            const tooltipSide = isHorizontalBound ? (dx > 0 ? 'left' : 'right') : dy > 0 ? 'top' : 'bottom';

            const finalX = cx + dx * scale;
            const finalY = cy + dy * scale;
            const crossAlign = isHorizontalBound
                ? finalY < height / 2
                    ? 'start'
                    : 'end'
                : finalX < width / 2
                  ? 'start'
                  : 'end';

            setArrow({
                x: finalX,
                y: finalY,
                angle: Math.atan2(dy, dx) * (180 / Math.PI) + 90,
                tooltipPosition: `${tooltipSide}:${crossAlign}`,
            });
        };

        update();
        map.on('move', update);
        map.on('zoom', update);

        return () => {
            map.off('move', update);
            map.off('zoom', update);
            setArrow(null);
        };
    }, [isLoaded, map, coords, top, right, bottom, left, isDesktop]);

    if (!arrow) return null;

    return (
        <div
            className={cn(
                'group flex-center absolute top-(--arrow-y) left-(--arrow-x) z-(--arrow-z) size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full text-white shadow-lg shadow-black/50 transition-[filter] hover:brightness-110 [&>svg]:size-4',
                color && 'bg-(--arrow-color)',
                className,
            )}
            style={{
                '--arrow-x': `${arrow.x}px`,
                '--arrow-y': `${arrow.y}px`,
                '--arrow-z': 101 - priority,
                ...(color && { '--arrow-color': color }),
            }}
            onClick={() =>
                map.flyTo({ center: [coords.lng, coords.lat], zoom: flyToZoom, duration: 800 })
            }
        >
            <ArrowUp className='rotate-(--arrow-angle)' style={{ '--arrow-angle': `${arrow.angle}deg` }} />

            {label && (
                <span
                    className={cn(
                        'bg-foreground text-background pointer-events-none absolute rounded-md px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100',
                        TOOLTIP_POSITION_CLASSES[arrow.tooltipPosition],
                    )}
                >
                    {label}
                </span>
            )}
        </div>
    );
};
