import { supabase } from '@/helpers/supabase';

export const exportDataMutation = (opts = {}) => ({
    mutationFn: async () => {
        const [categoriesRes, placesRes, systemPlacesRes] = await Promise.all([
            supabase().from('categories').select('*'),
            supabase().from('places').select('*'),
            supabase().from('system_places').select('*'),
        ]);
        if (categoriesRes.error) throw categoriesRes.error;
        if (placesRes.error) throw placesRes.error;
        if (systemPlacesRes.error) throw systemPlacesRes.error;

        return {
            exported_at: new Date().toISOString(),
            categories: categoriesRes.data,
            places: placesRes.data,
            system_places: systemPlacesRes.data,
        };
    },
    ...opts,
});

export const importDataMutation = (opts = {}) => ({
    mutationFn: async ({ categories, places, system_places }) => {
        if (categories?.length) {
            const { error } = await supabase().from('categories').insert(categories);
            if (error) throw error;
        }
        if (places?.length) {
            const { error } = await supabase().from('places').insert(places);
            if (error) throw error;
        }
        if (system_places?.length) {
            const { error } = await supabase().from('system_places').insert(system_places);
            if (error) throw error;
        }
    },
    ...opts,
});
