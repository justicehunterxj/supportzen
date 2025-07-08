'use client';

import * as React from 'react';
import { Ticket as TicketIcon, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { mockTickets } from '@/lib/mock-data';
import type { Ticket } from '@/lib/types';

export default function DashboardPage() {
  const openTickets = mockTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const resolvedToday = mockTickets.filter(t => t.status === 'Resolved' && new Date(t.createdAt).toDateString() === new Date().toDateString()).length;
  const totalTickets = mockTickets.length;
  const totalEarnings = (mockTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length * 1.33).toFixed(2);

  const stats = [
    { title: 'Open Tickets', value: openTickets.toString(), icon: TicketIcon, change: '+5 this week', changeType: 'increase' as const },
    { title: 'Resolved Today', value: resolvedToday.toString(), icon: CheckCircle, change: '-2 from yesterday', changeType: 'decrease' as const },
    { title: 'Avg. Response Time', value: '1.2h', icon: Clock, change: '10% faster', changeType: 'increase' as const },
    { title: 'Total Earnings', value: `$${totalEarnings}`, icon: DollarSign, change: '+12% this month', changeType: 'increase' as const },
  ];
  
  const recentTickets = mockTickets.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>A quick look at the latest support tickets.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTickets.map((ticket: Ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell className="max-w-xs truncate">{ticket.title}</TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
