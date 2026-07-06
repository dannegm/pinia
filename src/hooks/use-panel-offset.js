import { useLocation } from '@tanstack/react-router';
import { useMediaQuery } from '@/hooks/use-media-query';

export const RAIL_WIDTH = 56;
export const PANEL_WIDTH = 320;
export const MOBILE_NAV_HEIGHT = 56;

export const usePanelOffset = () => {
    const { pathname } = useLocation();
    const isDesktop = useMediaQuery('(min-width: 640px)');
    const isEmbed = pathname.startsWith('/embed');
    const isOpen = !isEmbed && pathname !== '/';

    return {
        isDesktop,
        isOpen,
        left: isEmbed ? 0 : isDesktop ? RAIL_WIDTH + (isOpen ? PANEL_WIDTH : 0) : 0,
        bottom: isEmbed ? 0 : isDesktop ? 0 : MOBILE_NAV_HEIGHT,
    };
};
