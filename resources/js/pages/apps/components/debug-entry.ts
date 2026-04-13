import { AlertCircle, ArrowDown, ArrowUp, Link2, Link2Off } from 'lucide-react';
import type React from 'react';

export interface DebugEntry {
    id: number;
    type: string;
    app_id: string;
    payload: Record<string, unknown>;
    timestamp: string;
}

export const EVENT_ICONS: Record<string, React.ElementType> = {
    'message.received': ArrowDown,
    'message.sent': ArrowUp,
    'channel.created': Link2,
    'channel.removed': Link2Off,
    'connection.pruned': AlertCircle,
};

export const EVENT_COLORS: Record<string, string> = {
    'message.received': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'message.sent': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'channel.created': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'channel.removed': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'connection.pruned': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};
