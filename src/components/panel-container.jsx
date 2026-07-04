import { Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useMap } from '@/ui/map';
import { usePanelOffset } from '@/hooks/use-panel-offset';
import { cn } from '@/helpers/utils';
import { PanelNavButtons } from '@/components/panel-nav-buttons';
import { MobilePanelSheet } from '@/components/mobile-panel-sheet';

export const PanelContainer = () => {
    const { map } = useMap();
    const navigate = useNavigate();
    const { isDesktop, isOpen, left, bottom } = usePanelOffset();
    const [dockDrag, setDockDrag] = useState({ y: 0, dragging: false });

    useEffect(() => {
        map.easeTo({ padding: { left, bottom }, duration: 200 });
    }, [map, left, bottom]);

    const close = () => navigate({ to: '/' });

    if (isDesktop) {
        return (
            <div className='absolute top-2 bottom-2 left-2 z-20 flex overflow-hidden squircle-xl border border-border bg-background shadow-lg shadow-black/10'>
                <div className='flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border/70 p-2'>
                    <div className='flex-center mb-1 size-10 shrink-0 squircle-lg bg-primary text-primary-foreground [&>svg]:size-5'>
                        <MapPin />
                    </div>
                    <PanelNavButtons
                        className='flex flex-col items-center gap-1'
                        buttonClassName='size-10 squircle-lg'
                    />
                </div>
                <div
                    className={cn(
                        'flex h-full min-h-0 flex-col overflow-hidden transition-[width] duration-200',
                        isOpen ? 'w-80' : 'w-0',
                    )}
                >
                    {isOpen && <Outlet />}
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-xl border border-border bg-background pb-[env(safe-area-inset-bottom)] shadow-lg shadow-black/10 translate-y-(--dock-y)',
                !dockDrag.dragging && 'transition-transform duration-200 ease-out',
            )}
            style={{ '--dock-y': `${dockDrag.y}px` }}
        >
            <MobilePanelSheet open={isOpen} onClose={close} onDragChange={(y, dragging) => setDockDrag({ y, dragging })}>
                {isOpen && <Outlet />}
            </MobilePanelSheet>

            <nav className='flex justify-around'>
                <PanelNavButtons className='contents' buttonClassName='size-12' />
            </nav>
        </div>
    );
};
