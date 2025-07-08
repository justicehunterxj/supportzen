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
                return { ...shiftToStart, status: 'Active', endTime: undefined };
            }
            if (s.status === 'Active') {
                return { ...s, status: 'Completed', endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) };
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
            const endTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            setShifts(shifts.map(s => s.id === activeShift.id ? { ...s, status: 'Completed', endTime: endTime } : s));
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
