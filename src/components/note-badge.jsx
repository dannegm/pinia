import { Phone, Link } from 'lucide-react';
import { InstagramIcon, FacebookIcon, WhatsAppIcon, TelegramIcon, XIcon } from '@/ui/brand-icons';

const shortenUrl = value => {
    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
        const labels = new URL(withScheme).hostname.split('.');
        return labels.length <= 2 ? labels.join('.') : `${labels[0]}.${labels.slice(-2).join('.')}`;
    } catch {
        return value;
    }
};

const X_BADGE = { Icon: XIcon, color: '#000000', href: v => `https://x.com/${v.replace(/^@/, '')}` };

const BADGE_TYPES = {
    tel: { Icon: Phone, color: '#16a34a', href: v => `tel:${v.replace(/[^\d+]/g, '')}` },
    wa: { Icon: WhatsAppIcon, color: '#25d366', href: v => `https://wa.me/${v.replace(/\D/g, '')}` },
    ig: { Icon: InstagramIcon, color: '#e1306c', href: v => `https://instagram.com/${v.replace(/^@/, '')}` },
    x: X_BADGE,
    tw: X_BADGE,
    fb: { Icon: FacebookIcon, color: '#1877f2', href: v => `https://facebook.com/${v.replace(/^\//, '')}` },
    tg: { Icon: TelegramIcon, color: '#26a5e4', href: v => `https://t.me/${v.replace(/^@/, '')}` },
    url: { Icon: Link, color: '#6b7280', href: v => (/^https?:\/\//i.test(v) ? v : `https://${v}`), label: shortenUrl },
};

export const NoteBadge = ({ kind, value }) => {
    const type = BADGE_TYPES[kind];
    if (!type) return null;

    const { Icon, color, href, label } = type;
    const url = href(value);
    const isExternal = url.startsWith('http');

    return (
        <a
            href={url}
            {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
            className='flex items-center gap-1 squircle-md bg-(--badge-color)/10 px-1.5 py-0.5 text-xs font-medium text-(--badge-color) transition-colors hover:bg-(--badge-color)/15 [&>svg]:size-3'
            style={{ '--badge-color': color }}
        >
            <Icon />
            {label ? label(value) : value}
        </a>
    );
};
