import { useQuery } from '@tanstack/react-query';
import { TriangleAlert } from 'lucide-react';
import { DeleteConfirmDialog } from '@/ui/delete-confirm-dialog';
import { systemPlacesQuery } from '@/queries/system-places';
import { SYSTEM_PLACE_LABELS } from '@/constants/system-places';

export const DeletePlaceButton = ({ place, onConfirm, label, className, trigger, open, onOpenChange }) => {
    const { data: systemPlaces = [] } = useQuery(systemPlacesQuery());
    const systemEntry = systemPlaces.find(systemPlace => systemPlace.place_id === place.id);

    return (
        <DeleteConfirmDialog
            title={`¿Eliminar "${place.name}"?`}
            confirmWord={place.name}
            onConfirm={onConfirm}
            label={label}
            className={className}
            trigger={trigger}
            open={open}
            onOpenChange={onOpenChange}
        >
            {systemEntry && (
                <div className='flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700'>
                    <TriangleAlert className='mt-0.5 size-4 shrink-0' />
                    <span className='select-text'>
                        Este lugar es tu{' '}
                        <strong>{SYSTEM_PLACE_LABELS[systemEntry.key] ?? systemEntry.key}</strong> en
                        Ajustes. Al eliminarlo tendrás que asignar otro.
                    </span>
                </div>
            )}
        </DeleteConfirmDialog>
    );
};
