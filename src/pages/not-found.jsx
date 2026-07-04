import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMap } from '@/ui/map';
import { POINT_NEMO } from '@/components/point-nemo-marker';

export const NotFoundPage = () => {
    const { map, isLoaded } = useMap();
    const navigate = useNavigate();

    useEffect(() => {
        if (!map || !isLoaded) return;
        map.jumpTo({ center: [POINT_NEMO.lng, POINT_NEMO.lat], zoom: 14 });
        navigate({ to: '/', replace: true });
    }, [map, isLoaded, navigate]);

    return null;
};
