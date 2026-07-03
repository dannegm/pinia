import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { CategoryForm } from '@/components/category-form';
import { PanelHeader } from '@/components/panel-header';
import { createCategoryMutation } from '@/queries/categories';

export const AddCategoryPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const goBack = () => navigate({ to: '/categories' });

    const mutation = useMutation(
        createCategoryMutation({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['categories'] });
                goBack();
            },
        }),
    );

    return (
        <div className='flex h-full flex-col gap-3'>
            <PanelHeader title='Nueva categoría' onBack={goBack} />

            <CategoryForm
                onSubmit={values => mutation.mutate(values)}
                submitLabel='Agregar categoría'
                pending={mutation.isPending}
            />
        </div>
    );
};
