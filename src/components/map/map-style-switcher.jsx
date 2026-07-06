import { Map as MapIcon, Satellite, Sun, Moon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip';
import { MAP_STYLES } from '@/constants/map-defaults';

const STYLE_ICONS = {
    Map: MapIcon,
    Satellite,
    Sun,
    Moon,
};

export const MapStyleSwitcher = ({ value, onChange }) => {
    return (
        <Tabs value={value} onValueChange={onChange} orientation='vertical'>
            <TabsList className='-mr-px h-fit w-fit flex-col gap-0.5 rounded-sm shadow-md shadow-black/10'>
                {MAP_STYLES.map(style => {
                    const Icon = STYLE_ICONS[style.icon];
                    return (
                        <Tooltip key={style.id}>
                            <TooltipTrigger
                                render={
                                    <TabsTrigger
                                        value={style.id}
                                        className='h-7 w-7 flex-none rounded-sm'
                                        aria-label={style.label}
                                    />
                                }
                            >
                                <Icon className='size-4' />
                            </TooltipTrigger>
                            <TooltipContent side='left'>{style.label}</TooltipContent>
                        </Tooltip>
                    );
                })}
            </TabsList>
        </Tabs>
    );
};
