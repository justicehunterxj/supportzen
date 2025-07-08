'use client';

import * as React from 'react';
import { mockShifts } from '@/lib/mock-data';
import type { Shift } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ShiftContextType {
    shifts: Shift[];
    setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
    activeShift: Shift | undefined;
    startShift: (shiftToStart: Shift) => void;
    endActiveShift: () => void;
}

const ShiftContext = React.createContext<ShiftContextType | undefined>(undefined);

export function ShiftProvider({ children }: { children: React.ReactNode }) {
    const [shifts, setShifts] = React.useState<Shift[]>(mockShifts);
    const { toast } = useToast();

    const activeShift = React.useMemo(() => shifts.find(s => s.status === 'Active'), [shifts]);

    const startShift = (shiftToStart: Shift) => {
        setShifts(prevShifts => prevShifts.map(s => {
            if (s.id === shiftToStart.id) {
                return { ...shiftToStart, status: 'Active', startedAt: new Date(), endedAt: undefined };
            }
            if (s.status === 'Active') {
                return { ...s, status: 'Completed', endedAt: new Date() };
            }
            return s;
        }));
        
        toast({
            title: "Shift Started",
            description: `Shift "${shiftToStart.name}" is now active.`,
        });
    };
    
    const endActiveShift = () => {
        if (activeShift) {
            setShifts(shifts.map(s => s.id === activeShift.id ? { ...s, status: 'Completed', endedAt: new Date() } : s));
            toast({
                title: "Shift Ended",
                description: `Shift "${activeShift.name}" has been completed.`,
            });
        }
    };

    return (
        <ShiftContext.Provider value={{ shifts, setShifts, activeShift, startShift, endActiveShift }}>
            {children}
        </ShiftContext.Provider>
    );
}

export function useShifts() {
    const context = React.useContext(ShiftContext);
    if (context === undefined) {
        throw new Error('useShifts must be used within a ShiftProvider');
    }
    return context;
}
