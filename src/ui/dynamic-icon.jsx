import { icons, Icon } from 'lucide-react';
import * as lucideLab from '@lucide/lab';

export const DynamicIcon = ({ icon, ...props }) => {
    if (!icon?.name) return null;

    if (icon.library === 'lucide-lab') {
        const iconNode = lucideLab[icon.name];
        if (!iconNode) return null;
        return <Icon iconNode={iconNode} {...props} />;
    }

    const LucideIcon = icons[icon.name];
    if (!LucideIcon) return null;
    return <LucideIcon {...props} />;
};
