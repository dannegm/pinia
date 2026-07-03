import { supabase } from '@/helpers/supabase';

export const systemPlacesQuery = (opts = {}) => ({
    queryKey: ['system-places'],
    queryFn: async () => {
        const { data, error } = await supabase().from('system_places').select('*');
        if (error) throw error;
        return data;
    },
    ...opts,
});

export const systemPlaceQuery = (key, opts = {}) => ({
    queryKey: ['system-places', key],
    queryFn: async () => {
        const { data, error } = await supabase()
            .from('system_places')
            .select('*, place:places(*)')
            .eq('key', key)
            .maybeSingle();
        if (error) throw error;
        return data;
    },
    ...opts,
});

export const setSystemPlaceMutation = (opts = {}) => ({
    mutationFn: async ({ key, placeId }) => {
        const { data, error } = await supabase()
            .from('system_places')
            .upsert({ key, place_id: placeId })
            .select('*, place:places(*)')
            .single();
        if (error) throw error;
        return data;
    },
    ...opts,
});
