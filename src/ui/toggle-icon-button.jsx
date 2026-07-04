import { cloneElement } from 'react';
import { cn } from '@/helpers/utils';

// Solid fill (not a light tint) on active, so the state reads instantly and
// doesn't rely on hue alone — matters for colorblind users. `active:scale-90`
// fires on mousedown, before React even re-renders, so a click always gets
// an immediate, color-independent response. The active fill is intentionally
// NOT overridden by `:hover` (a plain `hover:bg-accent` would out-specificity
// it and hide the toggle until the pointer left the button).
// The icon itself also gets `fill-current` when active — a shape change, not
// just a color change — applied here via cloneElement so every caller gets
// it for free instead of remembering to add it per icon.
export const ToggleIconButton = ({ active, onClick, label, text, activeColor, compact, children }) => (
    <button
        type='button'
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        style={active ? { '--toggle-color': activeColor } : undefined}
        className={cn(
            'flex-center h-8 rounded-md border text-sm font-medium transition-all duration-150 active:scale-90 [&>svg]:size-4',
            compact ? 'size-8 shrink-0' : 'flex-1 gap-1.5 px-2.5',
            active
                ? 'border-(--toggle-color) bg-(--toggle-color) text-white hover:brightness-110'
                : 'border-border text-foreground/70 hover:bg-accent hover:text-accent-foreground',
        )}
    >
        {cloneElement(children, { className: cn(children.props.className, active && 'fill-current') })}
        {!compact && text}
    </button>
);
