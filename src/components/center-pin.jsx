import { useEffect, useState } from 'react';
import { useMap } from '@/ui/map';

export const CenterPin = ({ onCoordsChange, children }) => {
    const { map, isLoaded } = useMap();
    const [padding, setPadding] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
    const [isPanning, setIsPanning] = useState(false);

    useEffect(() => {
        if (!isLoaded || !map) return;

        const sync = () => {
            onCoordsChange(map.getCenter());
            setPadding(map.getPadding());
        };
        const startPanning = () => setIsPanning(true);
        const stopPanning = () => setIsPanning(false);

        sync();
        map.on('move', sync);
        map.on('dragstart', startPanning);
        map.on('dragend', stopPanning);

        return () => {
            map.off('move', sync);
            map.off('dragstart', startPanning);
            map.off('dragend', stopPanning);
        };
    }, [isLoaded, map]);

    return (
        <div
            className='pointer-events-none absolute'
            style={{
                top: `${padding.top}px`,
                right: `${padding.right}px`,
                bottom: `${padding.bottom}px`,
                left: `${padding.left}px`,
            }}
        >
            <div className='flex-center h-full w-full'>{children(isPanning)}</div>
        </div>
    );
};
