'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Shift } from '@/lib/types';

const shiftSchema = z.object({
  name: z.string().min(1, 'Shift name is required.'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM).'),
});

type ShiftFormValues = z.infer<typeof shiftSchema>;

interface ShiftDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  shift: Shift | null;
  onSave: (shift: Shift) => void;
  isStartingShift?: boolean;
}

export function ShiftDialog({ isOpen, setIsOpen, shift, onSave, isStartingShift = false }: ShiftDialogProps) {
  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      name: '',
      startTime: '',
    },
  });

  React.useEffect(() => {
    if (!isOpen) return;

    if (isStartingShift && shift) {
      const now = new Date();
      const defaultShiftName = format(now, "MMMM d, yyyy (EEEE) 'Shift at' h:mm a");
      const defaultStartTime = format(now, 'HH:mm');
      form.reset({
        name: defaultShiftName,
        startTime: defaultStartTime,
      });
    } else if (shift) {
      form.reset({
        name: shift.name,
        startTime: shift.startTime,
      });
    } else {
      const defaultShiftName = format(new Date(), "MMMM d, yyyy (EEEE) 'Shift'");
      form.reset({
        name: defaultShiftName,
        startTime: '',
      });
    }
  }, [shift, form, isOpen, isStartingShift]);

  const onSubmit = (data: ShiftFormValues) => {
    onSave({
      ...shift,
      ...data,
      id: shift?.id || '',
      status: shift?.status || 'Pending',
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isStartingShift ? 'Start Shift' : (shift ? 'Edit Shift' : 'Add New Shift')}</DialogTitle>
          <DialogDescription>
            {isStartingShift ? 'Confirm the details of the shift you are starting.' : (shift ? 'Update the details of the existing shift.' : 'Fill in the details for the new shift schedule.')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Morning Shift" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input placeholder="HH:MM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{isStartingShift ? 'Start Shift' : 'Save Shift'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
