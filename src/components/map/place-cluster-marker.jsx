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
        <div
            className={cn(
                'flex-center size-16 rounded-full border-2 border-white text-white shadow-md shadow-black/50 bg-(image:--cluster-gradient)',
                { 'opacity-15': dimmed },
            )}
            style={{ '--cluster-gradient': buildGradient(colors) }}
        >
            <div className='grid grid-cols-2 gap-0.5 p-1'>
                {visiblePlaces.map(place => (
                    <div key={place.id} className='flex-center [&>svg]:size-5'>
                        {place.category?.icon && <DynamicIcon icon={place.category.icon} />}
                    </div>
                ))}
            </div>
        </div>
    );
};
