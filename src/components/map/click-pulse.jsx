import { useEffect, useRef, useState } from 'react';
import { useMap } from '@/ui/map';
import { ContextMenuPulse } from '@/components/map/context-menu-pulse';

export const ClickPulse = () => {
    const { map, isLoaded } = useMap();
    const [coords, setCoords] = useState(null);
    const $pulseId = useRef(0);

    useEffect(() => {
        if (!isLoaded || !map) return;

        const handleClick = e => {
            $pulseId.current += 1;
            setCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng, id: $pulseId.current });
        };

        map.on('click', handleClick);
        return () => map.off('click', handleClick);
    }, [isLoaded, map]);

    if (!coords) return null;

    return <ContextMenuPulse key={coords.id} coords={coords} />;
};
