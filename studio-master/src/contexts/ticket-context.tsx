'use client';

import * as React from 'react';
import { differenceInDays } from 'date-fns';
import { mockTickets } from '@/lib/mock-data';
import type { Ticket } from '@/lib/types';
import { useShifts } from './shift-context';

interface TicketContextType {
    tickets: Ticket[];
    setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
    addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => void;
    updateTicket: (ticket: Ticket) => void;
    deleteTicket: (ticketId: string) => void;
}

const TicketContext = React.createContext<TicketContextType | undefined>(undefined);

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
                    createdAt: new Date(t.createdAt)
                }));
            } else {
                processedTickets = mockTickets;
            }

            // Auto-close tickets older than 3 days
            const now = new Date();
            const autoClosedTickets = processedTickets.map(ticket => {
                const isAutoClosable = ticket.status === 'Open' || ticket.status === 'In Progress';
                if (isAutoClosable && differenceInDays(now, ticket.createdAt) >= 3) {
                    return { ...ticket, status: 'Closed' as const };
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
    
    const addTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'shiftId'>) => {
        const newTicket: Ticket = {
            ...ticketData,
            id: `TKT-${Date.now()}`,
            createdAt: new Date(),
            shiftId: activeShift?.id,
        };
        setTickets(prevTickets => [newTicket, ...prevTickets]);
    };

    const updateTicket = (updatedTicket: Ticket) => {
        setTickets(prevTickets => prevTickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
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
