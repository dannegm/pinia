import { useEffect, useRef, useState } from 'react';

const CLOSE_THRESHOLD = 80;
const DRAG_START_THRESHOLD = 8;
const TRANSITION_MS = 200;

export const MobilePanelSheet = ({ open, onClose, onDragChange, children }) => {
    const [mounted, setMounted] = useState(open);
    const [entered, setEntered] = useState(false);
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const $startY = useRef(0);
    const $pointerId = useRef(null);

    useEffect(() => {
        if (open) {
            setMounted(true);
            const frame = requestAnimationFrame(() => setEntered(true));
            return () => cancelAnimationFrame(frame);
        }

        setEntered(false);
        const timeout = setTimeout(() => setMounted(false), TRANSITION_MS);
        return () => clearTimeout(timeout);
    }, [open]);

    useEffect(() => {
        onDragChange?.(isDragging ? dragY : 0, isDragging);
    }, [dragY, isDragging, onDragChange]);

    const handlePointerDown = event => {
        $startY.current = event.clientY;
        $pointerId.current = event.pointerId;
    };

    const handlePointerMove = event => {
        if ($pointerId.current !== event.pointerId) return;
        const delta = event.clientY - $startY.current;

        if (!isDragging) {
            if (delta < DRAG_START_THRESHOLD) return;
            setIsDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
        }

        event.preventDefault();
        setDragY(Math.max(0, delta));
    };

    const endDrag = () => {
        $pointerId.current = null;
        if (!isDragging) return;
        setIsDragging(false);
        if (dragY > CLOSE_THRESHOLD) onClose();
        setDragY(0);
    };

    if (!mounted) return null;

    return (
        <div
            className='flex max-h-[85dvh] min-h-0 flex-col overflow-hidden border-b border-border transition-transform duration-200 ease-out translate-y-(--sheet-y)'
            style={{ '--sheet-y': entered ? '0px' : '100%' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
        >
            <div className='flex h-6 shrink-0 items-center justify-center select-none'>
                <div className='h-1.5 w-10 rounded-full bg-muted' />
            </div>
            <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>{children}</div>
        </div>
    );
};
