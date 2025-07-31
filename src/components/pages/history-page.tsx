'use client';

import * as React from 'react';
import { MoreHorizontal, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { TicketDialog } from '@/components/ticket-dialog';
import type { Ticket } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useTickets } from '@/contexts/ticket-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';
import { useMounted } from '@/hooks/use-mounted';
import { Skeleton } from '@/components/ui/skeleton';

export function HistoryPage() {
  const { tickets, updateTicket } = useTickets();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);
  const { toast } = useToast();
  const isMounted = useMounted();

  const groupedTickets = React.useMemo(() => {
    const archivedTickets = tickets.filter(t => t.isArchived);

    const groups = archivedTickets.reduce((acc, ticket) => {
      const dateKey = ticket.updatedAt ? format(new Date(ticket.updatedAt), 'yyyy-MM-dd') : 'no-date';
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(ticket);
      return acc;
    }, {} as Record<string, Ticket[]>);

    return Object.entries(groups).sort(([dateA], [dateB]) => {
      if (dateA === 'no-date') return 1;
      if (dateB === 'no-date') return -1;
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    });
  }, [tickets]);

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
  };
  
  const handleSaveTicket = (ticketData: Ticket) => {
    updateTicket(ticketData);
    toast({
      title: "Ticket Updated",
      description: `Ticket ${ticketData.id} has been successfully updated.`,
    });
    setSelectedTicket(null);
  };
  
  const formatDateForDisplay = (dateString: string) => {
    if(dateString === 'no-date') return "Unassigned Tickets";
    const date = new Date(dateString);
    // The following line is to mitigate timezone issues when formatting
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return format(date, "MMMM d, yyyy (EEEE)");
  };
  
  if (!isMounted) {
    return (
        <div className="space-y-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                <div className="flex justify-between w-full items-center">
                    <div className="flex flex-col text-left gap-2">
                        <Skeleton className="h-5 w-48" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-5 w-24" />
                    </div>
                </div>
            </div>
             <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                <div className="flex justify-between w-full items-center">
                    <div className="flex flex-col text-left gap-2">
                        <Skeleton className="h-5 w-48" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-5 w-24" />
                    </div>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {groupedTickets.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={groupedTickets[0]?.[0]}>
          {groupedTickets.map(([date, dateTickets]) => (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm" key={date}>
                <AccordionItem value={date} className="border-b-0">
                    <AccordionTrigger className="p-6 hover:no-underline">
                        <div className="flex justify-between w-full items-center">
                            <div className="flex flex-col text-left">
                                <span className="font-semibold">{formatDateForDisplay(date)}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">{dateTickets.length} ticket(s)</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {dateTickets.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                    <TableCell className="font-medium">{ticket.id}</TableCell>
                                    <TableCell className="max-w-sm truncate">{ticket.title}</TableCell>
                                    <TableCell>{Array.isArray(ticket.category) ? ticket.category.join(', ') : ticket.category}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={ticket.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditTicket(ticket)}>
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Edit Ticket</span>
                                        </Button>
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </div>
          ))}
        </Accordion>
      ) : (
        <div className="flex items-center justify-center h-24 rounded-md border">
          <p className="text-muted-foreground">No archived tickets found.</p>
        </div>
      )}

      <TicketDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        ticket={selectedTicket}
        onSave={handleSaveTicket}
        isEditingFromHistory={true}
      />
    </div>
  );
}
