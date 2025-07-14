'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Coins } from 'lucide-react';
import { useTickets } from '@/contexts/ticket-context';
import { isSameDay, format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import type { Ticket } from '@/lib/types';
import { StatusBadge } from '../status-badge';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';

const TICKET_PRICE_USD = 1.33;

export function EarningsPage() {
  const [exchangeRate, setExchangeRate] = React.useState(58.75);
  const { tickets } = useTickets();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  
  const earningsByDate = React.useMemo(() => {
    const earnings: Record<string, { total: number; tickets: Ticket[] }> = {};
    const resolvedTickets = tickets.filter(
      t => (t.status === 'Resolved' || t.status === 'Closed') && t.updatedAt
    );
    
    resolvedTickets.forEach(ticket => {
      const dateKey = format(new Date(ticket.updatedAt), 'yyyy-MM-dd');
      if (!earnings[dateKey]) {
        earnings[dateKey] = { total: 0, tickets: [] };
      }
      earnings[dateKey].total += TICKET_PRICE_USD;
      earnings[dateKey].tickets.push(ticket);
    });

    return earnings;
  }, [tickets]);

  const totalEarningsUSD = React.useMemo(() => {
    return Object.values(earningsByDate).reduce((acc, curr) => acc + curr.total, 0);
  }, [earningsByDate]);

  const totalEarningsPHP = totalEarningsUSD * exchangeRate;

  const selectedDayEarnings = React.useMemo(() => {
    if (!selectedDate) return null;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return earningsByDate[dateKey] || { total: 0, tickets: [] };
  }, [selectedDate, earningsByDate]);

  const earningDays = Object.keys(earningsByDate).map(dateStr => new Date(dateStr));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">Earnings Calendar</h3>
          <Card>
            <CardContent className="p-2 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{
                  earningDay: earningDays,
                }}
                modifiersStyles={{
                  earningDay: { 
                    fontWeight: 'bold', 
                    color: 'hsl(var(--primary))' 
                  },
                }}
                components={{
                  DayContent: ({ date, displayMonth }) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const earning = earningsByDate[dateKey];
                    return (
                      <div className="relative h-full w-full flex flex-col items-center justify-center">
                        <div>{format(date, 'd')}</div>
                        {earning && (
                           <div className="text-[10px] text-green-600 font-semibold">${earning.total.toFixed(2)}</div>
                        )}
                      </div>
                    );
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
            <h3 className="text-lg font-medium mb-4">
              Daily Breakdown
            </h3>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                </CardTitle>
                <CardDescription>
                  Earnings: <span className="font-bold text-primary">${selectedDayEarnings?.total.toFixed(2) ?? '0.00'}</span> from {selectedDayEarnings?.tickets.length ?? 0} tickets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDayEarnings && selectedDayEarnings.tickets.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedDayEarnings.tickets.map(ticket => (
                      <div key={ticket.id} className="text-sm p-2 border rounded-md">
                        <p className="font-semibold truncate">{ticket.title}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">{ticket.id}</p>
                          <StatusBadge status={ticket.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {selectedDate ? 'No earnings on this day.' : 'Select a day to see details.'}
                  </p>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
      
      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Currency Converter</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <DollarSign className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Earnings (USD)</p>
                    <p className="text-2xl font-bold">${totalEarningsUSD.toFixed(2)}</p>
                </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                Based on {tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length} resolved tickets.
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                <div className="rounded-full bg-accent/10 p-3 text-accent">
                    <Coins className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Earnings (PHP)</p>
                    <p className="text-2xl font-bold">₱{totalEarningsPHP.toFixed(2)}</p>
                </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                At an exchange rate of {exchangeRate.toFixed(2)} PHP/USD.
                </p>
            </CardContent>
            </Card>
        </div>
        <div className="w-full max-w-sm space-y-2 mt-6">
            <Label htmlFor="exchange-rate">USD to PHP Exchange Rate</Label>
            <Input
            id="exchange-rate"
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
            step="0.01"
            placeholder="e.g. 58.75"
            />
        </div>
      </div>
    </div>
  );
}
