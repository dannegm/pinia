import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/ui/button';
import { Alert, AlertDescription } from '@/ui/alert';
import { ConfirmDeleteButton } from '@/ui/confirm-delete-button';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { categoriesQuery, deleteCategoryMutation } from '@/queries/categories';

export const CategoriesPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState(null);
    const { data: categories = [] } = useQuery(categoriesQuery());

    const deleteMutation = useMutation(
        deleteCategoryMutation({
            onSuccess: () => {
                setError(null);
                queryClient.invalidateQueries({ queryKey: ['categories'] });
            },
            onError: err => {
                setError(
                    err.code === '23503'
                        ? 'No se puede eliminar: hay lugares usando esta categoría.'
                        : 'No se pudo eliminar la categoría.',
                );
            },
        }),
    );

    return (
        <div className='flex h-full flex-col gap-3'>
            <div>
                <h2 className='text-base font-medium text-foreground/90'>Categorías</h2>
                <p className='text-sm text-foreground/70'>
                    {categories.length === 0
                        ? 'Aún no hay categorías.'
                        : `${categories.length} categoría${categories.length === 1 ? '' : 's'}.`}
                </p>
            </div>

            {error && (
                <Alert variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className='flex-1 overflow-y-auto'>
                <div className='flex flex-col gap-2'>
                    {categories.map(category => (
                        <div
                            key={category.id}
                            className='flex items-center gap-2 rounded-md border border-border p-2'
                        >
                            <div
                                className='flex-center size-6 shrink-0 rounded-full text-white [&>svg]:size-3.5 bg-(--category-color)'
                                style={{ '--category-color': category.color }}
                            >
                                <DynamicIcon icon={category.icon} />
                            </div>
                            <span className='flex-1 text-sm text-foreground/90'>{category.name}</span>
                            <button
                                type='button'
                                aria-label='Editar'
                                onClick={() =>
                                    navigate({
                                        to: '/categories/$categoryId/edit',
                                        params: { categoryId: category.id },
                                    })
                                }
                                className='flex-center size-8 shrink-0 rounded-md text-foreground/70 transition-colors hover:bg-accent [&>svg]:size-4'
                            >
                                <Pencil />
                            </button>
                            <ConfirmDeleteButton
                                itemLabel={`"${category.name}"`}
                                onConfirm={() => deleteMutation.mutate(category.id)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className='sticky bottom-0'>
                <Button className='w-full' onClick={() => navigate({ to: '/categories/new' })}>
                    <Plus />
                    Agregar categoría
                </Button>
            </div>
        </div>
    );
};
