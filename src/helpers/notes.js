const BADGE_LINE_PATTERN = /^(tel|wa|ig|x|tw|fb|tg|url)\s*:\s*(.+)$/i;
const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|#[\w-]+|![\w-]+)/g;
const LIST_ITEM_PATTERN = /^[-*]\s+/;

export const parseNotes = text => {
    const badges = [];
    const bodyLines = [];

    for (const rawLine of (text ?? '').split('\n')) {
        const match = rawLine.trim().match(BADGE_LINE_PATTERN);
        if (match) {
            badges.push({ kind: match[1].toLowerCase(), value: match[2].trim() });
        } else {
            bodyLines.push(rawLine);
        }
    }

    return { badges, body: bodyLines.join('\n').trim() };
};

export const parseInline = line =>
    line
        .split(INLINE_PATTERN)
        .filter(Boolean)
        .map(part => {
            if (part.startsWith('**')) return { type: 'bold', value: part.slice(2, -2) };
            if (part.startsWith('*')) return { type: 'italic', value: part.slice(1, -1) };
            if (part.startsWith('#')) return { type: 'tag', value: part.slice(1) };
            if (part.startsWith('!')) return { type: 'command', value: part.slice(1) };
            return { type: 'text', value: part };
        });

export const parseNoteBlocks = body =>
    body.split('\n').reduce((blocks, rawLine) => {
        const line = rawLine.trim();

        if (LIST_ITEM_PATTERN.test(line)) {
            const segments = parseInline(line.replace(LIST_ITEM_PATTERN, ''));
            const last = blocks[blocks.length - 1];
            if (last?.type === 'list') last.items.push(segments);
            else blocks.push({ type: 'list', items: [segments] });
            return blocks;
        }

        if (line === '') {
            blocks.push({ type: 'break' });
            return blocks;
        }

        blocks.push({ type: 'paragraph', segments: parseInline(rawLine) });
        return blocks;
    }, []);
