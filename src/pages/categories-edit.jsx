import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { CategoryForm } from '@/components/categories/category-form';
import { PanelHeader } from '@/components/panels/panel-header';
import { Alert, AlertDescription } from '@/ui/alert';
import { DeleteCategoryButton } from '@/components/categories/delete-category-button';
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
                queryClient.invalidateQueries({ queryKey: ['places'] });
                goBack();
            },
        }),
    );

    const deleteMutation = useMutation(
        deleteCategoryMutation({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['categories'] });
                queryClient.invalidateQueries({ queryKey: ['places'] });
                queryClient.invalidateQueries({ queryKey: ['system-places'] });
                goBack();
            },
            onError: () => setDeleteError('No se pudo eliminar la categoría.'),
        }),
    );

    if (!category) return null;

    return (
        <div className='flex h-full min-h-0 flex-col'>
            <PanelHeader title='Editar categoría' onBack={goBack} />

            {deleteError && (
                <div className='shrink-0 px-4 pt-3'>
                    <Alert variant='destructive'>
                        <AlertDescription>{deleteError}</AlertDescription>
                    </Alert>
                </div>
            )}

            <CategoryForm
                initialValues={category}
                onSubmit={values => mutation.mutate({ id: categoryId, ...values })}
                submitLabel='Guardar cambios'
                pending={mutation.isPending}
                secondaryAction={
                    <DeleteCategoryButton
                        category={category}
                        onConfirm={() => deleteMutation.mutate(categoryId)}
                        label='Eliminar'
                        className='h-10 w-full'
                    />
                }
            />
        </div>
    );
};
