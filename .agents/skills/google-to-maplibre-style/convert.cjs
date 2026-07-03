#!/usr/bin/env node
// Rebuilds src/constants/map-style.json from scratch every run:
// pristine base (map-style-base.json) + every source in map-style-sources/,
// replayed in filename order. Never edits the output file directly — that's
// what caused drift/compounding mistakes before this skill existed.

const fs = require('fs');
const path = require('path');
const { resolveZone } = require('./mapping.cjs');

const ROOT = path.resolve(__dirname, '../../..');
const BASE_PATH = path.join(ROOT, 'src/constants/map-style-base.json');
const SOURCES_DIR = path.join(ROOT, 'src/constants/map-style-sources');
const OUTPUT_PATH = path.join(ROOT, 'src/constants/map-style.json');

// ---- HSL math (Google's relative-shift formula: positive % moves the value
// toward 100, negative % moves it toward 0) ----

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            default: h = (r - g) / d + 4;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb({ h, s, l }) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHex({ r, g, b }) {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function shiftSaturation(hex, pct) {
    const hsl = rgbToHsl(hexToRgb(hex));
    const s = pct >= 0 ? hsl.s + (100 - hsl.s) * (pct / 100) : hsl.s + hsl.s * (pct / 100);
    return rgbToHex(hslToRgb({ ...hsl, s: clamp(s, 0, 100) }));
}

function shiftLightness(hex, pct) {
    const hsl = rgbToHsl(hexToRgb(hex));
    const l = pct >= 0 ? hsl.l + (100 - hsl.l) * (pct / 100) : hsl.l + hsl.l * (pct / 100);
    return rgbToHex(hslToRgb({ ...hsl, l: clamp(l, 0, 100) }));
}

// ---- layer helpers ----

function colorPropFor(layer) {
    if (layer.type === 'background') return 'background-color';
    if (layer.type === 'fill') return 'fill-color';
    if (layer.type === 'line') return 'line-color';
    if (layer.type === 'symbol') return 'text-color';
    return null;
}

function scaleLineWidth(value, factor) {
    if (typeof value === 'number') return value * factor;
    if (value && Array.isArray(value.stops)) {
        return { ...value, stops: value.stops.map(([zoom, v]) => [zoom, v * factor]) };
    }
    return value;
}

// ---- applying one Google style rule to the style-in-progress ----

function applyRule(style, rule, report) {
    const { featureType = 'all', elementType = 'all', stylers = [] } = rule;
    const layerById = id => style.layers.find(l => l.id === id);

    if (featureType === 'all') {
        // Deliberate rule from real trial and error: a blanket "all" selector's
        // saturation/lightness would drift colors nobody asked to change
        // (e.g. a subtly blue-gray admin color turning visibly blue). Only honor
        // visibility and weight globally; skip color-affecting deltas on "all".
        for (const styler of stylers) {
            if (styler.visibility !== undefined) {
                const visibility = styler.visibility === 'off' ? 'none' : 'visible';
                for (const layer of style.layers) {
                    layer.layout = { ...(layer.layout || {}), visibility };
                }
                report.applied.push(`all/${elementType}: visibility -> ${visibility} (every layer)`);
            }
            if (styler.weight !== undefined) {
                const factor = parseFloat(styler.weight);
                for (const layer of style.layers) {
                    if (layer.paint && layer.paint['line-width'] !== undefined) {
                        layer.paint['line-width'] = scaleLineWidth(layer.paint['line-width'], factor);
                    }
                }
                report.applied.push(`all/${elementType}: line-width x${factor} (every line layer)`);
            }
            if (styler.saturation !== undefined || styler.lightness !== undefined) {
                report.skipped.push(`all/${elementType}: saturation/lightness ignored on purpose (blanket "all" color shifts drift unrelated zones — see mapping.js comment)`);
            }
        }
        if (elementType === 'labels.icon') {
            for (const layer of style.layers) {
                if (layer.type === 'symbol') {
                    delete layer.layout['icon-image'];
                    if (layer.paint) delete layer.paint['icon-color'];
                }
            }
            report.applied.push('all/labels.icon: icon-image stripped from every symbol layer');
        }
        return;
    }

    const zone = resolveZone(featureType);
    if (!zone) {
        report.skipped.push(`${featureType}/${elementType}: unknown featureType, not in mapping.js`);
        return;
    }
    if (zone.unsupported) {
        report.skipped.push(`${featureType}/${elementType}: unsupported — ${zone.reason}`);
        return;
    }

    const isLabelElement = elementType.startsWith('labels');
    const targetLayers = (isLabelElement ? zone.labelLayers : zone.geometryLayers)
        .map(layerById)
        .filter(Boolean);

    if (targetLayers.length === 0) {
        report.skipped.push(`${featureType}/${elementType}: resolved to zone "${zone.key}" but it has no ${isLabelElement ? 'label' : 'geometry'} layers in the base style`);
        return;
    }

    for (const styler of stylers) {
        if (styler.visibility !== undefined) {
            const visibility = styler.visibility === 'off' ? 'none' : 'visible'; // "simplified" has no MapLibre equivalent, treated as visible
            if (elementType === 'labels.icon') {
                for (const layer of targetLayers) {
                    if (visibility === 'none') {
                        delete layer.layout['icon-image'];
                        if (layer.paint) delete layer.paint['icon-color'];
                    }
                }
                report.applied.push(`${featureType}/labels.icon: icon-image stripped on [${targetLayers.map(l => l.id).join(', ')}]`);
            } else {
                for (const layer of targetLayers) {
                    layer.layout = { ...(layer.layout || {}), visibility };
                }
                report.applied.push(`${featureType}/${elementType}: visibility -> ${visibility} on [${targetLayers.map(l => l.id).join(', ')}]`);
            }
        }

        if (styler.color !== undefined) {
            for (const layer of targetLayers) {
                const prop = elementType === 'labels.text.stroke' ? 'text-halo-color'
                    : elementType === 'geometry.stroke' && layer.paint['fill-outline-color'] !== undefined ? 'fill-outline-color'
                    : colorPropFor(layer);
                if (prop && layer.paint) layer.paint[prop] = styler.color;
            }
            report.applied.push(`${featureType}/${elementType}: color -> ${styler.color} on [${targetLayers.map(l => l.id).join(', ')}]`);
        }

        if (styler.saturation !== undefined || styler.lightness !== undefined) {
            for (const layer of targetLayers) {
                const prop = elementType === 'labels.text.stroke' ? 'text-halo-color'
                    : elementType === 'geometry.stroke' && layer.paint['fill-outline-color'] !== undefined ? 'fill-outline-color'
                    : colorPropFor(layer);
                if (!prop || !layer.paint || typeof layer.paint[prop] !== 'string' || !layer.paint[prop].startsWith('#')) continue;
                let hex = layer.paint[prop];
                if (styler.saturation !== undefined) hex = shiftSaturation(hex, parseFloat(styler.saturation));
                if (styler.lightness !== undefined) hex = shiftLightness(hex, parseFloat(styler.lightness));
                layer.paint[prop] = hex;
            }
            report.applied.push(`${featureType}/${elementType}: saturation/lightness shift on [${targetLayers.map(l => l.id).join(', ')}]`);
        }

        if (styler.weight !== undefined) {
            const factor = parseFloat(styler.weight);
            for (const layer of targetLayers) {
                if (layer.paint && layer.paint['line-width'] !== undefined) {
                    layer.paint['line-width'] = scaleLineWidth(layer.paint['line-width'], factor);
                }
            }
            report.applied.push(`${featureType}/${elementType}: line-width x${factor} on [${targetLayers.map(l => l.id).join(', ')}]`);
        }
    }
}

// ---- main ----

function main() {
    const base = JSON.parse(fs.readFileSync(BASE_PATH, 'utf8'));
    const style = JSON.parse(JSON.stringify(base)); // deep clone, never mutate the pristine base

    const sourceFiles = fs.readdirSync(SOURCES_DIR)
        .filter(f => f.endsWith('.json'))
        .sort();

    const report = { applied: [], skipped: [] };

    for (const file of sourceFiles) {
        const rules = JSON.parse(fs.readFileSync(path.join(SOURCES_DIR, file), 'utf8'));
        report.applied.push(`--- ${file} ---`);
        for (const rule of rules) {
            if (rule._comment) continue;
            applyRule(style, rule, report);
        }
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(style, null, 2) + '\n');

    console.log(`Wrote ${OUTPUT_PATH} from ${sourceFiles.length} source file(s): ${sourceFiles.join(', ')}\n`);
    console.log(`Applied (${report.applied.length}):`);
    report.applied.forEach(line => console.log('  ' + line));
    console.log(`\nSkipped / unsupported (${report.skipped.length}):`);
    report.skipped.forEach(line => console.log('  ' + line));
}

main();
