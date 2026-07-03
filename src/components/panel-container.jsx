import { Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useMap } from '@/ui/map';
import { usePanelOffset } from '@/hooks/use-panel-offset';
import { cn } from '@/helpers/utils';
import { Drawer, DrawerContent } from '@/ui/drawer';
import { PanelNavButtons } from '@/components/panel-nav-buttons';

export const PanelContainer = () => {
    const { map } = useMap();
    const navigate = useNavigate();
    const { isDesktop, isOpen, left, bottom } = usePanelOffset();

    useEffect(() => {
        map.easeTo({ padding: { left, bottom }, duration: 200 });
    }, [map, left, bottom]);

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
