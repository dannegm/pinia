import { useEffect, useRef, useState } from 'react';

const PRECISION = 5;
const DEBOUNCE_MS = 2500;

const round = value => Number(value.toFixed(PRECISION));

export const useStableLocation = location => {
    const [stableLocation, setStableLocation] = useState(null);
    const $committedKey = useRef(null);
    const $timeout = useRef(null);

    useEffect(() => {
        if (!location) return;

        const rounded = { lat: round(location.lat), lng: round(location.lng) };
        const key = `${rounded.lat},${rounded.lng}`;
        if (key === $committedKey.current) return;

        clearTimeout($timeout.current);
        $timeout.current = setTimeout(() => {
            $committedKey.current = key;
            setStableLocation(rounded);
        }, DEBOUNCE_MS);

        return () => clearTimeout($timeout.current);
    }, [location]);

    return stableLocation;
};
