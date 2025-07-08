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
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Loader2 } from 'lucide-react';
import type { Ticket, TicketStatus, AITool } from '@/lib/types';
import { suggestStatus } from '@/ai/flows/suggestStatus';
import { useToast } from '@/hooks/use-toast';

const aiTools: AITool[] = ['ChatGPT', 'Gemini', 'Claude', 'Copilot', 'Perplexity'];

const ticketSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  agentResponse: z.string().optional(),
  link: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
  aiToolsUsed: z.array(z.enum(aiTools)).optional(),
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
      title: '',
      description: '',
      agentResponse: '',
      link: '',
      aiToolsUsed: [],
      status: 'Open',
    },
  });

  React.useEffect(() => {
    if (ticket) {
      form.reset({
        title: ticket.title,
        description: ticket.description,
        agentResponse: ticket.agentResponse || '',
        link: ticket.link || '',
        aiToolsUsed: ticket.aiToolsUsed || [],
        status: ticket.status,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        agentResponse: '',
        link: '',
        aiToolsUsed: [],
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
      title: data.title,
      description: data.description,
      agentResponse: data.agentResponse,
      link: data.link,
      aiToolsUsed: data.aiToolsUsed,
      status: data.status,
      createdAt: ticket?.createdAt || new Date(),
    };
    onSave(ticketData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a brief title for the ticket" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the issue in detail..." {...field} rows={4}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agentResponse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Response</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the resolution or next steps..." {...field} rows={4}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/issue/123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aiToolsUsed"
              render={() => (
                <FormItem>
                    <FormLabel>AI Tools Used</FormLabel>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-2">
                    {aiTools.map((tool) => (
                      <FormField
                        key={tool}
                        control={form.control}
                        name="aiToolsUsed"
                        render={({ field }) => (
                          <FormItem key={tool} className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(tool)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), tool])
                                    : field.onChange(field.value?.filter((value) => value !== tool));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">{tool}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
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
