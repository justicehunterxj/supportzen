'use client';

import * as React from 'react';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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

export function TicketPage() {
  const { tickets, addTicket, updateTicket, deleteTicket } = useTickets();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);
  const [ticketToDelete, setTicketToDelete] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleAddTicket = () => {
    setSelectedTicket(null);
    setIsDialogOpen(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
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
      updateTicket(ticketData);
      toast({
        title: "Ticket Updated",
        description: `Ticket ${ticketData.id} has been successfully updated.`,
      });
    } else {
      const {id, createdAt, ...newTicketData} = ticketData;
      addTicket(newTicketData);
      toast({
        title: "Ticket Created",
        description: `A new ticket has been successfully created.`,
      });
    }
    setSelectedTicket(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAddTicket} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Ticket
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.id}</TableCell>
                <TableCell className="max-w-sm truncate">{ticket.title}</TableCell>
                <TableCell>{ticket.category}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleDeleteClick(ticket.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TicketDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        ticket={selectedTicket}
        onSave={handleSaveTicket}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ticket.
            </AlertDialog-description>
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
