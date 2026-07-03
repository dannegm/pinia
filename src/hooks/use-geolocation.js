import { useEffect, useState } from 'react';

export const useGeolocation = () => {
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        if (!('geolocation' in navigator)) return;

        const watchId = navigator.geolocation.watchPosition(
            position => {
                setCoords({ lng: position.coords.longitude, lat: position.coords.latitude });
            },
            () => {},
            { enableHighAccuracy: true },
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return coords;
};
