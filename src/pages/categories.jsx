import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/ui/button';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { categoriesQuery } from '@/queries/categories';

export const CategoriesPage = () => {
    const navigate = useNavigate();
    const { data: categories = [] } = useQuery(categoriesQuery());

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
                            <span className='text-sm text-foreground/90'>{category.name}</span>
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
