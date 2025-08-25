
'use client';

import * as React from 'react';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Archive, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { TicketDialog } from '@/components/ticket-dialog';
import { ShiftDialog } from '@/components/shift-dialog';
import type { Shift, Ticket } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useTickets } from '@/contexts/ticket-context';
import { useShifts } from '@/contexts/shift-context';
import { useSettings } from '@/contexts/settings-context';
import { Checkbox } from '@/components/ui/checkbox';

export function TicketPage() {
  const { tickets, addTicket, updateTicket, deleteTicket, setTickets } = useTickets();
  const { activeShift, startNewShift } = useShifts();
  const { ticketDisplayLimit } = useSettings();
  const [isTicketDialogOpen, setIsTicketDialogOpen] = React.useState(false);
  const [isShiftDialogOpen, setIsShiftDialogOpen] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);
  const [ticketToDelete, setTicketToDelete] = React.useState<string | null>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedTicketIds, setSelectedTicketIds] = React.useState<string[]>([]);

  const activeTickets = React.useMemo(() => tickets.filter(t => !t.isArchived), [tickets]);

  const runningTicketsCount = React.useMemo(() => {
    if (!activeShift) return 0;
    return activeTickets.filter(ticket => ticket.shiftId === activeShift.id).length;
  }, [activeTickets, activeShift]);
  
  const totalPages = React.useMemo(() => {
    if (ticketDisplayLimit === -1 || activeTickets.length === 0) return 1;
    return Math.ceil(activeTickets.length / ticketDisplayLimit);
  }, [activeTickets.length, ticketDisplayLimit]);

  const displayTickets = React.useMemo(() => {
    if (ticketDisplayLimit === -1) {
      return activeTickets;
    }
    const startIndex = (currentPage - 1) * ticketDisplayLimit;
    const endIndex = startIndex + ticketDisplayLimit;
    return activeTickets.slice(startIndex, endIndex);
  }, [activeTickets, currentPage, ticketDisplayLimit]);
  
  const isAllDisplayedSelected = React.useMemo(() => {
    if(displayTickets.length === 0) return false;
    return displayTickets.every(ticket => selectedTicketIds.includes(ticket.id));
  }, [displayTickets, selectedTicketIds]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [currentPage, totalPages]);
  
  const startIndex = (currentPage - 1) * ticketDisplayLimit;
  const startRange = activeTickets.length > 0 ? startIndex + 1 : 0;
  const endRange = startIndex + displayTickets.length;
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allDisplayedIds = displayTickets.map(t => t.id);
      setSelectedTicketIds(prev => [...new Set([...prev, ...allDisplayedIds])]);
    } else {
      const allDisplayedIds = displayTickets.map(t => t.id);
      setSelectedTicketIds(prev => prev.filter(id => !allDisplayedIds.includes(id)));
    }
  }
  
  const handleSelectSingle = (ticketId: string, checked: boolean) => {
    if (checked) {
      setSelectedTicketIds(prev => [...prev, ticketId]);
    } else {
      setSelectedTicketIds(prev => prev.filter(id => id !== ticketId));
    }
  };

  const handleBulkArchive = () => {
    setTickets(currentTickets =>
      currentTickets.map(ticket =>
        selectedTicketIds.includes(ticket.id)
          ? { ...ticket, isArchived: true }
          : ticket
      )
    );
    toast({
      title: 'Tickets Archived',
      description: `${selectedTicketIds.length} tickets have been moved to History.`,
    });
    setSelectedTicketIds([]);
  };

  const handleAddTicket = () => {
    if (!activeShift) {
        setIsShiftDialogOpen(true);
    } else {
        setSelectedTicket(null);
        setIsTicketDialogOpen(true);
    }
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTicketToDelete(id);
    setIsAlertOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (ticketToDelete) {
      deleteTicket(ticketToDelete);
      toast({
        title: "Ticket Deleted",
        description: `Ticket with ID ${ticketToDelete} has been successfully deleted.`,
      });
      setTicketToDelete(null);
    }
    setIsAlertOpen(false);
  };

  const handleSaveTicket = (ticketData: Ticket) => {
    if (selectedTicket) {
      updateTicket(ticketData, activeShift?.id);
      toast({
        title: "Ticket Updated",
        description: `Ticket ${ticketData.id} has been successfully updated.`,
      });
    } else {
      addTicket(ticketData, activeShift?.id);
      toast({
        title: "Ticket Created",
        description: `A new ticket has been successfully created.`,
      });
    }
    setSelectedTicket(null);
  };
  
  const handleSaveAndStartShift = (shiftData: Shift) => {
    startNewShift({ name: shiftData.name, startTime: shiftData.startTime });
    // After starting a shift, open the ticket dialog.
    setSelectedTicket(null);
    setIsTicketDialogOpen(true);
  };

  const handleArchiveTicket = (ticketToArchive: Ticket) => {
    updateTicket({ ...ticketToArchive, isArchived: true }, activeShift?.id);
    toast({
      title: "Ticket Archived",
      description: `Ticket ${ticketToArchive.id} has been moved to History.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {activeShift && (
            <p className="text-sm text-muted-foreground">
              Tickets this shift: <span className="font-semibold text-foreground">{runningTicketsCount}</span>
            </p>
          )}
           <p className="text-sm text-muted-foreground">
            {ticketDisplayLimit === -1 
              ? `Showing all ${activeTickets.length} tickets`
              : `Showing tickets ${startRange} to ${endRange} of ${activeTickets.length}`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
           {selectedTicketIds.length > 0 && (
             <Button onClick={handleBulkArchive} variant="outline" size="sm" className="gap-2">
                <Archive className="h-4 w-4" />
                Archive Selected ({selectedTicketIds.length})
              </Button>
            )}
            <Button onClick={handleAddTicket} className="gap-2 flex-shrink-0">
              <PlusCircle className="h-4 w-4" />
              Add New Ticket
            </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllDisplayedSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayTickets.map((ticket) => (
              <TableRow key={ticket.id} data-state={selectedTicketIds.includes(ticket.id) && "selected"}>
                <TableCell>
                  <Checkbox
                    checked={selectedTicketIds.includes(ticket.id)}
                    onCheckedChange={(checked) => handleSelectSingle(ticket.id, !!checked)}
                    aria-label={`Select ticket ${ticket.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{ticket.id}</TableCell>
                <TableCell className="max-w-sm truncate">{ticket.title}</TableCell>
                <TableCell>{Array.isArray(ticket.category) ? ticket.category.join(', ') : ticket.category}</TableCell>
                <TableCell>
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
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
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchiveTicket(ticket)}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(ticket.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {displayTickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       {ticketDisplayLimit !== -1 && activeTickets.length > ticketDisplayLimit && (
        <div className="flex w-full items-center justify-end gap-2">
            <span className="mr-auto text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
            >
                <ChevronsLeft className="h-4 w-4 mr-1" />
                First
            </Button>
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
            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages}
            >
                Last
                <ChevronsRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
      )}
      <TicketDialog
        isOpen={isTicketDialogOpen}
        setIsOpen={setIsTicketDialogOpen}
        ticket={selectedTicket}
        onSave={handleSaveTicket}
      />
      <ShiftDialog
        isOpen={isShiftDialogOpen}
        setIsOpen={setIsShiftDialogOpen}
        shift={null}
        onSave={handleSaveAndStartShift}
        isStartingShift={true}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ticket.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
