import { useNavigate } from '@tanstack/react-router';
import { parseNotes, parseNoteBlocks } from '@/helpers/notes';
import { NoteBadge } from '@/components/note-badge';

const InlineSegment = ({ segment, onTagClick }) => {
    if (segment.type === 'bold') return <strong className='font-semibold text-foreground'>{segment.value}</strong>;
    if (segment.type === 'italic') return <em>{segment.value}</em>;
    if (segment.type === 'tag') {
        return (
            <button
                type='button'
                onClick={() => onTagClick(segment.value)}
                className='rounded-md bg-primary/10 px-1 py-0.5 text-primary hover:bg-primary/20'
            >
                #{segment.value}
            </button>
        );
    }
    if (segment.type === 'command') {
        return <span className='rounded-md bg-accent px-1 py-0.5 text-accent-foreground'>!{segment.value}</span>;
    }
    return segment.value;
};

export const NotesViewer = ({ text }) => {
    const navigate = useNavigate();
    const handleTagClick = tag => navigate({ to: '/places', search: { q: `#${tag}` } });

    if (!text?.trim()) return null;

    const { badges, body } = parseNotes(text);
    const blocks = body ? parseNoteBlocks(body) : [];

    return (
        <div className='flex flex-col gap-2'>
            {badges.length > 0 && (
                <div className='flex flex-wrap gap-1.5'>
                    {badges.map((badge, i) => (
                        <NoteBadge key={`${badge.kind}-${i}`} kind={badge.kind} value={badge.value} />
                    ))}
                </div>
            )}

            {blocks.length > 0 && (
                <div className='flex flex-col gap-1'>
                    {blocks.map((block, i) => {
                        if (block.type === 'break') return <div key={i} className='h-1' />;

                        if (block.type === 'list') {
                            return (
                                <ul key={i} className='list-disc space-y-0.5 pl-4'>
                                    {block.items.map((segments, j) => (
                                        <li key={j}>
                                            {segments.map((segment, k) => (
                                                <InlineSegment key={k} segment={segment} onTagClick={handleTagClick} />
                                            ))}
                                        </li>
                                    ))}
                                </ul>
                            );
                        }

                        return (
                            <p key={i}>
                                {block.segments.map((segment, k) => (
                                    <InlineSegment key={k} segment={segment} onTagClick={handleTagClick} />
                                ))}
                            </p>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
