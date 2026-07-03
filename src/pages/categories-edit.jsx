import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { CategoryForm } from '@/components/category-form';
import { categoriesQuery, updateCategoryMutation } from '@/queries/categories';

export const EditCategoryPage = () => {
    const navigate = useNavigate();
    const { categoryId } = useParams({ strict: false });
    const queryClient = useQueryClient();
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

    if (!category) return null;

    return (
        <div className='flex h-full flex-col gap-3'>
            <div className='flex items-center justify-between'>
                <h2 className='text-base font-medium text-foreground/90'>Editar categoría</h2>
                <button
                    type='button'
                    aria-label='Cancelar'
                    onClick={goBack}
                    className='flex-center size-6 rounded-md hover:bg-accent [&>svg]:size-4'
                >
                    <X />
                </button>
            </div>

            <CategoryForm
                initialValues={category}
                onSubmit={values => mutation.mutate({ id: categoryId, ...values })}
                submitLabel='Guardar cambios'
                pending={mutation.isPending}
            />
        </div>
    );
};
