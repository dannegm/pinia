import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useMap } from '@/ui/map';
import { cn } from '@/helpers/utils';

export const DirectionArrow = ({ coords, className, flyToZoom = 14 }) => {
    const { map, isLoaded } = useMap();
    const [arrow, setArrow] = useState(null);

    useEffect(() => {
        if (!isLoaded || !map || !coords) return;

        const update = () => {
            if (map.getBounds().contains([coords.lng, coords.lat])) {
                setArrow(null);
                return;
            }

            const { width, height } = map.getContainer().getBoundingClientRect();
            const projected = map.project([coords.lng, coords.lat]);

            const cx = width / 2;
            const cy = height / 2;
            const dx = projected.x - cx;
            const dy = projected.y - cy;

            const pad = 40;
            const scaleX = dx !== 0 ? (width / 2 - pad) / Math.abs(dx) : Infinity;
            const scaleY = dy !== 0 ? (height / 2 - pad) / Math.abs(dy) : Infinity;
            const scale = Math.min(scaleX, scaleY);

            setArrow({
                x: cx + dx * scale,
                y: cy + dy * scale,
                angle: Math.atan2(dy, dx) * (180 / Math.PI) + 90,
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
    }, [isLoaded, map, coords]);

    if (!arrow) return null;

    return (
        <div
            className={cn(
                'flex-center absolute top-(--arrow-y) left-(--arrow-x) z-10 size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full text-white shadow-lg shadow-black/50 transition-colors [&>svg]:size-4',
                className,
            )}
            style={{ '--arrow-x': `${arrow.x}px`, '--arrow-y': `${arrow.y}px` }}
            onClick={() =>
                map.flyTo({ center: [coords.lng, coords.lat], zoom: flyToZoom, duration: 800 })
            }
        >
            <ArrowUp className='rotate-(--arrow-angle)' style={{ '--arrow-angle': `${arrow.angle}deg` }} />
        </div>
    );
};
