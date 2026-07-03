import { cn } from '@/helpers/utils';

export const ToggleIconButton = ({ active, onClick, label, activeClassName, children }) => (
    <button
        type='button'
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        className={cn(
            'flex-center size-8 rounded-md border border-border text-foreground/70 transition-colors hover:bg-accent [&>svg]:size-4',
            active && activeClassName,
        )}
    >
        {children}
    </button>
);
