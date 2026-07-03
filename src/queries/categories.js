import { supabase } from '@/helpers/supabase';

export const categoriesQuery = (opts = {}) => ({
    queryKey: ['categories'],
    queryFn: async () => {
        const { data, error } = await supabase().from('categories').select('*').order('name');
        if (error) throw error;
        return data;
    },
    ...opts,
});

export const createCategoryMutation = (opts = {}) => ({
    mutationFn: async ({ name, icon, color }) => {
        const { data, error } = await supabase()
            .from('categories')
            .insert({ name, icon, color })
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    ...opts,
});
