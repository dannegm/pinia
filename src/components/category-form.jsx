import { useState } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/ui/field';
import { ColorPicker } from '@/ui/color-picker';
import { IconPicker } from '@/ui/icon-picker';
import { DynamicIcon } from '@/ui/dynamic-icon';

const DEFAULT_ICON = { library: 'lucide', name: 'MapPin' };

export const CategoryForm = ({ initialValues, onSubmit, submitLabel, pending, secondaryAction }) => {
    const [name, setName] = useState(initialValues?.name ?? '');
    const [icon, setIcon] = useState(initialValues?.icon ?? DEFAULT_ICON);
    const [color, setColor] = useState(initialValues?.color ?? '#6366f1');

    const handleSubmit = e => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({ name: name.trim(), icon, color });
    };

    return (
        <form onSubmit={handleSubmit} className='flex h-full flex-col gap-3'>
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
                    <span className='spacer' />
                    <span className='text-xs text-foreground/70'>
                        {icon.library}/{icon.name}
                    </span>
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
                    <span className='spacer' />
                    <span className='text-xs text-foreground/70 uppercase'>{color}</span>
                    <ColorPicker value={color} onChange={setColor}>
                        <button
                            type='button'
                            aria-label='Elegir color'
                            className='size-8 shrink-0 rounded-md border border-border bg-(--category-color)'
                            style={{ '--category-color': color }}
                        />
                    </ColorPicker>
                </Field>
            </FieldGroup>

            <div className='mt-auto flex flex-col gap-2'>
                {secondaryAction}
                <Button type='submit' disabled={pending} className='h-10 w-full'>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
};
