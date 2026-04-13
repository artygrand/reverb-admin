import { Card, CardContent } from '@/components/ui/card';
import type { ReverbAppDetail } from '@/types';

interface Props {
    app: ReverbAppDetail;
}

export default function AppInfoTab({ app }: Props) {
    const rows: [string, string | number][] = [
        ['Name', app.name],
        ['App ID (Reverb)', app.id],
        ['Key', app.key],
        ['Secret', app.secret],
        ['Allowed Origins', (app.allowed_origins ?? []).join(', ')],
        ['Ping Interval', `${app.ping_interval}s`],
        ['Activity Timeout', `${app.activity_timeout}s`],
        ['Max Message Size', `${app.max_message_size} bytes`],
        ['Max Connections', app.max_connections ?? '∞'],
        ['Accept Client Events From', app.accept_client_events_from],
    ];

    return (
        <Card>
            <CardContent className="pt-6">
                <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    {rows.map(([label, value]) => (
                        <>
                            <dt
                                key={`dt-${label}`}
                                className="font-medium text-muted-foreground"
                            >
                                {label}
                            </dt>
                            <dd key={`dd-${label}`} className="font-mono">
                                {value}
                            </dd>
                        </>
                    ))}
                </dl>
            </CardContent>
        </Card>
    );
}
