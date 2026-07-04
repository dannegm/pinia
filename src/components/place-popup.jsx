import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, FlagTriangleRight, MapPin, Clock, NotebookText, Share2, Map as MapIcon } from 'lucide-react';
import { MarkerPopup, useMarkerContext } from '@/ui/map';
import { ToggleIconButton } from '@/ui/toggle-icon-button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { CheckIcon } from '@/ui/icons';
import { updatePlaceMutation } from '@/queries/places';
import { PlaceNavigationRow } from '@/components/place-navigation-row';
import { NotesViewer } from '@/components/notes-viewer';
import { BRAND_COLOR, FAVORITE_COLOR } from '@/constants/map-defaults';

export const PlacePopup = ({ place, autoOpen }) => {
    const queryClient = useQueryClient();
    const { marker } = useMarkerContext();
    const [copied, setCopied] = useState(false);
    const $autoOpened = useRef(false);

    const mutation = useMutation(
        updatePlaceMutation({
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ['places'] }),
        }),
    );

    const toggleFavorite = () => mutation.mutate({ id: place.id, is_favorite: !place.is_favorite });
    const toggleBeacon = () => mutation.mutate({ id: place.id, is_beacon: !place.is_beacon });

    useEffect(() => {
        if (!autoOpen || $autoOpened.current) return;
        $autoOpened.current = true;
        marker.togglePopup();
    }, [autoOpen, marker]);

    const handleShare = async () => {
        const url = `${window.location.origin}/?place=${place.id}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleOpenInMaps = () => {
        const url = new URL('https://www.google.com/maps/search/');
        url.searchParams.set('api', '1');
        url.searchParams.set('query', `${place.lat},${place.lng}`);
        window.open(url.toString(), '_blank');
    };

    return (
        <MarkerPopup closeButton offset={20} className='w-80 max-w-none'>
            <div className='flex flex-col gap-3'>
                <div className='flex min-w-0 items-start gap-2.5 pr-6'>
                    {place.category?.icon && (
                        <div
                            className='flex-center size-8 shrink-0 rounded-full text-white ring-4 ring-(--category-color)/10 [&>svg]:size-4 bg-(--category-color)'
                            style={{ '--category-color': place.category.color }}
                        >
                            <DynamicIcon icon={place.category.icon} />
                        </div>
                    )}
                    <div className='min-w-0'>
                        <p className='truncate text-sm font-semibold text-foreground'>{place.name}</p>
                        {place.category?.name && (
                            <p className='truncate text-sm text-foreground/70'>{place.category.name}</p>
                        )}
                    </div>
                </div>

                {(place.address || place.hours || place.notes) && (
                    <div className='flex flex-col gap-1.5 border-t border-border/60 pt-2.5 text-sm text-foreground/70'>
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
                            <div className='flex items-start gap-1.5'>
                                <NotebookText className='mt-0.5 size-3.5 shrink-0 text-foreground/40' />
                                <NotesViewer text={place.notes} />
                            </div>
                        )}
                    </div>
                )}

                <div className='flex flex-col gap-2 border-t border-border/60 pt-2.5'>
                    <div className='flex flex-col gap-1.5'>
                        <h3 className='text-sm font-semibold text-foreground'>Fijar ruta desde</h3>
                        <PlaceNavigationRow place={place} />
                    </div>

                    <div className='flex gap-1.5 border-t border-border/60 pt-2.5'>
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <ToggleIconButton
                                        compact
                                        active={place.is_favorite}
                                        onClick={toggleFavorite}
                                        label='Favorito'
                                        activeColor={FAVORITE_COLOR}
                                    />
                                }
                            >
                                <Star />
                            </TooltipTrigger>
                            <TooltipContent>Favorito</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <ToggleIconButton
                                        compact
                                        active={place.is_beacon}
                                        onClick={toggleBeacon}
                                        label='Beacon'
                                        activeColor={place.category?.color ?? BRAND_COLOR}
                                    />
                                }
                            >
                                <FlagTriangleRight />
                            </TooltipTrigger>
                            <TooltipContent>Beacon</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <ToggleIconButton
                                        compact
                                        active={copied}
                                        onClick={handleShare}
                                        label='Compartir'
                                        activeColor='#16a34a'
                                    />
                                }
                            >
                                {copied ? <CheckIcon /> : <Share2 />}
                            </TooltipTrigger>
                            <TooltipContent>{copied ? 'Copiado' : 'Compartir'}</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <ToggleIconButton compact onClick={handleOpenInMaps} label='Abrir en Google Maps' />
                                }
                            >
                                <MapIcon />
                            </TooltipTrigger>
                            <TooltipContent>Abrir en Google Maps</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </MarkerPopup>
    );
};
