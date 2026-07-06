import { cn } from '@/helpers/utils';

export const PinGlyph = ({ lifted, color = 'bg-rose-500', pulse = true }) => (
    <div className='relative flex flex-col items-center'>
        <div
            className={cn(
                'z-10 flex flex-col items-center transition-transform duration-150 ease-out',
                lifted && '-translate-y-3',
            )}
        >
            <div className={cn('size-5 rounded-full', color)}>
                <div className='size-1.5 rounded-full bg-white absolute right-1 top-1' />
            </div>
            <div className='h-3 w-1 bg-gray-300 rounded-b-md' />
        </div>
        {pulse && (
            <div className='animate-radar-ping absolute bottom-0 size-32 translate-y-1/2 rounded-full border-2 border-primary bg-primary/10' />
        )}
        <div className='absolute bottom-0 size-2 translate-y-1/2 rounded-full bg-foreground/40' />
    </div>
);
