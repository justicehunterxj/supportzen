'use client';

import * as React from 'react';
import { differenceInDays } from 'date-fns';
import { mockTickets } from '@/lib/mock-data';
import type { Ticket } from '@/lib/types';
import { useShifts } from './shift-context';

interface TicketContextType {
    tickets: Ticket[];
    setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
    addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
                processedTickets = JSON.parse(storedTickets).map((t: any) => ({
                    ...t,
                    createdAt: new Date(t.createdAt),
                    updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(t.createdAt)
                }));
            } else {
                processedTickets = mockTickets;
            }

            // Auto-close tickets based on status and age
            const now = new Date();
            const autoClosedTickets = processedTickets.map(ticket => {
                if (ticket.status === 'Open' && differenceInDays(now, ticket.createdAt) >= 3) {
                    return { ...ticket, status: 'Closed' as const, updatedAt: now };
                }
                if (ticket.status === 'In Progress' && differenceInDays(now, ticket.updatedAt) >= 3) {
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
    
    const addTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'shiftId'>) => {
        const now = new Date();
        const newTicket: Ticket = {
            ...ticketData,
            id: getNextTicketId(tickets),
            createdAt: now,
            updatedAt: now,
            shiftId: activeShift?.id,
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
