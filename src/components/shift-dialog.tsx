'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM).'),
  assigned: z.string().min(1, 'At least one staff member must be assigned.'),
});

type ShiftFormValues = z.infer<typeof shiftSchema>;

interface ShiftDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  shift: Shift | null;
  onSave: (shift: Shift) => void;
}

export function ShiftDialog({ isOpen, setIsOpen, shift, onSave }: ShiftDialogProps) {
  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      name: '',
      startTime: '',
      endTime: '',
      assigned: '',
    },
  });

  React.useEffect(() => {
    if (shift) {
      form.reset(shift);
    } else {
      form.reset({
        name: '',
        startTime: '',
        endTime: '',
        assigned: '',
      });
    }
  }, [shift, form, isOpen]);

  const onSubmit = (data: ShiftFormValues) => {
    onSave({
      ...data,
      id: shift?.id || '',
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{shift ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
          <DialogDescription>
            {shift ? 'Update the details of the existing shift.' : 'Fill in the details for the new shift schedule.'}
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
            <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input placeholder="HH:MM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="assigned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Staff</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Alice, Bob" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Shift</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
