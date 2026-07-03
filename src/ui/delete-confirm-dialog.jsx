import { useState } from 'react';
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
import { Input } from '@/ui/input';
import { cn } from '@/helpers/utils';

// Generic type-to-confirm delete dialog — `confirmWord` is usually the
// item's own name, so the person has to read it before the button unlocks.
// `children` is for entity-specific context (affected records, warnings)
// rendered between the base warning and the confirm input.
export const DeleteConfirmDialog = ({ title, confirmWord, onConfirm, label, className, children }) => {
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState('');
    const canConfirm = typed.trim() === confirmWord;

    const handleOpenChange = next => {
        setOpen(next);
        if (!next) setTyped('');
    };

    const handleConfirm = () => {
        onConfirm();
        setOpen(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
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
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                </AlertDialogHeader>

                {children}

                <div className='flex flex-col gap-1.5'>
                    <p className='text-sm text-foreground/70'>
                        Escribe{' '}
                        <span className='font-semibold text-foreground select-text'>{confirmWord}</span> para
                        borrar
                    </p>
                    <Input
                        id='delete-confirm-input'
                        aria-label={`Escribe ${confirmWord} para borrar`}
                        value={typed}
                        onChange={e => setTyped(e.target.value)}
                        autoComplete='off'
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction variant='destructive' disabled={!canConfirm} onClick={handleConfirm}>
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
