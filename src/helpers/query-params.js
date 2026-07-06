import { createParser } from 'nuqs';

export const parseAsFloatWithLimits = (min, max) =>
    createParser({
        parse: value => {
            const parsed = Number.parseFloat(value);
            if (Number.isNaN(parsed)) return null;
            return Math.min(max, Math.max(min, parsed));
        },
        serialize: value => String(value),
    });
