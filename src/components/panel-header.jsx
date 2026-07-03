import { ChevronLeft } from 'lucide-react';

export const PanelHeader = ({ title, onBack, action }) => (
    <div className='flex items-center gap-1'>
        {onBack && (
            <button
                type='button'
                onClick={onBack}
                aria-label='Regresar'
                className='flex-center -ml-1.5 size-8 shrink-0 rounded-md text-foreground/70 transition-colors hover:bg-accent [&>svg]:size-5'
            >
                <ChevronLeft />
            </button>
        )}
        <h2 className='flex-1 truncate text-left text-base font-medium text-foreground/90'>{title}</h2>
        {action}
    </div>
);
