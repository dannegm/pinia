import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { CategoryForm } from '@/components/category-form';
import { PanelHeader } from '@/components/panel-header';
import { Alert, AlertDescription } from '@/ui/alert';
import { ConfirmDeleteButton } from '@/ui/confirm-delete-button';
import { categoriesQuery, updateCategoryMutation, deleteCategoryMutation } from '@/queries/categories';

export const EditCategoryPage = () => {
    const navigate = useNavigate();
    const { categoryId } = useParams({ strict: false });
    const queryClient = useQueryClient();
    const [deleteError, setDeleteError] = useState(null);
    const { data: categories = [] } = useQuery(categoriesQuery());
    const category = categories.find(c => c.id === categoryId);

    const goBack = () => navigate({ to: '/categories' });

    const mutation = useMutation(
        updateCategoryMutation({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['categories'] });
                goBack();
            },
        }),
    );

    const deleteMutation = useMutation(
        deleteCategoryMutation({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['categories'] });
                goBack();
            },
            onError: err => {
                setDeleteError(
                    err.code === '23503'
                        ? 'No se puede eliminar: hay lugares usando esta categoría.'
                        : 'No se pudo eliminar la categoría.',
                );
            },
        }),
    );

    if (!category) return null;

    return (
        <div className='flex h-full flex-col gap-3'>
            <PanelHeader title='Editar categoría' onBack={goBack} />

            {deleteError && (
                <Alert variant='destructive'>
                    <AlertDescription>{deleteError}</AlertDescription>
                </Alert>
            )}

            <CategoryForm
                initialValues={category}
                onSubmit={values => mutation.mutate({ id: categoryId, ...values })}
                submitLabel='Guardar cambios'
                pending={mutation.isPending}
                secondaryAction={
                    <ConfirmDeleteButton
                        itemLabel={`"${category.name}"`}
                        onConfirm={() => deleteMutation.mutate(categoryId)}
                        label='Eliminar'
                        className='h-10 w-full'
                    />
                }
            />
        </div>
    );
};
