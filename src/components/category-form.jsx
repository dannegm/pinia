import { useState } from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Switch } from '@/ui/switch';
import { Field, FieldGroup, FieldLabel, FieldContent, FieldTitle, FieldDescription } from '@/ui/field';
import { ColorPicker } from '@/ui/color-picker';
import { IconPicker } from '@/ui/icon-picker';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { BRAND_COLOR } from '@/constants/map-defaults';

const DEFAULT_ICON = { library: 'lucide', name: 'MapPin' };

export const CategoryForm = ({ initialValues, onSubmit, submitLabel, pending, secondaryAction }) => {
    const [name, setName] = useState(initialValues?.name ?? '');
    const [icon, setIcon] = useState(initialValues?.icon ?? DEFAULT_ICON);
    const [color, setColor] = useState(initialValues?.color ?? BRAND_COLOR);
    const [isVisible, setIsVisible] = useState(initialValues?.is_visible ?? true);

    const handleSubmit = e => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({ name: name.trim(), icon, color, is_visible: isVisible });
    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-1 min-h-0 flex-col'>
            <div className='flex-1 min-h-0 overflow-y-auto p-4'>
                <div className='flex flex-col items-center gap-2 pb-2'>
                    <div className='relative'>
                        <IconPicker value={icon} onChange={setIcon}>
                            <button
                                type='button'
                                aria-label='Elegir ícono'
                                className='flex-center size-20 shrink-0 rounded-full text-white shadow-md shadow-black/15 ring-8 ring-(--category-color)/15 transition-transform hover:scale-105 active:scale-95 [&>svg]:size-8 bg-(--category-color)'
                                style={{ '--category-color': color }}
                            >
                                <DynamicIcon icon={icon} />
                            </button>
                        </IconPicker>
                        <ColorPicker value={color} onChange={setColor}>
                            <button
                                type='button'
                                aria-label='Elegir color'
                                className='flex-center absolute -right-1 -bottom-1 size-8 rounded-full border-2 border-background bg-card text-foreground/70 shadow-sm shadow-black/10 transition-colors hover:text-foreground [&>svg]:size-3.5'
                            >
                                <Palette />
                            </button>
                        </ColorPicker>
                    </div>
                    <p className='text-xs text-foreground/50'>Así se verá en el mapa</p>
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
                        <FieldContent>
                            <FieldTitle>Visible en el mapa</FieldTitle>
                            <FieldDescription>
                                Al desactivar, sus lugares se ocultan de la lista y el mapa.
                            </FieldDescription>
                        </FieldContent>
                        <Switch checked={isVisible} onCheckedChange={setIsVisible} />
                    </Field>
                </FieldGroup>
            </div>

            <div className='flex shrink-0 flex-col gap-2 border-t border-border/70 px-4 py-2 sm:py-3'>
                {secondaryAction}
                <Button type='submit' disabled={pending} className='h-10 w-full'>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
};
