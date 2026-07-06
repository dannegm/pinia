import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMap } from '@/ui/map';

export const CenterPin = ({ onCoordsChange, anchor = 'center', children }) => {
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

    if (!map) return null;

    return createPortal(
        <div
            className='pointer-events-none absolute'
            style={{
                top: `${padding.top}px`,
                right: `${padding.right}px`,
                bottom: `${padding.bottom}px`,
                left: `${padding.left}px`,
            }}
        >
            {anchor === 'bottom' ? (
                <div className='absolute-center'>
                    <div className='absolute bottom-0 left-1/2 -translate-x-1/2'>{children(isPanning)}</div>
                </div>
            ) : (
                <div className='flex-center h-full w-full'>{children(isPanning)}</div>
            )}
        </div>,
        map.getContainer(),
    );
};
