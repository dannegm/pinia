import { useQuery } from '@tanstack/react-query';
import { TriangleAlert } from 'lucide-react';
import { DeleteConfirmDialog } from '@/ui/delete-confirm-dialog';
import { placesQuery } from '@/queries/places';
import { systemPlacesQuery } from '@/queries/system-places';

export const DeleteCategoryButton = ({ category, onConfirm, label, className }) => {
    const { data: places = [] } = useQuery(placesQuery());
    const { data: systemPlaces = [] } = useQuery(systemPlacesQuery());

    const categoryPlaces = places.filter(place => place.category_id === category.id);
    const systemPlaceIds = new Set(systemPlaces.map(systemPlace => systemPlace.place_id));

    return (
        <DeleteConfirmDialog
            title={`¿Eliminar "${category.name}"?`}
            confirmWord={category.name}
            onConfirm={onConfirm}
            label={label}
            className={className}
        >
            {categoryPlaces.length > 0 && (
                <div className='flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/40 p-3'>
                    <p className='text-sm text-foreground/80'>
                        Esto también borra {categoryPlaces.length}{' '}
                        {categoryPlaces.length === 1 ? 'lugar' : 'lugares'} — no hay vuelta atrás:
                    </p>
                    <ul className='flex max-h-40 list-disc list-outside flex-col gap-1 overflow-y-auto pl-5 marker:text-foreground/40'>
                        {categoryPlaces.map(place => (
                            <li key={place.id} className='text-sm text-foreground/70'>
                                <span className='inline-flex min-w-0 items-center gap-1.5 align-middle'>
                                    <span className='min-w-0 truncate select-text'>{place.name}</span>
                                    {systemPlaceIds.has(place.id) && (
                                        <span className='flex-center shrink-0 gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-sm font-medium text-amber-600'>
                                            <TriangleAlert className='size-3.5' />
                                            del sistema
                                        </span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </DeleteConfirmDialog>
    );
};
