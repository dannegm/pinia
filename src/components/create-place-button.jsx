import { MapPinPlus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/helpers/utils';

export const CreatePlaceButton = ({ className }) => {
    const navigate = useNavigate();

    return (
        <button
            type='button'
            aria-label='Crear lugar'
            onClick={() => navigate({ to: '/places/new' })}
            className={cn(
                'flex-center squircle-2xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 [&>svg]:size-5',
                className,
            )}
        >
            <MapPinPlus />
        </button>
    );
};
