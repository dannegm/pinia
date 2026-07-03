import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/tabs';
import { ScrollArea } from '@/ui/scroll-area';
import { DynamicIcon } from '@/ui/dynamic-icon';
import { LUCIDE_ICONS } from '@/constants/lucide-icons';
import { LUCIDE_LAB_ICONS } from '@/constants/lucide-lab-icons';

const LIBRARIES = [
    { value: 'lucide', label: 'Lucide', icons: LUCIDE_ICONS },
    { value: 'lucide-lab', label: 'Lucide Lab', icons: LUCIDE_LAB_ICONS },
];

const MAX_RESULTS = 120;

const matchesQuery = (icon, q) =>
    icon.name.toLowerCase().includes(q) || icon.tags.some(tag => tag.includes(q));

const IconGrid = ({ library, query, onSelect }) => {
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = q ? library.icons.filter(icon => matchesQuery(icon, q)) : library.icons;
        return filtered.slice(0, MAX_RESULTS);
    }, [library, query]);

    if (results.length === 0) {
        return <p className='p-4 text-center text-sm text-foreground/70'>Sin resultados.</p>;
    }

    return (
        <div className='grid grid-cols-6 gap-1 p-1'>
            {results.map(icon => (
                <button
                    key={icon.name}
                    type='button'
                    title={icon.name}
                    onClick={() => onSelect({ library: library.value, name: icon.name })}
                    className='flex-center size-9 rounded-md text-foreground transition-colors hover:bg-accent [&>svg]:size-4'
                >
                    <DynamicIcon icon={{ library: library.value, name: icon.name }} />
                </button>
            ))}
        </div>
    );
};

export const IconPicker = ({ value, onChange, children }) => {
    const [open, setOpen] = useState(false);
    const [library, setLibrary] = useState(value?.library ?? 'lucide');
    const [query, setQuery] = useState('');

    const handleSelect = icon => {
        onChange?.(icon);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={children} />
            <PopoverContent className='w-80 gap-2 p-2'>
                <InputGroup>
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder='Buscar ícono'
                    />
                </InputGroup>

                <Tabs value={library} onValueChange={setLibrary}>
                    <TabsList className='w-full'>
                        {LIBRARIES.map(lib => (
                            <TabsTrigger key={lib.value} value={lib.value}>
                                {lib.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {LIBRARIES.map(lib => (
                        <TabsContent key={lib.value} value={lib.value}>
                            <ScrollArea className='h-64'>
                                <IconGrid library={lib} query={query} onSelect={handleSelect} />
                            </ScrollArea>
                        </TabsContent>
                    ))}
                </Tabs>
            </PopoverContent>
        </Popover>
    );
};
