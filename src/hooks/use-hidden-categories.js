import { useSettings } from '@/hooks/use-settings';

export const useHiddenCategories = () => {
    const [hiddenCategoryIds, setHiddenCategoryIds] = useSettings('hiddenCategories', []);

    const toggleCategory = id =>
        setHiddenCategoryIds(current =>
            current.includes(id) ? current.filter(c => c !== id) : [...current, id],
        );

    return [hiddenCategoryIds, toggleCategory];
};
