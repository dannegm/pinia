import { nanoid } from 'nanoid';
import { supabase } from '@/helpers/supabase';

export const placesQuery = ({ includeHidden = false, ...opts } = {}) => ({
    queryKey: includeHidden ? ['places', { includeHidden }] : ['places'],
    queryFn: async () => {
        let query = supabase()
            .from('places')
            .select('*, category:categories!inner(*)')
            .eq('category.is_secret', false);
        if (!includeHidden) query = query.eq('category.is_visible', true);
        const { data, error } = await query.order('created_at', { ascending: false });
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
                id: nanoid(8),
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
