import { useState } from 'react';
import { MapMarker, MarkerContent } from '@/ui/map';
import { cn } from '@/helpers/utils';

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
                <div className='relative flex flex-col items-center'>
                    <div
                        className={cn(
                            'z-10 flex flex-col items-center transition-transform duration-150 ease-out',
                            isDragging && '-translate-y-3',
                        )}
                    >
                        <div className='size-5 rounded-full bg-rose-500'>
                            <div className='size-1.5 rounded-full bg-white absolute right-1 top-1' />
                        </div>
                        <div className='h-3 w-1 bg-gray-300 rounded-b-md' />
                    </div>
                    <div className='animate-radar-ping absolute bottom-0 size-32 translate-y-1/2 rounded-full border-2 border-primary bg-primary/10' />
                    <div className='absolute bottom-0 size-2 translate-y-1/2 rounded-full bg-foreground/40' />
                </div>
            </MarkerContent>
        </MapMarker>
    );
};
