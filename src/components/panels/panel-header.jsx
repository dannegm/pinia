import { cn } from '@/helpers/utils';
import { ChevronLeft, PanelLeftClose, PanelBottomClose } from 'lucide-react';

const panelHeaderButtonClass =
    'flex-center -ml-1.5 size-9 shrink-0 rounded-lg text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground [&>svg]:size-5';

export const PanelBackButton = ({ onClick }) => (
    <button
        type='button'
        onClick={onClick}
        aria-label='Regresar'
        className={panelHeaderButtonClass}
    >
        <ChevronLeft />
    </button>
);

export const PanelCollapseButton = ({ onClick }) => (
    <button
        type='button'
        onClick={onClick}
        aria-label='Colapsar panel'
        className={cn(panelHeaderButtonClass, '[&>svg]:stroke-[1.75]')}
    >
        <PanelBottomClose className='sm:hidden' />
        <PanelLeftClose className='hidden sm:block' />
    </button>
);

export const PanelHeader = ({ title, description, startSlot, endSlot }) => (
    <div className='flex shrink-0 flex-col gap-1 border-b border-border/70 px-4 pb-3 pt-0 sm:pt-4'>
        <div className='flex items-center gap-1'>
            {startSlot}
            <h2 className='flex-1 truncate text-left text-lg font-semibold text-foreground'>
                {title}
            </h2>
            {endSlot}
        </div>
        {description && <p className='text-sm text-foreground/70'>{description}</p>}
    </div>
);
