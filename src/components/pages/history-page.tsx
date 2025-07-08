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

export function HistoryPage() {
  const { tickets, updateTicket } = useTickets();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);
  const { toast } = useToast();

  const archivedTickets = React.useMemo(() => {
    return tickets.filter(t => t.isArchived).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archivedTickets.length > 0 ? (
                archivedTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell className="max-w-sm truncate">{ticket.title}</TableCell>
                    <TableCell>{Array.isArray(ticket.category) ? ticket.category.join(', ') : ticket.category}</TableCell>
                    <TableCell>
                    <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell>{new Date(ticket.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTicket(ticket)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Status
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                    No archived tickets found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TicketDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        ticket={selectedTicket}
        onSave={handleSaveTicket}
      />
    </div>
  );
}
