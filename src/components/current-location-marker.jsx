import { PersonStanding } from 'lucide-react';
import { MapMarker, MarkerContent, useMap } from '@/ui/map';

export const CurrentLocationMarker = ({ coords, flyToZoom = 14 }) => {
    const { map } = useMap();

    return (
        <MapMarker
            longitude={coords.lng}
            latitude={coords.lat}
            onClick={() =>
                map?.flyTo({ center: [coords.lng, coords.lat], zoom: flyToZoom, duration: 800 })
            }
        >
            <MarkerContent>
                <div className='flex-center size-6 rounded-full border-2 border-white bg-primary text-primary-foreground shadow-md shadow-black/50'>
                    <PersonStanding className='size-3.5' />
                </div>
            </MarkerContent>
        </MapMarker>
    );
};
