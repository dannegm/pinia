import { DynamicIcon } from '@/ui/dynamic-icon';
import { cn } from '@/helpers/utils';

const buildGradient = colors => {
    if (colors.length === 1) {
        return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 100%)`;
    }
    const stops = colors.map((color, index) => `${color} ${(index / (colors.length - 1)) * 100}%`);
    return `linear-gradient(135deg, ${stops.join(', ')})`;
};

const uniqueByCategory = places => {
    const seenCategoryIds = new Set();
    return places.filter(place => {
        const categoryId = place.category?.id ?? 'uncategorized';
        if (seenCategoryIds.has(categoryId)) return false;
        seenCategoryIds.add(categoryId);
        return true;
    });
};

export const PlaceClusterMarker = ({ places, dimmed = false }) => {
    const colors = [...new Set(places.map(place => place.category?.color ?? '#6b7280'))];
    const visiblePlaces = uniqueByCategory(places).slice(0, 4);

    return (
        <div className={cn('relative size-16 drop-shadow-md drop-shadow-black/50', { 'opacity-15': dimmed })}>
            <div className='mask-hexagon absolute inset-0 bg-white' />
            <div
                className='mask-hexagon absolute inset-0.5 flex-center text-white bg-(image:--cluster-gradient)'
                style={{ '--cluster-gradient': buildGradient(colors) }}
            >
                <div className={cn('grid gap-0.5 p-2', visiblePlaces.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
                    {visiblePlaces.map((place, index) => (
                        <div
                            key={place.id}
                            className={cn(
                                'flex-center',
                                visiblePlaces.length >= 3 ? '[&>svg]:size-4.5' : '[&>svg]:size-5',
                                { 'col-span-2': visiblePlaces.length === 3 && index === 2 },
                            )}
                        >
                            {place.category?.icon && <DynamicIcon icon={place.category.icon} />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
