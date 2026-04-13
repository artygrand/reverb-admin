import { Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
    paused: boolean;
    search: string;
    onTogglePause: () => void;
    onClear: () => void;
    onSearchChange: (value: string) => void;
}

export default function DebugControls({
    paused,
    search,
    onTogglePause,
    onClear,
    onSearchChange,
}: Props) {
    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onTogglePause}>
                {paused ? (
                    <>
                        <Play className="h-4 w-4" /> Resume
                    </>
                ) : (
                    <>
                        <Pause className="h-4 w-4" /> Pause
                    </>
                )}
            </Button>
            <Button variant="outline" size="sm" onClick={onClear}>
                <Trash2 className="h-4 w-4" /> Clear
            </Button>
            <Input
                className="ml-auto max-w-xs"
                placeholder="Search events…"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    );
}
