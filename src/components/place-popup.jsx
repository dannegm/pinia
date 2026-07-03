import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, FlagTriangleRight, MapPin, Clock, StickyNote } from 'lucide-react';
import { MarkerPopup } from '@/ui/map';
import { ToggleIconButton } from '@/ui/toggle-icon-button';
import { updatePlaceMutation } from '@/queries/places';
import { PlaceNavigationRow } from '@/components/place-navigation-row';
import { BRAND_COLOR, FAVORITE_COLOR } from '@/constants/map-defaults';

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
            <div className='flex flex-col gap-2.5'>
                <div className='flex items-start justify-between gap-2'>
                    <div>
                        <p className='pr-6 text-sm font-semibold text-foreground'>{place.name}</p>
                        {place.category?.name && (
                            <p className='flex items-center gap-1.5 text-xs text-foreground/70'>
                                <span
                                    className='size-2 shrink-0 rounded-full bg-(--category-color)'
                                    style={{ '--category-color': place.category.color }}
                                />
                                {place.category.name}
                            </p>
                        )}
                    </div>
                    <div className='flex shrink-0 gap-1'>
                        <ToggleIconButton
                            active={place.is_favorite}
                            onClick={toggleFavorite}
                            label='Favorito'
                            activeColor={FAVORITE_COLOR}
                        >
                            <Star />
                        </ToggleIconButton>
                        <ToggleIconButton
                            active={place.is_beacon}
                            onClick={toggleBeacon}
                            label='Beacon'
                            activeColor={place.category?.color ?? BRAND_COLOR}
                        >
                            <FlagTriangleRight />
                        </ToggleIconButton>
                    </div>
                </div>

                {(place.address || place.hours || place.notes) && (
                    <div className='flex flex-col gap-1 text-xs text-foreground/70'>
                        {place.address && (
                            <p className='flex items-start gap-1.5'>
                                <MapPin className='mt-0.5 size-3.5 shrink-0 text-foreground/40' />
                                <span>{place.address}</span>
                            </p>
                        )}
                        {place.hours && (
                            <p className='flex items-start gap-1.5'>
                                <Clock className='mt-0.5 size-3.5 shrink-0 text-foreground/40' />
                                <span>{place.hours}</span>
                            </p>
                        )}
                        {place.notes && (
                            <p className='flex items-start gap-1.5'>
                                <StickyNote className='mt-0.5 size-3.5 shrink-0 text-foreground/40' />
                                <span>{place.notes}</span>
                            </p>
                        )}
                    </div>
                )}

                <PlaceNavigationRow place={place} />
            </div>
        </MarkerPopup>
    );
};
