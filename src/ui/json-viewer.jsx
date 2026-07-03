import ReactJson from '@microlink/react-json-view';
import { ScrollArea } from '@/ui/scroll-area';
import { cn } from '@/helpers/utils';

export const JsonViewer = ({ src, className, ...props }) => (
    <ScrollArea className={cn('rounded-md border text-xs', className)}>
        <ReactJson
            src={src}
            theme='ocean'
            style={{ padding: '0.75rem', background: 'transparent' }}
            {...props}
        />
    </ScrollArea>
);
