
'use client';

import * as React from 'react';
import { differenceInHours } from 'date-fns';
import { mockTickets } from '@/lib/mock-data';
import type { Ticket, TicketCategory } from '@/lib/types';
import { useShifts } from './shift-context';

interface TicketContextType {
    tickets: Ticket[];
    setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
    addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => void;
    updateTicket: (ticket: Ticket) => void;
    deleteTicket: (ticketId: string) => void;
    processTickets: (tickets: Ticket[]) => Ticket[];
}

const TicketContext = React.createContext<TicketContextType | undefined>(undefined);

const getNextTicketId = (currentTickets: Ticket[]): string => {
    const highestId = currentTickets.reduce((maxId, ticket) => {
        if (ticket.id && ticket.id.startsWith('TKT-')) {
            const ticketIdNum = parseInt(ticket.id.replace('TKT-', ''), 10);
            return !isNaN(ticketIdNum) && ticketIdNum > maxId ? ticketIdNum : maxId;
        }
        return maxId;
    }, 0);
    return `TKT-${(highestId + 1).toString().padStart(3, '0')}`;
};

const processTickets = (ticketsToProcess: Ticket[]): Ticket[] => {
    const now = new Date();
    return ticketsToProcess.map(ticket => {
        let updatedTicket = { ...ticket };

        // Rule 1: Auto-close old tickets
        const isAutoClosable = updatedTicket.status === 'Open' || updatedTicket.status === 'In Progress';
        if (isAutoClosable && differenceInHours(now, new Date(ticket.updatedAt)) >= 48) {
            updatedTicket = { ...updatedTicket, status: 'Closed' as const, isArchived: true, updatedAt: ticket.updatedAt };
        }
        
        return updatedTicket;
    });
};

export function TicketProvider({ children }: { children: React.ReactNode }) {
    const [tickets, setTickets] = React.useState<Ticket[]>([]);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const { activeShift, isLoaded: isShiftContextLoaded } = useShifts();
    
    React.useEffect(() => {
        try {
            const storedTickets = localStorage.getItem('tickets');
            let loadedTickets: Ticket[] = [];

            if (storedTickets) {
                const parsedTickets = JSON.parse(storedTickets).map((t: any) => ({
                    ...t,
                    createdAt: new Date(t.createdAt),
                    updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(t.createdAt),
                }));

                const needsMigration = parsedTickets.some((t: Ticket) => !t.id || !t.id.startsWith('TKT-'));

                if (needsMigration) {
                    const ticketCategories: TicketCategory[] = ['Account Issue', 'Billing & Payments', 'Technical Issue', 'Feedback', 'General Query', 'Others'];
                    let ticketCounter = 1;
                    const highestExistingId = parsedTickets
                        .map((t: Ticket) => parseInt(t.id?.replace('TKT-', '') || '0', 10))
                        .filter((id: number) => !isNaN(id))
                        .reduce((max: number, current: number) => Math.max(max, current), 0);
                    ticketCounter = highestExistingId + 1;
                    
                    loadedTickets = parsedTickets.map((t: any) => {
                        if (t.id && t.id.startsWith('TKT-')) {
                            return t;
                        }

                        let mappedCategory: TicketCategory[];
                        if (typeof t.category === 'string') {
                            if (t.category === 'Support') { 
                                mappedCategory = ['General Query'];
                            } else if ((ticketCategories as string[]).includes(t.category)) {
                                mappedCategory = [t.category as TicketCategory];
                            } else {
                                mappedCategory = ['Others'];
                            }
                        } else if (Array.isArray(t.category)) {
                            mappedCategory = t.category.filter((c: any) => (ticketCategories as string[]).includes(c));
                            if (mappedCategory.length === 0) mappedCategory = ['Others'];
                        } else {
                            mappedCategory = ['Others'];
                        }

                        return {
                            ...t,
                            id: `TKT-${String(ticketCounter++).padStart(3, '0')}`,
                            category: mappedCategory,
                            isArchived: t.isArchived || false,
                        };
                    });
                } else {
                    loadedTickets = parsedTickets;
                }
            } else {
                loadedTickets = mockTickets.map(t => ({...t, isArchived: t.isArchived || false }));
            }

            const finalTickets = processTickets(loadedTickets);
            setTickets(finalTickets);

        } catch (error) {
            console.error("Failed to load tickets from localStorage", error);
            setTickets(mockTickets);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    React.useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem('tickets', JSON.stringify(tickets));
            } catch (error) {
                console.error("Failed to save tickets to localStorage", error);
            }
        }
    }, [tickets, isLoaded]);
    
    const addTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
        if (!isShiftContextLoaded) return;
        const now = new Date();
        setTickets(prevTickets => {
            const newTicket: Ticket = {
                ...ticketData,
                id: getNextTicketId(prevTickets),
                createdAt: now,
                updatedAt: now,
                shiftId: activeShift?.id,
                isArchived: false,
            };
            return [newTicket, ...prevTickets];
        });
    };

    const updateTicket = (updatedTicket: Ticket) => {
        if (!isShiftContextLoaded) return;
        
        let processedTicket = { ...updatedTicket, updatedAt: new Date() };

        // Ensure the ticket is associated with the active shift if it's being updated
        if (activeShift && !processedTicket.shiftId) {
            processedTicket.shiftId = activeShift.id;
        }

        // Apply rules on the single updated ticket
        const finalTicketArray = processTickets([processedTicket]);
        const finalTicket = finalTicketArray[0];

        setTickets(prevTickets => prevTickets.map(t => 
            t.id === finalTicket.id ? finalTicket : t
        ));
    };

    const deleteTicket = (ticketId: string) => {
        setTickets(prevTickets => prevTickets.filter(t => t.id !== ticketId));
    };

    return (
        <TicketContext.Provider value={{ tickets, setTickets, addTicket, updateTicket, deleteTicket, processTickets }}>
            {children}
        </TicketContext.Provider>
    );
}

export function useTickets() {
    const context = React.useContext(TicketContext);
    if (context === undefined) {
        throw new Error('useTickets must be used within a TicketProvider');
    }
    return context;
}
