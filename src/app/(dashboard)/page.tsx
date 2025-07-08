'use client';

import * as React from 'react';
import { Ticket as TicketIcon, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import type { Ticket } from '@/lib/types';
import { useTickets } from '@/contexts/ticket-context';
import { useSettings } from '@/contexts/settings-context';

export default function DashboardPage() {
  const { tickets } = useTickets();
  const { ticketDisplayLimit } = useSettings();

  const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const resolvedToday = tickets.filter(t => t.status === 'Resolved' && new Date(t.createdAt).toDateString() === new Date().toDateString()).length;
  const totalTickets = tickets.length;
  const totalEarnings = (tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length * 1.33).toFixed(2);

  const stats = [
    { 
      title: 'Open Tickets', 
      value: openTickets.toString(), 
      icon: TicketIcon, 
      ...(totalTickets > 0 && { change: '+5 this week', changeType: 'increase' as const })
    },
    { 
      title: 'Resolved Today', 
      value: resolvedToday.toString(), 
      icon: CheckCircle, 
      ...(totalTickets > 0 && { change: '-2 from yesterday', changeType: 'decrease' as const })
    },
    { 
      title: 'Avg. Response Time', 
      value: totalTickets > 0 ? '1.2h' : '0h', 
      icon: Clock, 
      ...(totalTickets > 0 && { change: '10% faster', changeType: 'increase' as const })
    },
    { 
      title: 'Total Earnings', 
      value: `$${totalEarnings}`, 
      icon: DollarSign, 
      ...(totalTickets > 0 && { change: '+12% this month', changeType: 'increase' as const })
    },
  ];
  
  const recentTickets = ticketDisplayLimit === -1 ? tickets : tickets.slice(0, ticketDisplayLimit);

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
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTickets.length > 0 ? (
                recentTickets.map((ticket: Ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell className="max-w-xs truncate">{ticket.title}</TableCell>
                    <TableCell>{Array.isArray(ticket.category) ? ticket.category.join(', ') : ticket.category}</TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No recent tickets.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
