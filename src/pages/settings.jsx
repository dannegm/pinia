import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, Download, Upload, MapPin, Home, DatabaseBackup, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMap } from '@/ui/map';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/ui/button';
import { Alert, AlertDescription } from '@/ui/alert';
import { PanelHeader } from '@/components/panels/panel-header';
import { PlaceSelect } from '@/components/places/place-select';
import { DEFAULT_VIEWPORT } from '@/constants/map-defaults';
import { systemPlaceQuery, setSystemPlaceMutation } from '@/queries/system-places';
import { exportDataMutation, importDataMutation } from '@/queries/backup';

const SettingSection = ({ icon: Icon, title, description, children }) => (
    <section className='flex flex-col gap-3 squircle-lg border border-border/70 bg-card p-3.5 shadow-sm shadow-black/5'>
        <div className='flex items-start gap-2.5'>
            <div className='flex-center size-8 shrink-0 rounded-full bg-primary/10 text-primary [&>svg]:size-4'>
                <Icon />
            </div>
            <div className='flex flex-col gap-0.5 pt-0.5'>
                <h3 className='text-sm font-semibold text-foreground'>{title}</h3>
                {description && <p className='text-sm text-foreground/70'>{description}</p>}
            </div>
        </div>
        {children}
    </section>
);

const MapCenterSetting = () => {
    const { map } = useMap();
    const [center, setCenter] = useSettings('mapCenter', DEFAULT_VIEWPORT.center);
    const isDefault =
        center[0] === DEFAULT_VIEWPORT.center[0] && center[1] === DEFAULT_VIEWPORT.center[1];

    const useCurrentCenter = () => {
        const { lng, lat } = map.getCenter();
        setCenter([lng, lat]);
    };

    return (
        <SettingSection
            icon={MapPin}
            title='Centro del mapa'
            description='El punto donde se abre el mapa al cargar la app.'
        >
            <div className='rounded-md bg-muted/50 px-2.5 py-2 font-mono text-sm text-foreground/80'>
                {center[1].toFixed(4)}, {center[0].toFixed(4)}
            </div>
            <div className='flex gap-1.5'>
                <Button type='button' variant='outline' onClick={useCurrentCenter} className='flex-1'>
                    Usar centro actual
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    aria-label='Revertir al centro por defecto'
                    title='Revertir al centro por defecto'
                    disabled={isDefault}
                    onClick={() => setCenter(DEFAULT_VIEWPORT.center)}
                >
                    <RotateCcw />
                </Button>
            </div>
        </SettingSection>
    );
};

const HomePlaceSetting = () => {
    const { data: casa } = useQuery(systemPlaceQuery('casa'));
    const queryClient = useQueryClient();

    const mutation = useMutation(
        setSystemPlaceMutation({
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ['system-places', 'casa'] }),
        }),
    );

    return (
        <SettingSection icon={Home} title='Casa' description='Se usa como origen para "desde casa" al pedir rutas.'>
            <PlaceSelect
                value={casa?.place_id ?? null}
                onChange={placeId => mutation.mutate({ key: 'casa', placeId })}
            />
        </SettingSection>
    );
};

const BackupSetting = () => {
    const queryClient = useQueryClient();
    const $fileInput = useRef(null);
    const [status, setStatus] = useState(null);

    const exportMutation = useMutation(
        exportDataMutation({
            onSuccess: data => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `pinia-backup-${data.exported_at.slice(0, 10)}.json`;
                link.click();
                URL.revokeObjectURL(url);
                setStatus({ type: 'success', message: 'Datos exportados.' });
            },
            onError: () => setStatus({ type: 'error', message: 'No se pudo exportar.' }),
        }),
    );

    const importMutation = useMutation(
        importDataMutation({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['categories'] });
                queryClient.invalidateQueries({ queryKey: ['places'] });
                queryClient.invalidateQueries({ queryKey: ['system-places'] });
                setStatus({ type: 'success', message: 'Datos importados.' });
            },
            onError: () =>
                setStatus({
                    type: 'error',
                    message: 'No se pudo importar. ¿El archivo coincide con el esquema actual?',
                }),
        }),
    );

    const handleImportFile = async e => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        try {
            const data = JSON.parse(await file.text());
            importMutation.mutate(data);
        } catch {
            setStatus({ type: 'error', message: 'El archivo no es un JSON válido.' });
        }
    };

    return (
        <SettingSection
            icon={DatabaseBackup}
            title='Respaldo'
            description='Exporta todos tus lugares y categorías a un archivo, o restaura desde uno.'
        >
            <div className='flex gap-1.5'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => exportMutation.mutate()}
                    disabled={exportMutation.isPending}
                    className='flex-1'
                >
                    <Download />
                    Exportar
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => $fileInput.current?.click()}
                    disabled={importMutation.isPending}
                    className='flex-1'
                >
                    <Upload />
                    Importar
                </Button>
                <input
                    ref={$fileInput}
                    type='file'
                    accept='application/json'
                    className='hidden'
                    onChange={handleImportFile}
                />
            </div>
            {status && (
                <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
                    {status.type === 'error' ? <AlertCircle /> : <CheckCircle2 />}
                    <AlertDescription>{status.message}</AlertDescription>
                </Alert>
            )}
        </SettingSection>
    );
};

export const SettingsPage = () => {
    return (
        <div className='flex h-full min-h-0 flex-col'>
            <PanelHeader title='Ajustes' description='Personaliza cómo se comporta tu mapa.' />
            <div className='flex-1 min-h-0 overflow-y-auto p-4'>
                <div className='flex flex-col gap-3'>
                    <MapCenterSetting />
                    <HomePlaceSetting />
                    <BackupSetting />
                </div>
            </div>
        </div>
    );
};
