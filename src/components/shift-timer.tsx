'use client';

import * as React from 'react';
import { Clock, Play, Square } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useShifts } from '@/contexts/shift-context';
import { ShiftDialog } from '@/components/shift-dialog';
import type { Shift } from '@/lib/types';
import { useSettings } from '@/contexts/settings-context';
import { format } from 'date-fns';
import { useTickets } from '@/contexts/ticket-context';
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

export function ShiftTimer() {
    const { activeShift, startNewShift, endActiveShift } = useShifts();
    const { tickets, setTickets } = useTickets();
    const { timeFormat } = useSettings();
    const [elapsedTime, setElapsedTime] = React.useState('00:00:00');
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isArchiveAlertOpen, setIsArchiveAlertOpen] = React.useState(false);

    React.useEffect(() => {
        if (!activeShift || !activeShift.startedAt) {
            setElapsedTime('00:00:00');
            return;
        }

        const startTime = new Date(activeShift.startedAt);

        const intervalId = setInterval(() => {
            const now = new Date();
            const diff = now.getTime() - startTime.getTime();
            
            if (diff < 0) {
                setElapsedTime('00:00:00');
                return;
            }

            const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
            const m = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const s = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

            setElapsedTime(`${h}:${m}:${s}`);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [activeShift, activeShift?.startedAt]);
    
    const handleStartClick = () => {
        setIsDialogOpen(true);
    };
    
    const handleSaveAndStartShift = (shiftData: Shift) => {
        startNewShift({ name: shiftData.name, startTime: shiftData.startTime });
    };

    const handleEndShiftClick = () => {
        if (!activeShift) return;
        setIsArchiveAlertOpen(true);
    };
    
    const handleArchiveAndEndShift = () => {
        if (!activeShift || !activeShift.startedAt) return;
    
        const startedAt = new Date(activeShift.startedAt);
        const endedAt = new Date();
    
        const ticketsToUpdate = tickets.map(ticket => {
            let currentTicket = { ...ticket };
            const updatedAt = new Date(ticket.updatedAt);
    
            if (updatedAt >= startedAt && updatedAt <= endedAt) {
                currentTicket.shiftId = activeShift.id;
            }
    
            if (currentTicket.shiftId === activeShift.id) {
                if (currentTicket.status === 'Resolved' || currentTicket.status === 'Closed') {
                    currentTicket.isArchived = true;
                }
            }
            return currentTicket;
        });
    
        setTickets(ticketsToUpdate);
        endActiveShift();
        setIsArchiveAlertOpen(false);
    };


    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        return format(date, timeFormat === '12h' ? 'h:mm a' : 'HH:mm');
    }
    
    const getFormattedStartTime = () => {
        if (!activeShift) return '';
        if (activeShift.startedAt) {
            return format(new Date(activeShift.startedAt), timeFormat === '12h' ? 'h:mm a' : 'HH:mm');
        }
        return formatTime(activeShift.startTime);
    }

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 w-32 justify-center">
                        <Clock className="h-4 w-4" />
                        <span className="font-mono">{activeShift ? elapsedTime : 'Shift Timer'}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Shift Controls</h4>
                            <p className="text-sm text-muted-foreground">
                                Manage your current work shift.
                            </p>
                        </div>
                        {activeShift ? (
                            <div className="space-y-2">
                                <p className="text-sm">
                                    Active Shift: <span className="font-semibold">{activeShift.name}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Started at {getFormattedStartTime()}
                                </p>
                                <Button onClick={handleEndShiftClick} className="w-full gap-2">
                                    <Square className="h-4 w-4" /> End Shift
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">No shift is currently active.</p>
                                 <Button onClick={handleStartClick} className="w-full gap-2">
                                    <Play className="h-4 w-4" /> Start Shift
                                </Button>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
            <ShiftDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                shift={null}
                onSave={handleSaveAndStartShift}
                isStartingShift={true}
            />
            <AlertDialog open={isArchiveAlertOpen} onOpenChange={setIsArchiveAlertOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>End Shift and Archive Tickets?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will end your current shift. Tickets that are 'Resolved' or 'Closed' will be moved to the History tab. 'In Progress' tickets will remain on the dashboard.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className={buttonVariants({ variant: "default" })}
                        onClick={handleArchiveAndEndShift}
                    >
                        End Shift
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
