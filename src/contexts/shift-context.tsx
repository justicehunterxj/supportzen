
'use client';

import * as React from 'react';
import { mockShifts } from '@/lib/mock-data';
import type { Shift, Ticket } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ShiftContextType {
    shifts: Shift[];
    setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
    activeShift: Shift | undefined;
    addShift: (shift: Omit<Shift, 'id' | 'status'>) => void;
    startNewShift: (newShiftData: Pick<Shift, 'name' | 'startTime'>) => void;
    endActiveShift: (currentTickets: Ticket[], setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>) => number;
    isLoaded: boolean;
}

const ShiftContext = React.createContext<ShiftContextType | undefined>(undefined);

const getNextShiftId = (currentShifts: Shift[]): string => {
    if (!currentShifts || currentShifts.length === 0) {
        return 'SH-1';
    }
    const highestId = currentShifts
        .map(s => parseInt(s.id.replace('SH-', ''), 10))
        .filter(id => !isNaN(id))
        .reduce((max, current) => Math.max(max, current), 0);
    return `SH-${highestId + 1}`;
};

export function ShiftProvider({ children }: { children: React.ReactNode }) {
    const [shifts, setShifts] = React.useState<Shift[]>([]);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        try {
            const storedShifts = localStorage.getItem('shifts');
            if (storedShifts) {
                let parsedShifts = JSON.parse(storedShifts).map((s: any) => ({
                    ...s,
                    startedAt: s.startedAt ? new Date(s.startedAt) : undefined,
                    endedAt: s.endedAt ? new Date(s.endedAt) : undefined,
                }));
                
                const needsMigration = parsedShifts.some((s: Shift) => !s.id || !s.id.startsWith('SH-'));

                if (needsMigration) {
                  let shiftCounter = 1;
                  const highestExistingId = parsedShifts
                    .map((s: Shift) => parseInt(s.id?.replace('SH-', '') || '0', 10))
                    .filter((id: number) => !isNaN(id))
                    .reduce((max: number, current: number) => Math.max(max, current), 0);
                  shiftCounter = highestExistingId + 1;

                  const renumberedShifts = parsedShifts.map((shift: any) => {
                      if (!shift.id || !shift.id.startsWith('SH-')) {
                        return { ...shift, id: `SH-${shiftCounter++}` };
                      }
                      return shift;
                  });
                  setShifts(renumberedShifts);
                } else {
                  setShifts(parsedShifts);
                }

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

    const addShift = (shiftData: Omit<Shift, 'id' | 'status'>) => {
        const newShift: Shift = {
            ...shiftData,
            id: getNextShiftId(shifts),
            status: 'Pending',
        };
        setShifts(prevShifts => [...prevShifts, newShift]);
    };
    
    const startNewShift = (newShiftData: Pick<Shift, 'name' | 'startTime'>) => {
        const newShift: Shift = {
            ...newShiftData,
            id: getNextShiftId(shifts),
            status: 'Active',
            startedAt: new Date(),
        };

        setShifts(prevShifts => {
            const endedShifts = prevShifts.map(s => 
                s.status === 'Active' ? { ...s, status: 'Completed' as const, endedAt: new Date() } : s
            );
            return [newShift, ...endedShifts.filter(s => s.id !== newShift.id)];
        });

        toast({
            title: "Shift Started",
            description: `Shift "${newShift.name}" is now active.`,
        });
    };
    
    const endActiveShift = (currentTickets: Ticket[], setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>): number => {
        let archivedCount = 0;
        if (activeShift) {
            const updatedTickets = currentTickets.map(ticket => {
                if (ticket.shiftId === activeShift.id && (ticket.status === 'Resolved' || ticket.status === 'Closed')) {
                    archivedCount++;
                    return { ...ticket, isArchived: true };
                }
                return ticket;
            });
            setTickets(updatedTickets);
            setShifts(shifts.map(s => s.id === activeShift.id ? { ...s, status: 'Completed', endedAt: new Date() } : s));
        }
        return archivedCount;
    };

    return (
        <ShiftContext.Provider value={{ shifts, setShifts, activeShift, addShift, startNewShift, endActiveShift, isLoaded }}>
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
