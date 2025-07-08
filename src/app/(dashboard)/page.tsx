'use client';

import * as React from 'react';
import { Ticket as TicketIcon, CheckCircle, Clock, DollarSign, Play, Square } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { mockTickets, mockShifts } from '@/lib/mock-data';
import type { Ticket, Shift } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [shifts, setShifts] = React.useState<Shift[]>(mockShifts);
  const { toast } = useToast();

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

  const activeShift = React.useMemo(() => shifts.find(s => s.status === 'Active'), [shifts]);

  const handleStartShift = () => {
    const firstPendingShift = shifts.find(s => s.status === 'Pending');
    if (firstPendingShift) {
        setShifts(shifts.map(s => s.id === firstPendingShift.id ? { ...s, status: 'Active' } : s));
        toast({
            title: "Shift Started",
            description: `Shift "${firstPendingShift.name}" is now active.`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "No Pending Shifts",
            description: "There are no pending shifts to start.",
        });
    }
  };

  const handleEndShift = () => {
    if (activeShift) {
        const endTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        setShifts(shifts.map(s => s.id === activeShift.id ? { ...s, status: 'Completed', endTime: endTime } : s));
        toast({
            title: "Shift Ended",
            description: `Shift "${activeShift.name}" has been completed.`,
        });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shift Controls</CardTitle>
          <CardDescription>Manage your current work shift.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
            {activeShift ? (
                <div>
                    <p className="text-sm text-muted-foreground">Currently active shift:</p>
                    <p className="font-semibold">{activeShift.name}</p>
                    <p className="text-xs text-muted-foreground">Started at {activeShift.startTime}</p>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No shift is currently active.</p>
            )}
            {activeShift ? (
                <Button onClick={handleEndShift} className="gap-2">
                    <Square className="h-4 w-4" /> End Shift
                </Button>
            ) : (
                <Button onClick={handleStartShift} className="gap-2">
                    <Play className="h-4 w-4" /> Start Next Shift
                </Button>
            )}
        </CardContent>
      </Card>

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
