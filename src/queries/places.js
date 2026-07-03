import { supabase } from '@/helpers/supabase';

export const placesQuery = (opts = {}) => ({
    queryKey: ['places'],
    queryFn: async () => {
        const { data, error } = await supabase()
            .from('places')
            .select('*, category:categories(*)')
            .order('name');
        if (error) throw error;
        return data;
    },
    ...opts,
});

export const createPlaceMutation = (opts = {}) => ({
    mutationFn: async ({ name, categoryId, address, lat, lng }) => {
        const { data, error } = await supabase()
            .from('places')
            .insert({ name, category_id: categoryId, address, lat, lng })
            .select('*, category:categories(*)')
            .single();
        if (error) throw error;
        return data;
    },
    ...opts,
});

export const updatePlaceMutation = (opts = {}) => ({
    mutationFn: async ({ id, ...fields }) => {
        const { data, error } = await supabase()
            .from('places')
            .update(fields)
            .eq('id', id)
            .select('*, category:categories(*)')
            .single();
        if (error) throw error;
        return data;
    },
    ...opts,
});
