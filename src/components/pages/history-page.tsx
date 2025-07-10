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
import { useSettings } from '@/contexts/settings-context';

export function HistoryPage() {
  const { tickets, updateTicket } = useTickets();
  const { ticketDisplayLimit } = useSettings();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = React.useState(1);

  const archivedTickets = React.useMemo(() => {
    return tickets.filter(t => t.isArchived).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [tickets]);
  
  const totalPages = React.useMemo(() => {
    if (ticketDisplayLimit === -1 || archivedTickets.length === 0) return 1;
    return Math.ceil(archivedTickets.length / ticketDisplayLimit);
  }, [archivedTickets.length, ticketDisplayLimit]);

  const displayTickets = React.useMemo(() => {
    if (ticketDisplayLimit === -1) {
      return archivedTickets;
    }
    const startIndex = (currentPage - 1) * ticketDisplayLimit;
    const endIndex = startIndex + ticketDisplayLimit;
    return archivedTickets.slice(startIndex, endIndex);
  }, [archivedTickets, currentPage, ticketDisplayLimit]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [currentPage, totalPages]);

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
            {displayTickets.length > 0 ? (
                displayTickets.map((ticket) => (
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
      {ticketDisplayLimit !== -1 && archivedTickets.length > ticketDisplayLimit && (
        <div className="flex w-full items-center justify-end gap-2">
            <span className="mr-auto text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </span>
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
      )}
      <TicketDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        ticket={selectedTicket}
        onSave={handleSaveTicket}
      />
    </div>
  );
}
