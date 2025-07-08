'use client';

import * as React from 'react';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { ShiftStatusBadge } from '@/components/shift-status-badge';
import { useShifts } from '@/contexts/shift-context';
import { useSettings } from '@/contexts/settings-context';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTickets } from '@/contexts/ticket-context';
import { StatusBadge } from '@/components/status-badge';
import { TicketDialog } from '@/components/ticket-dialog';

export function ShiftPage() {
  const { shifts, setShifts, addShift } = useShifts();
  const { timeFormat } = useSettings();
  const { tickets, updateTicket } = useTickets();
  const [isShiftDialogOpen, setIsShiftDialogOpen] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedShift, setSelectedShift] = React.useState<Shift | null>(null);
  const [shiftToDelete, setShiftToDelete] = React.useState<string | null>(null);
  
  const [isTicketDialogOpen, setIsTicketDialogOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);

  const { toast } = useToast();

  const handleAddShift = () => {
    setSelectedShift(null);
    setIsShiftDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setIsShiftDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setShiftToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (shiftToDelete) {
      setShifts(shifts.filter(s => s.id !== shiftToDelete));
      toast({
        title: "Shift Deleted",
        description: "The shift has been successfully deleted.",
      });
      setShiftToDelete(null);
    }
    setIsAlertOpen(false);
  };

  const handleSaveShift = (shiftData: Shift) => {
    if (selectedShift) {
      setShifts(shifts.map(s => (s.id === shiftData.id ? shiftData : s)));
      toast({
        title: "Shift Updated",
        description: "The shift has been successfully updated.",
      });
    } else {
      const { id, status, ...newShiftData } = shiftData;
      addShift(newShiftData);
      toast({
        title: "Shift Created",
        description: "The new shift has been successfully created.",
      });
    }
    setSelectedShift(null);
  };
  
  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketDialogOpen(true);
  };

  const handleSaveTicket = (ticketData: Ticket) => {
    updateTicket(ticketData);
    toast({
      title: "Ticket Updated",
      description: `Ticket ${ticketData.id} has been successfully updated.`,
    });
    setSelectedTicket(null);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return format(date, timeFormat === '12h' ? 'h:mm a' : 'HH:mm');
  }

  const formatDate = (date: Date | undefined) => {
      if (!date) return '';
      const d = new Date(date);
      const timePart = format(d, timeFormat === '12h' ? 'h:mm a' : 'HH:mm');
      return `${format(d, 'MMM d, yyyy')} at ${timePart}`;
  }

  const completedShifts = shifts.filter(s => s.status === 'Completed').sort((a,b) => (b.endedAt?.getTime() || 0) - (a.endedAt?.getTime() || 0));
  
  const activeShift = shifts.find(s => s.status === 'Active');
  const nextPendingShift = shifts.find(s => s.status === 'Pending');

  const otherShifts = activeShift ? [activeShift] : (nextPendingShift ? [nextPendingShift] : []);


  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAddShift} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Shift
        </Button>
      </div>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        {completedShifts.map((shift) => {
          const shiftTickets = tickets.filter(ticket => ticket.shiftId === shift.id);
          return (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm" key={shift.id}>
              <AccordionItem value={shift.id} className="border-b-0">
                <AccordionTrigger className="p-6 hover:no-underline">
                    <div className="flex justify-between w-full items-center">
                      <div className="flex flex-col text-left">
                          <span className="font-semibold">{shift.name}</span>
                          <span className="text-sm text-muted-foreground">
                              {formatDate(shift.startedAt)} - {formatDate(shift.endedAt)}
                          </span>
                      </div>
                      <div className="flex items-center gap-4">
                          <ShiftStatusBadge status={shift.status} />
                          <span className="text-sm font-medium">{shiftTickets.length} ticket(s)</span>
                      </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="rounded-md border">
                    {shiftTickets.length > 0 ? (
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
                              {shiftTickets.map((ticket) => (
                                  <TableRow key={ticket.id}>
                                      <TableCell>{ticket.id}</TableCell>
                                      <TableCell className="max-w-xs truncate">{ticket.title}</TableCell>
                                      <TableCell>{Array.isArray(ticket.category) ? ticket.category.join(', ') : ticket.category}</TableCell>
                                      <TableCell><StatusBadge status={ticket.status} /></TableCell>
                                      <TableCell className="text-right">
                                          <Button variant="ghost" size="icon" onClick={() => handleEditTicket(ticket)}>
                                              <Edit className="h-4 w-4" />
                                              <span className="sr-only">Edit Ticket</span>
                                          </Button>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No tickets were worked on during this shift.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </div>
          )
        })}
      </Accordion>
      
      {otherShifts.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Active Shift</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Scheduled Start</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {otherShifts.map((shift) => (
                    <TableRow key={shift.id}>
                        <TableCell className="font-medium">{shift.name}</TableCell>
                        <TableCell>{formatTime(shift.startTime)}</TableCell>
                        <TableCell>
                        <ShiftStatusBadge status={shift.status} />
                        </TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditShift(shift)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(shift.id)} className="text-red-600">
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
            </CardContent>
        </Card>
      )}


      <ShiftDialog
        isOpen={isShiftDialogOpen}
        setIsOpen={setIsShiftDialogOpen}
        shift={selectedShift}
        onSave={handleSaveShift}
      />
      <TicketDialog
        isOpen={isTicketDialogOpen}
        setIsOpen={setIsTicketDialogOpen}
        ticket={selectedTicket}
        onSave={handleSaveTicket}
      />
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shift.
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
