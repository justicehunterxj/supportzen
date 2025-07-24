
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
    const highestId = currentTickets.reduce((maxId, ticket) => {
        if (ticket.id && ticket.id.startsWith('TKT-')) {
            const ticketIdNum = parseInt(ticket.id.replace('TKT-', ''), 10);
            return !isNaN(ticketIdNum) && ticketIdNum > maxId ? ticketIdNum : maxId;
        }
        return maxId;
    }, 0);
    return `TKT-${(highestId + 1).toString().padStart(3, '0')}`;
};

export function TicketProvider({ children }: { children: React.ReactNode }) {
    const [tickets, setTickets] = React.useState<Ticket[]>([]);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const { activeShift, isLoaded: isShiftContextLoaded } = useShifts();
    
    React.useEffect(() => {
        try {
            const storedTickets = localStorage.getItem('tickets');
            let processedTickets: Ticket[] = [];

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
                    
                    processedTickets = parsedTickets.map((t: any) => {
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
                    processedTickets = parsedTickets;
                }
            } else {
                processedTickets = mockTickets.map(t => ({...t, isArchived: t.isArchived || false }));
            }

            // Auto-close and auto-archive tickets
            const now = new Date();
            const finalTickets = processedTickets.map(ticket => {
                let updatedTicket = { ...ticket };

                // Rule 1: Auto-close old tickets
                const isAutoClosable = updatedTicket.status === 'Open' || updatedTicket.status === 'In Progress';
                if (isAutoClosable && differenceInDays(now, new Date(updatedTicket.updatedAt)) >= 3) {
                    updatedTicket = { ...updatedTicket, status: 'Closed' as const, updatedAt: now };
                }

                // Rule 2: Auto-archive resolved or closed tickets
                if ((updatedTicket.status === 'Resolved' || updatedTicket.status === 'Closed') && !updatedTicket.isArchived) {
                    updatedTicket = { ...updatedTicket, isArchived: true };
                }
                
                return updatedTicket;
            });

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
        setTickets(prevTickets => prevTickets.map(t => {
            if (t.id === updatedTicket.id) {
                const newTicketData: Ticket = { ...updatedTicket, updatedAt: new Date() };
                if (activeShift && !newTicketData.shiftId) {
                    newTicketData.shiftId = activeShift.id;
                }
                // Auto-archive on update if status is Resolved or Closed
                if ((newTicketData.status === 'Resolved' || newTicketData.status === 'Closed') && !newTicketData.isArchived) {
                    newTicketData.isArchived = true;
                }
                return newTicketData;
            }
            return t;
        }));
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
