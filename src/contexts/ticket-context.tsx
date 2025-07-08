'use client';

import * as React from 'react';
import { mockTickets } from '@/lib/mock-data';
import type { Ticket } from '@/lib/types';

interface TicketContextType {
    tickets: Ticket[];
    setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
    addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => void;
    updateTicket: (ticket: Ticket) => void;
    deleteTicket: (ticketId: string) => void;
}

const TicketContext = React.createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: React.ReactNode }) {
    const [tickets, setTickets] = React.useState<Ticket[]>(mockTickets);
    
    const addTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt'>) => {
        const newTicket: Ticket = {
            ...ticketData,
            id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
            createdAt: new Date(),
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
