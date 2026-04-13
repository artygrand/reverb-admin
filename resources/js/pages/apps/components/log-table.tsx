import type { ReverbLog } from '@/types';
import { AlertCircle, FileText, Info, MessageSquare } from 'lucide-react';
import type React from 'react';

const TYPE_COLORS: Record<string, string> = {
    info: 'text-blue-600 dark:text-blue-400',
    error: 'text-red-600 dark:text-red-400',
    message: 'text-green-600 dark:text-green-400',
};

const TYPE_ICONS: Record<string, React.ElementType> = {
    info: Info,
    error: AlertCircle,
    message: MessageSquare,
};

export default function LogTable({ logs }: { logs: ReverbLog[] }) {
    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
                <FileText className="h-10 w-10 opacity-30" />
                <p>No logs found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            {logs.map((log) => {
                const Icon = TYPE_ICONS[log.type] ?? Info;
                const color = TYPE_COLORS[log.type] ?? '';

                return (
                    <div
                        key={log.id}
                        className="flex items-start gap-3 rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
                        <pre className="flex-1 overflow-auto font-mono text-xs whitespace-pre-wrap">
                            {log.content}
                        </pre>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
