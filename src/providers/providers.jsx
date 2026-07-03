import { createProviders } from '@/helpers/providers';
import { QueryProvider } from './query-provider';
import { BusProvider } from './bus-provider';
import { DeviceProvider } from './device-provider';

export const Providers = createProviders([
    [QueryProvider],
    [BusProvider],
    [DeviceProvider],
]);
