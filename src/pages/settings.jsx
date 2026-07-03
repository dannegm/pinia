import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, Download, Upload } from 'lucide-react';
import { useMap } from '@/ui/map';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/ui/button';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/ui/field';
import { PanelHeader } from '@/components/panel-header';
import { PlaceSelect } from '@/components/place-select';
import { DEFAULT_VIEWPORT } from '@/constants/map-defaults';
import { systemPlaceQuery, setSystemPlaceMutation } from '@/queries/system-places';
import { exportDataMutation, importDataMutation } from '@/queries/backup';
import { cn } from '@/helpers/utils';

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
        <Field>
            <FieldLabel>Centro del mapa</FieldLabel>
            <FieldDescription>
                {center[1].toFixed(4)}, {center[0].toFixed(4)}
            </FieldDescription>
            <div className='flex gap-1.5'>
                <Button type='button' variant='outline' onClick={useCurrentCenter}>
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
        </Field>
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
        <Field>
            <FieldLabel>Casa</FieldLabel>
            <FieldDescription>Se usa como origen para "desde casa" al pedir rutas.</FieldDescription>
            <PlaceSelect
                value={casa?.place_id ?? null}
                onChange={placeId => mutation.mutate({ key: 'casa', placeId })}
            />
        </Field>
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
                link.download = `guasave-backup-${data.exported_at.slice(0, 10)}.json`;
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
        <Field>
            <FieldLabel>Respaldo</FieldLabel>
            <FieldDescription>
                Exporta todos tus lugares y categorías a un archivo, o restaura desde uno.
            </FieldDescription>
            <div className='flex gap-1.5'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => exportMutation.mutate()}
                    disabled={exportMutation.isPending}
                >
                    <Download />
                    Exportar datos
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => $fileInput.current?.click()}
                    disabled={importMutation.isPending}
                >
                    <Upload />
                    Importar datos
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
                <p
                    className={cn('text-xs', {
                        'text-destructive': status.type === 'error',
                        'text-foreground/60': status.type !== 'error',
                    })}
                >
                    {status.message}
                </p>
            )}
        </Field>
    );
};

export const SettingsPage = () => {
    return (
        <div className='flex h-full min-h-0 flex-col'>
            <PanelHeader title='Ajustes' />
            <div className='flex-1 min-h-0 overflow-y-auto p-4'>
                <FieldGroup>
                    <MapCenterSetting />
                    <HomePlaceSetting />
                    <BackupSetting />
                </FieldGroup>
            </div>
        </div>
    );
};
