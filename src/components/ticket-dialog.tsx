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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Loader2 } from 'lucide-react';
import type { Ticket, TicketStatus } from '@/lib/types';
import { suggestStatus } from '@/ai/flows/suggestStatus';
import { useToast } from '@/hooks/use-toast';

const ticketSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  assigneeName: z.string().min(1, 'Assignee is required.'),
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface TicketDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  ticket: Ticket | null;
  onSave: (ticket: Ticket) => void;
}

export function TicketDialog({ isOpen, setIsOpen, ticket, onSave }: TicketDialogProps) {
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      description: '',
      assigneeName: '',
      status: 'Open',
    },
  });

  React.useEffect(() => {
    if (ticket) {
      form.reset({
        description: ticket.description,
        assigneeName: ticket.assignee.name,
        status: ticket.status,
      });
    } else {
      form.reset({
        description: '',
        assigneeName: '',
        status: 'Open',
      });
    }
  }, [ticket, form, isOpen]);

  const handleSuggestStatus = async () => {
    setIsSuggesting(true);
    try {
      const description = form.getValues('description');
      if (!description) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please enter a description before suggesting a status.",
        });
        return;
      }
      const result = await suggestStatus(description);
      form.setValue('status', result as TicketStatus, { shouldValidate: true });
      toast({
        title: "AI Suggestion",
        description: `Suggested status: ${result}`,
      });
    } catch (error) {
      console.error('Failed to suggest status:', error);
      toast({
        variant: "destructive",
        title: "AI Suggestion Failed",
        description: "Could not get a suggestion from the AI.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const onSubmit = (data: TicketFormValues) => {
    const ticketData: Ticket = {
      id: ticket?.id || '',
      description: data.description,
      assignee: {
        name: data.assigneeName,
        avatar: ticket?.assignee.avatar || `https://i.pravatar.cc/150?u=${data.assigneeName}`,
      },
      status: data.status,
      createdAt: ticket?.createdAt || new Date(),
    };
    onSave(ticketData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{ticket ? 'Edit Ticket' : 'Add New Ticket'}</DialogTitle>
          <DialogDescription>
            {ticket ? 'Update the details of the existing ticket.' : 'Fill in the details for the new support ticket.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the issue in detail..." {...field} rows={5}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assigneeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" onClick={handleSuggestStatus} disabled={isSuggesting}>
                      {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                      <span className="sr-only">Suggest Status</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Ticket</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
