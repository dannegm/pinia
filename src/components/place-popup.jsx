import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Radar } from 'lucide-react';
import { MarkerPopup } from '@/ui/map';
import { cn } from '@/helpers/utils';
import { updatePlaceMutation } from '@/queries/places';

const ToggleIconButton = ({ active, onClick, label, activeClassName, children }) => (
    <button
        type='button'
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        className={cn(
            'flex-center size-8 rounded-md border border-border text-foreground/70 transition-colors hover:bg-accent [&>svg]:size-4',
            active && activeClassName,
        )}
    >
        {children}
    </button>
);

export const PlacePopup = ({ place }) => {
    const queryClient = useQueryClient();

    const mutation = useMutation(
        updatePlaceMutation({
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ['places'] }),
        }),
    );

    const toggleFavorite = () => mutation.mutate({ id: place.id, is_favorite: !place.is_favorite });
    const toggleBeacon = () => mutation.mutate({ id: place.id, is_beacon: !place.is_beacon });

    return (
        <MarkerPopup closeButton>
            <div className='flex flex-col gap-2'>
                <div className='flex items-start justify-between gap-2'>
                    <div>
                        <p className='text-sm font-medium text-foreground/90'>{place.name}</p>
                        {place.category?.name && (
                            <p className='text-xs text-foreground/70'>{place.category.name}</p>
                        )}
                    </div>
                    <div className='flex shrink-0 gap-1'>
                        <ToggleIconButton
                            active={place.is_favorite}
                            onClick={toggleFavorite}
                            label='Favorito'
                            activeClassName='border-amber-500 bg-amber-500/10 text-amber-500'
                        >
                            <Star className={cn(place.is_favorite && 'fill-current')} />
                        </ToggleIconButton>
                        <ToggleIconButton
                            active={place.is_beacon}
                            onClick={toggleBeacon}
                            label='Beacon'
                            activeClassName='border-red-500 bg-red-500/10 text-red-500'
                        >
                            <Radar />
                        </ToggleIconButton>
                    </div>
                </div>

                {place.address && <p className='text-xs text-foreground/70'>{place.address}</p>}
                {place.hours && <p className='text-xs text-foreground/70'>{place.hours}</p>}
                {place.notes && <p className='text-xs text-foreground/70'>{place.notes}</p>}
            </div>
        </MarkerPopup>
    );
};
