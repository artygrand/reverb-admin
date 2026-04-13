import { Send, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Props {
    channel: string;
    eventName: string;
    data: string;
    sending: boolean;
    onChannelChange: (value: string) => void;
    onEventNameChange: (value: string) => void;
    onDataChange: (value: string) => void;
    onSend: () => void;
}

export default function EventCreatorCard({
    channel,
    eventName,
    data,
    sending,
    onChannelChange,
    onEventNameChange,
    onDataChange,
    onSend,
}: Props) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-yellow-500" /> Event creator
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Channel</label>
                        <Input
                            placeholder="my-channel"
                            value={channel}
                            onChange={(e) => onChannelChange(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Event</label>
                        <Input
                            placeholder="my-event"
                            value={eventName}
                            onChange={(e) => onEventNameChange(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Data</label>
                    <textarea
                        className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        placeholder='{ "key": "value" } or a string'
                        value={data}
                        onChange={(e) => onDataChange(e.target.value)}
                    />
                </div>
                <Button
                    className="w-fit"
                    onClick={onSend}
                    disabled={!channel || !eventName || sending}
                >
                    <Send className="h-4 w-4" />
                    {sending ? 'Sending…' : 'Send event'}
                </Button>
            </CardContent>
        </Card>
    );
}
