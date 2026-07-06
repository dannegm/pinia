import { useMediaQuery } from '@/hooks/use-media-query';

export const useIsTouchDevice = () => useMediaQuery('(pointer: coarse)');
