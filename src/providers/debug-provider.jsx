import { useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';

export const DebugProvider = ({ children }) => {
    const [debug] = useSettings('debug', false);

    useEffect(() => {
        document.documentElement.classList.toggle('debug', debug);
    }, [debug]);

    return (
        <>
            {debug && (
                <div className='absolute inset-0 z-120 bg-red-300/10 pointer-events-none'>
                    <div className='absolute left-1/2 h-full w-0 border-l border-red-500 border-dashed' />
                    <div className='absolute top-1/2 w-full h-0 border-t border-red-500 border-dashed -translate-y-7' />
                </div>
            )}
            {children}
        </>
    );
};
