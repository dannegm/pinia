import { cn } from '@/helpers/utils';

export const PanelFooter = ({ className, children }) => (
    <div
        className={cn(
            'flex shrink-0 flex-col gap-2 border-t border-border/70 px-4 py-2 shadow-[0_-4px_6px_-2px_var(--tw-shadow-color)] shadow-black/10 sm:py-3 sm:shadow-none',
            className,
        )}
    >
        {children}
    </div>
);
