'use client';

import * as React from 'react';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShiftDialog } from '@/components/shift-dialog';
import type { Shift } from '@/lib/types';
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

export function ShiftPage() {
  const { shifts, setShifts } = useShifts();
  const { timeFormat } = useSettings();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedShift, setSelectedShift] = React.useState<Shift | null>(null);
  const [shiftToDelete, setShiftToDelete] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleAddShift = () => {
    setSelectedShift(null);
    setIsDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setIsDialogOpen(true);
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
      const newShift = { ...shiftData, id: `SH-${shifts.length + 1}`, status: 'Pending' as const };
      setShifts([...shifts, newShift]);
      toast({
        title: "Shift Created",
        description: "The new shift has been successfully created.",
      });
    }
    setSelectedShift(null);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return format(date, timeFormat === '12h' ? 'h:mm a' : 'HH:mm');
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAddShift} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Shift
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell className="font-medium">{shift.name}</TableCell>
                <TableCell>{formatTime(shift.startTime)}</TableCell>
                <TableCell>{formatTime(shift.endTime || '')}</TableCell>
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
      </div>
      <ShiftDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        shift={selectedShift}
        onSave={handleSaveShift}
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
