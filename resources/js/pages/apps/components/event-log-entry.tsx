import { Radio } from 'lucide-react';
import type { DebugEntry } from './debug-entry';
import { EVENT_COLORS, EVENT_ICONS } from './debug-entry';

interface Props {
    entry: DebugEntry;
}

export default function EventLogEntry({ entry }: Props) {
    const Icon = EVENT_ICONS[entry.type] ?? Radio;
    const colorClass =
        EVENT_COLORS[entry.type] ??
        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';

    return (
        <details className="rounded-lg border bg-background px-3 py-2 text-sm">
            <summary className="flex cursor-pointer list-none items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className={`rounded px-1.5 py-0.5 font-mono text-xs ${colorClass}`}>
                    {entry.type}
                </span>
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-muted p-2 font-mono text-xs">
                {JSON.stringify(entry.payload, null, 2)}
            </pre>
        </details>
    );
}
