import { useQuery } from '@tanstack/react-query';
import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { categoriesQuery } from '@/queries/categories';
import { cn } from '@/helpers/utils';

export const useCategoryFilter = () =>
    useQueryState('categories', parseAsArrayOf(parseAsString).withDefault([]));

export const CategoryFilterChips = ({ selected, onToggle }) => {
    const { data: categories = [] } = useQuery(categoriesQuery());

    if (categories.length === 0) return null;

    return (
        <div className='flex gap-1.5 overflow-x-auto pb-1'>
            {categories.map(category => {
                const active = selected.includes(category.id);
                return (
                    <button
                        key={category.id}
                        type='button'
                        onClick={() => onToggle(category.id)}
                        aria-pressed={active}
                        className={cn(
                            'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium transition-colors [&>svg]:size-3.5',
                            active
                                ? 'border-transparent text-white bg-(--chip-color)'
                                : 'border-border text-foreground/70 hover:bg-accent',
                        )}
                        style={active ? { '--chip-color': category.color } : undefined}
                    >
                        <DynamicIcon icon={category.icon} />
                        {category.name}
                    </button>
                );
            })}
        </div>
    );
};
