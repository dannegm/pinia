import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useMap } from '@/ui/map';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/helpers/utils';
import { Drawer, DrawerContent } from '@/ui/drawer';
import { PanelNavButtons } from '@/components/panel-nav-buttons';

const RAIL_WIDTH = 56;
const PANEL_WIDTH = 320;
const MOBILE_NAV_HEIGHT = 56;

export const PanelContainer = () => {
    const { map } = useMap();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const isDesktop = useMediaQuery('(min-width: 640px)');
    const isOpen = pathname !== '/';

    useEffect(() => {
        if (!isDesktop) {
            map.easeTo({ padding: { left: 0, bottom: MOBILE_NAV_HEIGHT }, duration: 200 });
            return;
        }
        map.easeTo({
            padding: { left: RAIL_WIDTH + (isOpen ? PANEL_WIDTH : 0), bottom: 0 },
            duration: 200,
        });
    }, [map, isDesktop, isOpen]);

    const close = () => navigate({ to: '/' });

    if (isDesktop) {
        return (
            <div className='absolute top-2 bottom-2 left-2 z-20 flex overflow-hidden rounded-lg border border-border bg-background shadow-lg shadow-black/20'>
                <PanelNavButtons
                    className='flex w-14 shrink-0 flex-col items-center gap-1 p-2'
                    buttonClassName='size-10 rounded-md'
                />
                <div
                    className={cn(
                        'h-full overflow-y-auto border-l border-border transition-[width] duration-200',
                        isOpen ? 'w-80 p-4' : 'w-0 border-l-0 p-0',
                    )}
                >
                    {isOpen && <Outlet />}
                </div>
            </div>
        );
    }

    return (
        <>
            <nav className='absolute inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-background'>
                <PanelNavButtons className='contents' buttonClassName='size-12' />
            </nav>

            <Drawer modal={false} open={isOpen} onOpenChange={open => !open && close()}>
                <DrawerContent>
                    <div className='overflow-y-auto p-4'>{isOpen && <Outlet />}</div>
                </DrawerContent>
            </Drawer>
        </>
    );
};
