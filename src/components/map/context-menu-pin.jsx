import { MapMarker, MarkerContent } from '@/ui/map';
import { PinGlyph } from '@/components/map/pin-glyph';

export const ContextMenuPin = ({ coords }) => (
    <MapMarker longitude={coords.lng} latitude={coords.lat} anchor='bottom'>
        <MarkerContent>
            <PinGlyph color='bg-primary' pulse={false} />
        </MarkerContent>
    </MapMarker>
);
