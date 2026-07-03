import { Search, MapPin, Tag, Settings } from 'lucide-react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { cn } from '@/helpers/utils';

const PANELS = [
    { path: '/search', label: 'Buscador', icon: Search },
    { path: '/places', label: 'Lugares', icon: MapPin },
    { path: '/categories', label: 'Categorías', icon: Tag },
    { path: '/settings', label: 'Ajustes', icon: Settings },
];

export const PanelNavButtons = ({ className, buttonClassName }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const isActive = path => pathname === path || pathname.startsWith(`${path}/`);
    const toggle = path => navigate({ to: isActive(path) ? '/' : path });

    return (
        <div className={className}>
            {PANELS.map(({ path, label, icon: Icon }) => (
                <button
                    key={path}
                    type='button'
                    aria-label={label}
                    onClick={() => toggle(path)}
                    className={cn(
                        'flex-center text-foreground transition-colors hover:bg-accent [&>svg]:size-5',
                        buttonClassName,
                        { 'bg-accent': isActive(path) },
                    )}
                >
                    <Icon />
                </button>
            ))}
        </div>
    );
};
