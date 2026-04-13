import { Head, Link, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ToggleSwitch from '@/components/ui/toggle-switch';
import AppLayout from '@/layouts/app-layout';
import LogTable from '@/pages/apps/components/log-table';
import { dashboard } from '@/routes';
import apps from '@/routes/apps';
import type { ReverbLog } from '@/types';

interface AppLogSettings {
    id: number;
    name: string;
    key: string;
    log_info: boolean;
    log_errors: boolean;
    log_messages: boolean;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Props {
    app: AppLogSettings;
    logs: Paginated<ReverbLog>;
    filter: string | null;
}

export default function AppLogs({ app, logs }: Props) {
    const [settings, setSettings] = useState({
        log_info: app.log_info,
        log_errors: app.log_errors,
        log_messages: app.log_messages,
    });

    const updateSetting = (key: keyof typeof settings, value: boolean) => {
        const next = { ...settings, [key]: value };
        setSettings(next);
        router.patch(apps.logs.settings(app.id).url, next, {
            preserveScroll: true,
        });
    };

    const clearLogs = (type?: string) => {
        router.delete(apps.logs.destroy(app.id).url, {
            data: type ? { type } : {},
            preserveScroll: true,
        });
    };

    const allLogs = logs.data;
    const infoLogs = allLogs.filter((l) => l.type === 'info');
    const errorLogs = allLogs.filter((l) => l.type === 'error');
    const messageLogs = allLogs.filter((l) => l.type === 'message');

    return (
        <>
            <Head title={`Logs — ${app.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {app.name} — Logs
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {logs.total} total entries
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={apps.show(app.id).url}>
                            ← Debug Console
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">
                            Log Level Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-6">
                        <ToggleSwitch
                            label="Log info events"
                            checked={settings.log_info}
                            onChange={(v) => updateSetting('log_info', v)}
                        />
                        <ToggleSwitch
                            label="Log error events"
                            checked={settings.log_errors}
                            onChange={(v) => updateSetting('log_errors', v)}
                        />
                        <ToggleSwitch
                            label="Log messages"
                            checked={settings.log_messages}
                            onChange={(v) => updateSetting('log_messages', v)}
                        />
                    </CardContent>
                </Card>

                <Tabs defaultValue="all" className="flex flex-1 flex-col">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="all">
                                All ({allLogs.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="info"
                                className="text-blue-600 dark:text-blue-400"
                            >
                                Info ({infoLogs.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="errors"
                                className="text-red-600 dark:text-red-400"
                            >
                                Errors ({errorLogs.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="messages"
                                className="text-green-600 dark:text-green-400"
                            >
                                Messages ({messageLogs.length})
                            </TabsTrigger>
                        </TabsList>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => clearLogs()}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" /> Clear all logs
                        </Button>
                    </div>

                    <TabsContent value="all" className="flex-1 overflow-auto">
                        <LogTable logs={allLogs} />
                    </TabsContent>
                    <TabsContent value="info" className="flex-1 overflow-auto">
                        <LogTable logs={infoLogs} />
                    </TabsContent>
                    <TabsContent
                        value="errors"
                        className="flex-1 overflow-auto"
                    >
                        <LogTable logs={errorLogs} />
                    </TabsContent>
                    <TabsContent
                        value="messages"
                        className="flex-1 overflow-auto"
                    >
                        <div className="mb-2 flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => clearLogs('message')}
                                className="text-xs text-muted-foreground"
                            >
                                <Trash2 className="h-3 w-3" /> Clear messages
                            </Button>
                        </div>
                        <LogTable logs={messageLogs} />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

AppLogs.layout = (page: React.ReactElement) => {
    const props = page.props as Props;
    const app = props?.app;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Health Check', href: dashboard() },
                {
                    title: app?.name ?? 'App',
                    href: apps.show(app?.id ?? 0).url,
                },
                { title: 'Logs', href: apps.logs(app?.id ?? 0).url },
            ]}
        >
            {page}
        </AppLayout>
    );
};
