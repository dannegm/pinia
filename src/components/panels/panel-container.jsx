import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { useMap } from '@/ui/map';
import { usePanelOffset } from '@/hooks/use-panel-offset';
import { useListener } from '@/providers/bus-provider';
import { cn } from '@/helpers/utils';
import { PanelNavButtons } from '@/components/panels/panel-nav-buttons';
import { CreatePlaceButton } from '@/components/places/create-place-button';
import { PanelLogo } from '@/components/panels/panel-logo';
import { MobilePanelSheet } from '@/components/panels/mobile-panel-sheet';

const COLLAPSED_HEIGHT = '30dvh';

export const PanelContainer = ({ routeTopOffset = 0 }) => {
    const { map } = useMap();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { isDesktop, isOpen, left, bottom } = usePanelOffset();
    const [dockDrag, setDockDrag] = useState({ y: 0, dragging: false });
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        map.easeTo({ padding: { left, bottom, top: routeTopOffset }, duration: 200 });
    }, [map, left, bottom, routeTopOffset]);

    useEffect(() => {
        setCollapsed(false);
    }, [pathname]);

    useListener('panel:collapse', setCollapsed);

    const close = () => navigate({ to: '/' });
    const handleDragChange = useCallback((y, dragging) => setDockDrag({ y, dragging }), []);
    const dockY = collapsed ? `calc(${dockDrag.y}px + 100% - ${COLLAPSED_HEIGHT})` : `${dockDrag.y}px`;

    if (isDesktop) {
        return (
            <div
                onContextMenu={e => e.stopPropagation()}
                className='absolute top-2 bottom-2 left-2 z-120 flex overflow-hidden squircle-xl border border-border bg-background shadow-lg shadow-black/10'
            >
                <div className='flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border/70 p-2'>
                    <PanelLogo className='my-2 size-8 shrink-0 squircle-lg object-cover' onClick={close} />
                    <PanelNavButtons
                        className='flex flex-col items-center gap-1'
                        buttonClassName='size-10 squircle-lg'
                    />
                    <CreatePlaceButton className='size-10' />
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
            onContextMenu={e => e.stopPropagation()}
            className={cn(
                'absolute inset-x-0 bottom-0 z-120 flex flex-col overflow-hidden rounded-t-xl border border-border bg-background pb-[env(safe-area-inset-bottom)] shadow-lg shadow-black/10 translate-y-(--dock-y)',
                !dockDrag.dragging && 'transition-transform duration-200 ease-out',
            )}
            style={{ '--dock-y': dockY }}
        >
            <MobilePanelSheet
                open={isOpen}
                onClose={close}
                onDragChange={handleDragChange}
            >
                <Outlet />
            </MobilePanelSheet>

            <nav className='relative flex items-center justify-around p-1 z-150'>
                <PanelLogo className='my-2 size-8 shrink-0 squircle-lg object-cover' onClick={close} />
                <PanelNavButtons className='contents' buttonClassName='size-10 squircle-lg' />
                <CreatePlaceButton className='size-10' />
            </nav>
        </div>
    );
};
