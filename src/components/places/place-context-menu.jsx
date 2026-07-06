import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LocateFixed, Home, Navigation, Pencil, Star, FlagTriangleRight, Trash2 } from 'lucide-react';
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
} from '@/ui/context-menu';
import { useMap } from '@/ui/map';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useEvents } from '@/providers/bus-provider';
import { DeletePlaceButton } from '@/components/places/delete-place-button';
import { updatePlaceMutation, deletePlaceMutation } from '@/queries/places';
import { systemPlaceQuery } from '@/queries/system-places';

export const PlaceContextMenu = ({ place, children }) => {
    const navigate = useNavigate();
    const { map } = useMap();
    const { emit } = useEvents();
    const currentLocation = useGeolocation();
    const { data: casa } = useQuery(systemPlaceQuery('casa'));
    const queryClient = useQueryClient();
    const [deleteOpen, setDeleteOpen] = useState(false);

    const updateMutation = useMutation(
        updatePlaceMutation({ onSuccess: () => queryClient.invalidateQueries({ queryKey: ['places'] }) }),
    );

    const deleteMutation = useMutation(
        deletePlaceMutation({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['places'] });
                queryClient.invalidateQueries({ queryKey: ['system-places'] });
            },
        }),
    );

    const destination = { lat: place.lat, lng: place.lng, label: place.name, placeId: place.id };

    const handleCenter = () => map?.flyTo({ center: [place.lng, place.lat], zoom: 16, duration: 800 });

    const handleNavigateFromHome = () =>
        casa?.place &&
        emit('route:set', {
            origin: { lat: casa.place.lat, lng: casa.place.lng, label: 'Casa', placeId: casa.place.id },
            destination,
        });

    const handleNavigateFromLocation = () =>
        currentLocation &&
        emit('route:set', {
            origin: { lat: currentLocation.lat, lng: currentLocation.lng, label: 'Mi ubicación actual' },
            destination,
        });

    const handleEdit = () => navigate({ to: '/places/$placeId/edit', params: { placeId: place.id } });
    const toggleFavorite = () => updateMutation.mutate({ id: place.id, is_favorite: !place.is_favorite });
    const toggleBeacon = () => updateMutation.mutate({ id: place.id, is_beacon: !place.is_beacon });

    return (
        <ContextMenu>
            <ContextMenuTrigger className='contents'>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={handleCenter}>
                    <LocateFixed />
                    Centrar
                </ContextMenuItem>
                <ContextMenuItem onClick={handleNavigateFromHome} disabled={!casa?.place}>
                    <Home />
                    Navegar desde casa
                </ContextMenuItem>
                <ContextMenuItem onClick={handleNavigateFromLocation} disabled={!currentLocation}>
                    <Navigation />
                    Navegar desde mi ubicación
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem onClick={handleEdit}>
                    <Pencil />
                    Editar
                </ContextMenuItem>
                <ContextMenuItem onClick={toggleFavorite}>
                    <Star />
                    {place.is_favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                </ContextMenuItem>
                <ContextMenuItem onClick={toggleBeacon}>
                    <FlagTriangleRight />
                    {place.is_beacon ? 'Quitar beacon' : 'Activar beacon'}
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem variant='destructive' onClick={() => setDeleteOpen(true)}>
                    <Trash2 />
                    Eliminar
                </ContextMenuItem>
            </ContextMenuContent>

            <DeletePlaceButton
                place={place}
                onConfirm={() => deleteMutation.mutate(place.id)}
                trigger={false}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </ContextMenu>
    );
};
