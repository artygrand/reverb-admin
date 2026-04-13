export type * from './auth';
export type * from './navigation';
export type * from './ui';

export type ReverbAppSummary = {
    id: number;
    name: string;
};

export type ReverbAppDetail = {
    id: number;
    name: string;
    key: string;
    secret: string;
    allowed_origins: string[];
    ping_interval: number;
    activity_timeout: number;
    max_message_size: number;
    max_connections: number | null;
    accept_client_events_from: string;
};

export type ReverbLog = {
    id: number;
    app_id: string | null;
    type: 'info' | 'error' | 'message';
    content: string;
    created_at: string;
};

export type SharedProps = {
    name: string;
    auth: { user: { id: number; name: string; email: string } | null };
    reverbApps: ReverbAppSummary[];
    sidebarOpen: boolean;
};
