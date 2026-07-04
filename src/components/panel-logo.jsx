import { cn } from '@/helpers/utils';

export const PanelLogo = ({ className, onClick }) => (
    <img
        src='/pina.png'
        alt='Pinia'
        onClick={onClick}
        className={cn({ 'cursor-pointer': !!onClick }, className)}
    />
);
