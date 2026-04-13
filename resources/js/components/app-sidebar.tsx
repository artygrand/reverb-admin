import { Link, usePage } from '@inertiajs/react';
import { Activity, BookOpen, FolderGit2, LayoutGrid, Radio } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard, pulse } from '@/routes';
import apps from '@/routes/apps';
import type { NavItem, ReverbAppSummary, SharedProps } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Health Check',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { reverbApps } = usePage<SharedProps>().props;
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />

                {reverbApps && reverbApps.length > 0 && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Apps</SidebarGroupLabel>
                        <SidebarMenu>
                            {(reverbApps as ReverbAppSummary[]).map((app) => (
                                <SidebarMenuItem key={app.id}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentOrParentUrl(apps.show(app.id).url)}
                                        tooltip={{ children: app.name }}
                                    >
                                        <Link href={apps.show(app.id).url} prefetch>
                                            <Radio className="h-4 w-4" />
                                            <span>{app.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentOrParentUrl(pulse().url)}
                                tooltip={{ children: 'Pulse' }}
                            >
                                <Link href={pulse().url} prefetch>
                                    <Activity className="h-4 w-4" />
                                    <span>Pulse</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
