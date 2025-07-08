'use client';

import * as React from 'react';
import { Clock, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useShifts } from '@/contexts/shift-context';
import { ShiftDialog } from '@/components/shift-dialog';
import type { Shift } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function ShiftTimer() {
    const { shifts, activeShift, startShift, endActiveShift } = useShifts();
    const [elapsedTime, setElapsedTime] = React.useState('00:00:00');
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [shiftToStart, setShiftToStart] = React.useState<Shift | null>(null);
    const { toast } = useToast();

    React.useEffect(() => {
        if (!activeShift) {
            setElapsedTime('00:00:00');
            return;
        }

        const startTime = new Date();
        const [hours, minutes] = activeShift.startTime.split(':');
        startTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        const intervalId = setInterval(() => {
            const now = new Date();
            const diff = now.getTime() - startTime.getTime();
            
            const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
            const m = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const s = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

            setElapsedTime(`${h}:${m}:${s}`);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [activeShift]);
    
    const handleStartClick = () => {
        const nextPendingShift = shifts.find(s => s.status === 'Pending');
        if (nextPendingShift) {
            setShiftToStart(nextPendingShift);
            setIsDialogOpen(true);
        } else {
            toast({
                variant: "destructive",
                title: "No Pending Shifts",
                description: "There are no pending shifts to start.",
            });
        }
    };
    
    const handleSaveAndStartShift = (shiftData: Shift) => {
        if (shiftToStart) {
            const updatedShift = { ...shiftData, id: shiftToStart.id };
            startShift(updatedShift);
        }
    };

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 w-32">
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
                                    Started at {activeShift.startTime}
                                </p>
                                <Button onClick={endActiveShift} className="w-full gap-2">
                                    <Square className="h-4 w-4" /> End Shift
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">No shift is currently active.</p>
                                 <Button onClick={handleStartClick} className="w-full gap-2">
                                    <Play className="h-4 w-4" /> Start Next Shift
                                </Button>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
            <ShiftDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                shift={shiftToStart}
                onSave={handleSaveAndStartShift}
                isStartingShift={true}
            />
        </>
    );
}
