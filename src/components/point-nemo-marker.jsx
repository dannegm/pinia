import { useState } from 'react';
import { Link2Off } from 'lucide-react';
import { MapMarker, MarkerContent, MarkerTooltip, MarkerPopup } from '@/ui/map';

export const POINT_NEMO = { lat: -(48 + 52.6 / 60), lng: -(123 + 23.6 / 60) };

const GLITCH_MESSAGES = [
    'SEÑAL PERDIDA',
    'AQUÍ NO HAY NADA',
    'TE PERDISTE EN EL OCÉANO',
    'PUNTO DE INACCESIBILIDAD',
];

const randomMessage = () => GLITCH_MESSAGES[Math.floor(Math.random() * GLITCH_MESSAGES.length)];

export const PointNemoMarker = () => {
    const [message, setMessage] = useState(randomMessage);

    return (
        <MapMarker longitude={POINT_NEMO.lng} latitude={POINT_NEMO.lat} onClick={() => setMessage(randomMessage())}>
            <MarkerContent>
                <div className='flex-center size-8 rounded-full border-2 border-white bg-black text-white shadow-md shadow-black/50 [&>svg]:size-4'>
                    <Link2Off />
                </div>
            </MarkerContent>
            <MarkerTooltip>???</MarkerTooltip>
            <MarkerPopup
                closeButton
                offset={20}
                className='w-64 max-w-none overflow-hidden border-transparent bg-black p-0 [&>button]:text-white/70 [&>button:hover]:bg-white/10 [&>button:hover]:text-white'
            >
                <div className='relative flex h-40 flex-col items-center justify-center gap-1.5 bg-scanlines'>
                    <div className='relative animate-crt-flicker'>
                        <p className='relative text-4xl font-bold tracking-widest text-white'>
                            <span
                                aria-hidden
                                className='absolute inset-0 animate-glitch text-red-500 mix-blend-screen'
                                style={{ animationDelay: '-0.15s' }}
                            >
                                404
                            </span>
                            <span
                                aria-hidden
                                className='absolute inset-0 animate-glitch text-cyan-400 mix-blend-screen'
                                style={{ animationDelay: '-0.3s' }}
                            >
                                404
                            </span>
                            <span className='relative'>404</span>
                        </p>
                    </div>
                    <p className='relative text-sm text-center tracking-[0.2em] text-white/80'>{message}</p>
                    <p className='relative text-xs text-white/40'>48°52.6′S 123°23.6′O</p>
                </div>
            </MarkerPopup>
        </MapMarker>
    );
};
