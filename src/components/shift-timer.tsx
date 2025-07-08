'use client';

import * as React from 'react';
import { Clock, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useShifts } from '@/contexts/shift-context';
import { ShiftDialog } from '@/components/shift-dialog';
import type { Shift } from '@/lib/types';
import { useSettings } from '@/contexts/settings-context';
import { format } from 'date-fns';

export function ShiftTimer() {
    const { activeShift, createAndStartShift, endActiveShift } = useShifts();
    const { timeFormat } = useSettings();
    const [elapsedTime, setElapsedTime] = React.useState('00:00:00');
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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
    }, [activeShift?.startedAt]);
    
    const handleStartClick = () => {
        setIsDialogOpen(true);
    };
    
    const handleSaveAndStartShift = (shiftData: Shift) => {
        const { name, startTime } = shiftData;
        createAndStartShift({ name, startTime });
    };

    const getFormattedStartTime = () => {
        if (!activeShift || !activeShift.startedAt) return '';
        return format(new Date(activeShift.startedAt), timeFormat === '12h' ? 'h:mm a' : 'HH:mm');
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
                                <Button onClick={endActiveShift} className="w-full gap-2">
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
        </>
    );
}
