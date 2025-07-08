'use client';

import * as React from 'react';
import { mockShifts } from '@/lib/mock-data';
import type { Shift } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ShiftContextType {
    shifts: Shift[];
    setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
    activeShift: Shift | undefined;
    createAndStartShift: (shiftData: Omit<Shift, 'id' | 'status' | 'startedAt' | 'endedAt'>) => void;
    endActiveShift: () => void;
}

const ShiftContext = React.createContext<ShiftContextType | undefined>(undefined);

export function ShiftProvider({ children }: { children: React.ReactNode }) {
    const [shifts, setShifts] = React.useState<Shift[]>([]);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        try {
            const storedShifts = localStorage.getItem('shifts');
            if (storedShifts) {
                const parsedShifts = JSON.parse(storedShifts).map((s: any) => ({
                    ...s,
                    startedAt: s.startedAt ? new Date(s.startedAt) : undefined,
                    endedAt: s.endedAt ? new Date(s.endedAt) : undefined,
                }));
                setShifts(parsedShifts);
            } else {
                setShifts(mockShifts);
            }
        } catch (error) {
            console.error("Failed to load shifts from localStorage", error);
            setShifts(mockShifts);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    React.useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem('shifts', JSON.stringify(shifts));
            } catch (error) {
                console.error("Failed to save shifts to localStorage", error);
            }
        }
    }, [shifts, isLoaded]);

    const activeShift = React.useMemo(() => shifts.find(s => s.status === 'Active'), [shifts]);
    
    const createAndStartShift = (shiftData: Omit<Shift, 'id' | 'status' | 'startedAt' | 'endedAt'>) => {
        setShifts(prevShifts => {
            // End any currently active shift before starting a new one
            const updatedShifts = prevShifts.map(s => {
                if (s.status === 'Active') {
                    toast({
                        title: "Previous Shift Ended",
                        description: `Shift "${s.name}" was automatically completed.`,
                    });
                    return { ...s, status: 'Completed' as const, endedAt: new Date() };
                }
                return s;
            });

            const newShift: Shift = {
                ...shiftData,
                id: `SH-${Date.now()}`,
                status: 'Active',
                startedAt: new Date(),
            };
            
            return [...updatedShifts, newShift];
        });

        toast({
            title: "Shift Started",
            description: `Shift "${shiftData.name}" is now active.`,
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
        <ShiftContext.Provider value={{ shifts, setShifts, activeShift, createAndStartShift, endActiveShift }}>
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
