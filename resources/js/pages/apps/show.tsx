import { Head, Link, router } from '@inertiajs/react';
import Echo from 'laravel-echo';
import { FileText, Ghost, Radio, Zap } from 'lucide-react';
import Pusher from 'pusher-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import AppInfoTab from './components/app-info-tab';
import DebugControls from './components/debug-controls';
import type { DebugEntry } from './components/debug-entry';
import EventCreatorCard from './components/event-creator-card';
import EventLogEntry from './components/event-log-entry';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import apps from '@/routes/apps';
import type { ReverbAppDetail } from '@/types';


interface Props {
    app: ReverbAppDetail;
}

let _id = 0;

export default function AppShow({ app }: Props) {
    const [events, setEvents] = useState<DebugEntry[]>([]);
    const [paused, setPaused] = useState(false);
    const [search, setSearch] = useState('');
    const [channel, setChannel] = useState('');
    const [eventName, setEventName] = useState('');
    const [data, setData] = useState('');
    const [sending, setSending] = useState(false);
    const pausedRef = useRef(false);
    pausedRef.current = paused;

    // Per-app Echo instance — connects using the selected app's credentials
    const echoInstance = useMemo(
        () =>
            new Echo({
                broadcaster: 'reverb',
                key: app.key,
                wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
                wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
                wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
                forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
                enabledTransports: ['ws', 'wss'],
                authEndpoint: `/apps/${app.id}/broadcasting/auth`,
                auth: {
                    headers: {
                        'X-XSRF-TOKEN': decodeURIComponent(
                            document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                        ),
                    },
                },
                Pusher,
            }),
        [app.id, app.key],
    );

    // Subscribe to the admin debug channel for this app
    useEffect(() => {
        const ch = echoInstance.private(`reverb-admin-debug.${app.id}`);

        ch.listen('.debug.event', (raw: unknown) => {
            if (pausedRef.current) {

                return;
            }

            const e = raw as DebugEntry;
            setEvents((prev) => [{ ...e, id: ++_id }, ...prev].slice(0, 500));
        });

        return () => {
            echoInstance.leave(`reverb-admin-debug.${app.id}`);
            echoInstance.disconnect();
        };
    }, [echoInstance, app.id]);

    const clearEvents = useCallback(() => setEvents([]), []);

    const filteredEvents = search
        ? events.filter(
              (e) =>
                  e.type.includes(search) ||
                  JSON.stringify(e.payload).toLowerCase().includes(search.toLowerCase()),
          )
        : events;

    const sendEvent = () => {
        setSending(true);
        router.post(
            apps.debug(app.id).url,
            { channel, event: eventName, data },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setSending(false),
            },
        );
    };

    return (
        <>
            <Head title={`Debug — ${app.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{app.name}</h1>
                        <p className="font-mono text-sm text-muted-foreground">
                            key: <span className="text-foreground">{app.key}</span>
                            &nbsp;·&nbsp;app_id:{' '}
                            <span className="text-foreground">{app.id}</span>
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={apps.logs(app.id).url}>
                            <FileText className="h-4 w-4" /> Logs
                        </Link>
                    </Button>
                </div>

                <Tabs defaultValue="console" className="flex flex-1 flex-col">
                    <TabsList className="w-fit">
                        <TabsTrigger value="console">
                            <Radio className="h-4 w-4" /> Debug Console
                        </TabsTrigger>
                        <TabsTrigger value="info">
                            <Zap className="h-4 w-4" /> App Info
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="console" className="flex flex-1 flex-col gap-4">
                        <EventCreatorCard
                            channel={channel}
                            eventName={eventName}
                            data={data}
                            sending={sending}
                            onChannelChange={setChannel}
                            onEventNameChange={setEventName}
                            onDataChange={setData}
                            onSend={sendEvent}
                        />

                        <DebugControls
                            paused={paused}
                            search={search}
                            onTogglePause={() => setPaused((p) => !p)}
                            onClear={clearEvents}
                            onSearchChange={setSearch}
                        />

                        <div className="flex flex-1 flex-col gap-1 overflow-auto rounded-xl border bg-muted/30 p-3">
                            {filteredEvents.length === 0 ? (
                                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                                    <Ghost className="h-12 w-12 opacity-40" />
                                    <p className="font-medium">Waiting for new events</p>
                                    <p className="text-sm">
                                        Events from{' '}
                                        <span className="font-mono">{app.key}</span> will
                                        appear here in real time.
                                    </p>
                                </div>
                            ) : (
                                filteredEvents.map((e) => (
                                    <EventLogEntry key={e.id} entry={e} />
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="info">
                        <AppInfoTab app={app} />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

AppShow.layout = (page: React.ReactElement) => {
    const props = page.props as Props;
    const app = props?.app;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Health Check', href: dashboard() },
                { title: app?.name ?? 'App', href: apps.show(app?.id ?? 0).url },
            ]}
        >
            {page}
        </AppLayout>
    );
};
