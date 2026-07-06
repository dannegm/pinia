import { useState } from 'react';
import { MapMarker, MarkerContent } from '@/ui/map';
import { PinGlyph } from '@/components/pin-glyph';

export const PinDrop = ({ coords, onCoordsChange }) => {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <MapMarker
            longitude={coords.lng}
            latitude={coords.lat}
            anchor='bottom'
            draggable
            onDragStart={() => setIsDragging(true)}
            onDrag={onCoordsChange}
            onDragEnd={next => {
                setIsDragging(false);
                onCoordsChange(next);
            }}
        >
            <MarkerContent>
                <PinGlyph lifted={isDragging} />
            </MarkerContent>
        </MapMarker>
    );
};
