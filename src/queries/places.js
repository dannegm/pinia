import { supabase } from '@/helpers/supabase';

export const placesQuery = (opts = {}) => ({
    queryKey: ['places'],
    queryFn: async () => {
        const { data, error } = await supabase()
            .from('places')
            .select('*, category:categories(*)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    ...opts,
});

export const createPlaceMutation = (opts = {}) => ({
    mutationFn: async ({ name, categoryId, address, lat, lng, hours, notes, isFavorite, isBeacon }) => {
        const { data, error } = await supabase()
            .from('places')
            .insert({
                name,
                category_id: categoryId,
                address,
                lat,
                lng,
                hours,
                notes,
                is_favorite: isFavorite ?? false,
                is_beacon: isBeacon ?? false,
            })
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

export const deletePlaceMutation = (opts = {}) => ({
    mutationFn: async id => {
        const { error } = await supabase().from('places').delete().eq('id', id);
        if (error) throw error;
    },
    ...opts,
});
