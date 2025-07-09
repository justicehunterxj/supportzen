'use client';

import * as React from 'react';
import { differenceInDays } from 'date-fns';
import { mockTickets } from '@/lib/mock-data';
import type { Ticket, TicketCategory } from '@/lib/types';
import { useShifts } from './shift-context';

interface TicketContextType {
    tickets: Ticket[];
    setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
    addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => void;
    updateTicket: (ticket: Ticket) => void;
    deleteTicket: (ticketId: string) => void;
}

const TicketContext = React.createContext<TicketContextType | undefined>(undefined);

const getNextTicketId = (currentTickets: Ticket[]): string => {
    if (!currentTickets || currentTickets.length === 0) {
        return 'TKT-001';
    }
    const highestId = currentTickets
        .map(t => parseInt(t.id.replace('TKT-', ''), 10))
        .filter(id => !isNaN(id))
        .reduce((max, current) => Math.max(max, current), 0);
    return `TKT-${(highestId + 1).toString().padStart(3, '0')}`;
};

export function TicketProvider({ children }: { children: React.ReactNode }) {
    const [tickets, setTickets] = React.useState<Ticket[]>([]);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const { activeShift } = useShifts();
    
    React.useEffect(() => {
        try {
            const storedTickets = localStorage.getItem('tickets');
            let processedTickets: Ticket[];

            if (storedTickets) {
                const ticketCategories: TicketCategory[] = ['Account Issue', 'Billing & Payments', 'Technical Issue', 'Feedback', 'General Query', 'Others'];
                
                let parsedTickets = JSON.parse(storedTickets).map((t: any) => {
                    // This is the migration logic
                    let mappedCategory: TicketCategory[];
                    if (typeof t.category === 'string') {
                        if (t.category === 'Support') { // old value
                            mappedCategory = ['General Query'];
                        } else if ((ticketCategories as string[]).includes(t.category)) {
                            mappedCategory = [t.category as TicketCategory];
                        } else {
                            mappedCategory = ['Others'];
                        }
                    } else if (Array.isArray(t.category)) {
                        mappedCategory = t.category.filter((c: any) => (ticketCategories as string[]).includes(c));
                        if (mappedCategory.length === 0) {
                            mappedCategory = ['Others'];
                        }
                    } else {
                        mappedCategory = ['Others'];
                    }

                    return {
                        ...t,
                        category: mappedCategory,
                        createdAt: new Date(t.createdAt),
                        updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(t.createdAt),
                        isArchived: t.isArchived || false,
                    };
                });

                 // Migration: Re-number all tickets to ensure sequential IDs
                 let ticketCounter = 1;
                 processedTickets = parsedTickets.map((ticket: any) => {
                     return { ...ticket, id: `TKT-${String(ticketCounter++).padStart(3, '0')}` };
                 });

            } else {
                processedTickets = mockTickets.map(t => ({...t, isArchived: t.isArchived || false }));
            }

            // Auto-close tickets based on status and age
            const now = new Date();
            const autoClosedTickets = processedTickets.map(ticket => {
                if (ticket.status === 'Open' && differenceInDays(now, new Date(ticket.createdAt)) >= 3) {
                    return { ...ticket, status: 'Closed' as const, updatedAt: now };
                }
                if (ticket.status === 'In Progress' && differenceInDays(now, new Date(ticket.updatedAt)) >= 3) {
                    return { ...ticket, status: 'Closed' as const, updatedAt: now };
                }
                return ticket;
            });

            setTickets(autoClosedTickets);

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
    
    const addTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'shiftId' | 'isArchived'>) => {
        const now = new Date();
        const newTicket: Ticket = {
            ...ticketData,
            id: getNextTicketId(tickets),
            createdAt: now,
            updatedAt: now,
            shiftId: activeShift?.id,
            isArchived: false,
        };
        setTickets(prevTickets => [newTicket, ...prevTickets]);
    };

    const updateTicket = (updatedTicket: Ticket) => {
        setTickets(prevTickets => prevTickets.map(t => 
            t.id === updatedTicket.id 
                ? { ...updatedTicket, updatedAt: new Date() } 
                : t
        ));
    };

    const deleteTicket = (ticketId: string) => {
        setTickets(prevTickets => prevTickets.filter(t => t.id !== ticketId));
    };


    return (
        <TicketContext.Provider value={{ tickets, setTickets, addTicket, updateTicket, deleteTicket }}>
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
