'use client';

import * as React from 'react';
import { Ticket as TicketIcon, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import type { Ticket } from '@/lib/types';
import { useTickets } from '@/contexts/ticket-context';
import { useSettings } from '@/contexts/settings-context';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { tickets } = useTickets();
  const { ticketDisplayLimit } = useSettings();
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const activeTickets = React.useMemo(() => tickets.filter(t => !t.isArchived), [tickets]);

  const openTickets = activeTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const resolvedToday = activeTickets.filter(t => t.status === 'Resolved' && new Date(t.createdAt).toDateString() === new Date().toDateString()).length;
  const totalTickets = activeTickets.length;
  const totalEarnings = (tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length * 1.33).toFixed(2);

  const avgResponseTime = React.useMemo(() => {
    const resolvedAndClosedTickets = tickets.filter(
      t => (t.status === 'Resolved' || t.status === 'Closed') && t.updatedAt
    );
    
    if (resolvedAndClosedTickets.length === 0) return '0m';

    const totalResponseTimeMs = resolvedAndClosedTickets.reduce((acc, ticket) => {
      const created = new Date(ticket.createdAt).getTime();
      const updated = new Date(ticket.updatedAt).getTime();
      if (updated > created) {
        return acc + (updated - created);
      }
      return acc;
    }, 0);

    const avgResponseTimeMs = totalResponseTimeMs / resolvedAndClosedTickets.length;

    const avgHours = avgResponseTimeMs / (1000 * 60 * 60);
    if (avgHours >= 1) {
        return `${avgHours.toFixed(1)}h`;
    } else {
        const avgMinutes = avgResponseTimeMs / (1000 * 60);
        return `${Math.round(avgMinutes)}m`;
    }
  }, [tickets]);


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
      value: avgResponseTime, 
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
  
  const totalPages = React.useMemo(() => {
    if (ticketDisplayLimit === -1 || activeTickets.length === 0) return 1;
    return Math.ceil(activeTickets.length / ticketDisplayLimit);
  }, [activeTickets.length, ticketDisplayLimit]);

  const recentTickets = React.useMemo(() => {
    if (ticketDisplayLimit === -1) {
      return activeTickets;
    }
    const startIndex = (currentPage - 1) * ticketDisplayLimit;
    const endIndex = startIndex + ticketDisplayLimit;
    return activeTickets.slice(startIndex, endIndex);
  }, [activeTickets, currentPage, ticketDisplayLimit]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [currentPage, totalPages]);
  
  const startIndex = (currentPage - 1) * ticketDisplayLimit;
  const endIndex = Math.min(startIndex + ticketDisplayLimit, activeTickets.length);

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
          <CardDescription>
            {ticketDisplayLimit === -1 
              ? `Showing all ${activeTickets.length} tickets.`
              : `Showing ${recentTickets.length} of ${activeTickets.length} tickets.`
            }
          </CardDescription>
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
        {ticketDisplayLimit !== -1 && activeTickets.length > ticketDisplayLimit && (
          <CardFooter>
            <div className="flex w-full items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
