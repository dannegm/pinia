import { MapMarker, MarkerContent } from '@/ui/map';

export const ContextMenuPulse = ({ coords }) => (
    <MapMarker longitude={coords.lng} latitude={coords.lat} className='pointer-events-none'>
        <MarkerContent className='pointer-events-none cursor-default'>
            <div className='pointer-events-none animate-radar-ping-once size-32 rounded-full border-2 border-primary bg-primary/10' />
        </MarkerContent>
    </MapMarker>
);
