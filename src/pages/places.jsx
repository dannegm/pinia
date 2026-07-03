import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/ui/button';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { useMap } from '@/ui/map';
import { placesQuery } from '@/queries/places';

export const PlacesPage = () => {
    const navigate = useNavigate();
    const { map } = useMap();
    const { data: places = [] } = useQuery(placesQuery());

    return (
        <div className='flex h-full flex-col gap-3'>
            <div>
                <h2 className='text-base font-medium text-foreground/90'>Lugares</h2>
                <p className='text-sm text-foreground/70'>
                    {places.length === 0
                        ? 'Aún no hay lugares guardados.'
                        : `${places.length} lugar${places.length === 1 ? '' : 'es'} guardado${places.length === 1 ? '' : 's'}.`}
                </p>
            </div>

            <div className='flex-1 overflow-y-auto'>
                <div className='flex flex-col gap-2'>
                    {places.map(place => (
                        <button
                            key={place.id}
                            type='button'
                            onClick={() =>
                                map.flyTo({ center: [place.lng, place.lat], zoom: 16, duration: 800 })
                            }
                            className='flex items-center gap-2 rounded-md border border-border p-2 text-left hover:bg-accent'
                        >
                            {place.category?.icon && (
                                <div
                                    className='flex-center size-6 shrink-0 rounded-full text-white [&>svg]:size-3.5 bg-(--place-color)'
                                    style={{ '--place-color': place.category.color }}
                                >
                                    <DynamicIcon icon={place.category.icon} />
                                </div>
                            )}
                            <div>
                                <p className='text-sm text-foreground/90'>{place.name}</p>
                                {place.address && (
                                    <p className='text-xs text-foreground/70'>{place.address}</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className='sticky bottom-0'>
                <Button className='w-full' onClick={() => navigate({ to: '/places/new' })}>
                    <Plus />
                    Agregar lugar
                </Button>
            </div>
        </div>
    );
};
