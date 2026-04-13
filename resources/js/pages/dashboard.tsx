import { Head } from '@inertiajs/react';
import { Activity, Database, Layers, Server, Zap } from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

interface Props {
    health: { redis: boolean; reverb: boolean; queue: boolean };
    stats: { apps: number };
}

function StatusBadge({ ok }: { ok: boolean }) {
    return ok ? (
        <Badge className="bg-green-500 text-white dark:bg-green-600">Healthy</Badge>
    ) : (
        <Badge variant="destructive">Down</Badge>
    );
}

function ServiceCard({ icon: Icon, title, description, ok }: {
    icon: React.ElementType; title: string; description: string; ok: boolean;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    {title}
                </CardTitle>
                <StatusBadge ok={ok} />
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ health, stats }: Props) {
    return (
        <>
            <Head title="Health Check" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Health Check</h1>
                    <p className="text-sm text-muted-foreground">Current status of your Reverb infrastructure</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <ServiceCard icon={Database} title="Redis" description="Message broker and cache backend" ok={health.redis} />
                    <ServiceCard icon={Zap} title="Reverb Server" description="WebSocket server process (reverb:start)" ok={health.reverb} />
                    <ServiceCard icon={Activity} title="Queue Worker" description="Background job processor (queue:work)" ok={health.queue} />
                </div>

                <Card className="w-fit">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Layers className="h-5 w-5 text-muted-foreground" />
                            Applications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.apps}</p>
                        <p className="text-sm text-muted-foreground">Reverb apps registered</p>
                    </CardContent>
                </Card>

                {!health.redis && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                        <Server className="mb-1 inline h-4 w-4" /> Redis is not reachable. Reverb scaling and queue workers may not function correctly.
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Health Check', href: dashboard() }],
};
