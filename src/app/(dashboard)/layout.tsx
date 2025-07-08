'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutGrid,
  Ticket,
  Clock,
  BarChart2,
  DollarSign,
  Users,
  Settings,
  HelpCircle,
  History,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ShiftProvider } from '@/contexts/shift-context';
import { TicketProvider } from '@/contexts/ticket-context';
import { SettingsProvider, useSettings } from '@/contexts/settings-context';
import { ShiftTimer } from '@/components/shift-timer';

const SupportZenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12a9.95 9.95 0 0 0 6.5 9.24" />
      <path d="M16 16c-1.5 1.5-3.5 2-5.5 2-3.866 0-7-3.134-7-7 0-2 .5-3.5 2-5" />
      <path d="M16 16c-1.5-1.5-2-3.5-2-5.5 0-3.866 3.134-7 7-7 2 0 3.5.5 5 2" />
    </svg>
  );

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { avatarUrl } = useSettings();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutGrid },
    { href: '/tickets', label: 'Tickets', icon: Ticket },
    { href: '/shifts', label: 'Shift Management', icon: Clock },
    { href: '/history', label: 'History', icon: History },
    { href: '/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/earnings', label: 'Earnings', icon: DollarSign },
  ];
  
  const bottomMenuItems = [
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '#', label: 'Help', icon: HelpCircle },
  ];

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
            <div className="flex items-center gap-2">
                <SupportZenIcon/>
                <h1 className="text-xl font-semibold text-sidebar-foreground">SupportZen</h1>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
             {bottomMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
             <SidebarMenuItem>
                <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={avatarUrl} alt="Admin" />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-sidebar-foreground">Admin User</span>
                        <span className="text-xs text-muted-foreground">admin@supportzen.com</span>
                    </div>
                </div>
             </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
              <SidebarTrigger className="md:hidden"/>
              <div className="flex-1">
                  {/* Can add breadcrumbs or page title here */}
              </div>
              <ShiftTimer />
              <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                  <Users className="h-4 w-4" />
                  <span className="sr-only">Manage Team</span>
              </Button>
              <Avatar className="h-9 w-9 border">
                  <AvatarImage src={avatarUrl} alt="Admin" />
                  <AvatarFallback>AD</AvatarFallback>
              </Avatar>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <ShiftProvider>
        <TicketProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </TicketProvider>
      </ShiftProvider>
    </SettingsProvider>
  )
}
