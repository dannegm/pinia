import { ChevronLeft } from 'lucide-react';

export const PanelHeader = ({ title, description, onBack, action }) => (
    <div className='flex shrink-0 flex-col gap-1 border-b border-border/70 px-4 pb-3 pt-0 sm:pt-4'>
        <div className='flex items-center gap-1'>
            {onBack && (
                <button
                    type='button'
                    onClick={onBack}
                    aria-label='Regresar'
                    className='flex-center -ml-1.5 size-9 shrink-0 rounded-lg text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground [&>svg]:size-5'
                >
                    <ChevronLeft />
                </button>
            )}
            <h2 className='flex-1 truncate text-left text-lg font-semibold text-foreground'>{title}</h2>
            {action}
        </div>
        {description && <p className='text-sm text-foreground/70'>{description}</p>}
    </div>
);
