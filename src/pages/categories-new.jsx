import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/ui/field';
import { ColorPicker } from '@/ui/color-picker';
import { IconPicker } from '@/ui/icon-picker';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { createCategoryMutation } from '@/queries/categories';

export const AddCategoryPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [icon, setIcon] = useState({ library: 'lucide', name: 'MapPin' });
    const [color, setColor] = useState('#6366f1');
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

    const handleSubmit = e => {
        e.preventDefault();
        if (!name.trim()) return;
        mutation.mutate({ name: name.trim(), icon, color });
    };

    return (
        <form onSubmit={handleSubmit} className='flex h-full flex-col gap-3'>
            <div className='flex items-center justify-between'>
                <h2 className='text-base font-medium text-foreground/90'>Nueva categoría</h2>
                <button
                    type='button'
                    aria-label='Cancelar'
                    onClick={goBack}
                    className='flex-center size-6 rounded-md hover:bg-accent [&>svg]:size-4'
                >
                    <X />
                </button>
            </div>

            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor='category-name'>Nombre</FieldLabel>
                    <Input
                        id='category-name'
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder='Restaurantes'
                    />
                </Field>

                <Field orientation='horizontal'>
                    <FieldLabel>Ícono</FieldLabel>
                    <IconPicker value={icon} onChange={setIcon}>
                        <button
                            type='button'
                            aria-label='Elegir ícono'
                            className='flex-center size-8 shrink-0 rounded-md border border-border [&>svg]:size-4'
                        >
                            <DynamicIcon icon={icon} />
                        </button>
                    </IconPicker>
                </Field>

                <Field orientation='horizontal'>
                    <FieldLabel>Color</FieldLabel>
                    <ColorPicker value={color} onChange={setColor}>
                        <button
                            type='button'
                            aria-label='Elegir color'
                            className='size-8 rounded-md border border-border bg-(--category-color)'
                            style={{ '--category-color': color }}
                        />
                    </ColorPicker>
                </Field>
            </FieldGroup>

            <Button type='submit' disabled={mutation.isPending} className='mt-auto'>
                Agregar categoría
            </Button>
        </form>
    );
};
