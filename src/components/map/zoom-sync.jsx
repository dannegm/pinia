import { useEffect } from 'react';
import { useMap } from '@/ui/map';

export const ZoomSync = ({ onZoomChange }) => {
    const { map, isLoaded } = useMap();

    useEffect(() => {
        if (!isLoaded || !map) return;
        const handleZoomEnd = () => onZoomChange(map.getZoom());
        map.on('zoomend', handleZoomEnd);
        return () => map.off('zoomend', handleZoomEnd);
    }, [isLoaded, map, onZoomChange]);

    return null;
};
