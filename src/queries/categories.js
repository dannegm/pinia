import { nanoid } from 'nanoid';
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
            .insert({ id: nanoid(8), name, icon, color })
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    ...opts,
});

export const updateCategoryMutation = (opts = {}) => ({
    mutationFn: async ({ id, ...fields }) => {
        const { data, error } = await supabase()
            .from('categories')
            .update(fields)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    ...opts,
});

export const deleteCategoryMutation = (opts = {}) => ({
    mutationFn: async id => {
        const { error } = await supabase().from('categories').delete().eq('id', id);
        if (error) throw error;
    },
    ...opts,
});
