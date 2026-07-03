import { Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/ui/alert-dialog';
import { Button } from '@/ui/button';
import { cn } from '@/helpers/utils';

export const ConfirmDeleteButton = ({ onConfirm, itemLabel = 'este elemento', label, className }) => (
    <AlertDialog>
        <AlertDialogTrigger
            render={
                label ? (
                    <Button type='button' variant='destructive' aria-label='Eliminar' className={className} />
                ) : (
                    <button
                        type='button'
                        aria-label='Eliminar'
                        className={cn(
                            'flex-center size-8 shrink-0 rounded-md text-destructive transition-colors hover:bg-destructive/10 [&>svg]:size-4',
                            className,
                        )}
                    />
                )
            }
        >
            <Trash2 />
            {label}
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar {itemLabel}?</AlertDialogTitle>
                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
