// One-off migration helper: takes a JSON export produced by the "Exportar
// datos" button in Ajustes (uuid ids) and rewrites every id to a nanoid(8),
// remapping every cross-reference (places.category_id, system_places.place_id)
// to match. Run with the OLD (uuid) schema data, before the column-type
// migration — the output is meant to be imported back in AFTER that migration
// has been applied, via the "Importar datos" button.
//
// Usage: node scripts/remap-ids.js <input.json> [output.json]

import { readFile, writeFile } from 'node:fs/promises';
import { nanoid } from 'nanoid';

const [, , inputPath, outputPath = inputPath.replace(/\.json$/, '.remapped.json')] = process.argv;

if (!inputPath) {
    console.error('Usage: node scripts/remap-ids.js <input.json> [output.json]');
    process.exit(1);
}

const newId = seen => {
    let id;
    do {
        id = nanoid(8);
    } while (seen.has(id));
    seen.add(id);
    return id;
};

const raw = await readFile(inputPath, 'utf-8');
const { categories = [], places = [], system_places = [] } = JSON.parse(raw);

const usedIds = new Set();
const categoryIdMap = new Map();
const placeIdMap = new Map();

const remappedCategories = categories.map(category => {
    const id = newId(usedIds);
    categoryIdMap.set(category.id, id);
    return { ...category, id };
});

const remappedPlaces = places.map(place => {
    const id = newId(usedIds);
    placeIdMap.set(place.id, id);
    return {
        ...place,
        id,
        category_id: place.category_id ? (categoryIdMap.get(place.category_id) ?? null) : null,
    };
});

const remappedSystemPlaces = system_places.map(systemPlace => ({
    ...systemPlace,
    place_id: systemPlace.place_id ? (placeIdMap.get(systemPlace.place_id) ?? null) : null,
}));

await writeFile(
    outputPath,
    JSON.stringify(
        {
            exported_at: new Date().toISOString(),
            categories: remappedCategories,
            places: remappedPlaces,
            system_places: remappedSystemPlaces,
        },
        null,
        2,
    ),
);

console.log(`Remapped ${remappedCategories.length} categories, ${remappedPlaces.length} places, ${remappedSystemPlaces.length} system_places.`);
console.log(`Written to ${outputPath}`);
