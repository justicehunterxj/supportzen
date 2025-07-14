'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Coins, Calendar, CalendarDays, Wallet } from 'lucide-react';
import { useTickets } from '@/contexts/ticket-context';
import { isThisWeek, isThisMonth, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';

const TICKET_PRICE_USD = 1.33;

const EarningStatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) => (
    <Card>
        <CardContent className="p-6">
        <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
            <Icon className="h-6 w-6" />
            </div>
            <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">${value}</p>
            </div>
        </div>
        </CardContent>
    </Card>
);

export function EarningsPage() {
  const [exchangeRate, setExchangeRate] = React.useState(58.75); // Example rate
  const { tickets } = useTickets();

  const resolvedTickets = React.useMemo(() => {
    return tickets.filter(t => (t.status === 'Resolved' || t.status === 'Closed') && t.updatedAt);
  }, [tickets]);

  const weeklyEarnings = React.useMemo(() => {
    const weeklyTickets = resolvedTickets.filter(t => isThisWeek(new Date(t.updatedAt), { weekStartsOn: 1 }));
    return weeklyTickets.length * TICKET_PRICE_USD;
  }, [resolvedTickets]);

  const monthlyEarnings = React.useMemo(() => {
    const monthlyTickets = resolvedTickets.filter(t => isThisMonth(new Date(t.updatedAt)));
    return monthlyTickets.length * TICKET_PRICE_USD;
  }, [resolvedTickets]);

  const totalEarningsUSD = resolvedTickets.length * TICKET_PRICE_USD;
  const totalEarningsPHP = totalEarningsUSD * exchangeRate;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Earnings Breakdown</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <EarningStatCard title="This Week" value={weeklyEarnings.toFixed(2)} icon={CalendarDays} />
            <EarningStatCard title="This Month" value={monthlyEarnings.toFixed(2)} icon={Calendar} />
            <EarningStatCard title="All Time" value={totalEarningsUSD.toFixed(2)} icon={Wallet} />
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
                Based on {resolvedTickets.length} resolved tickets at ${TICKET_PRICE_USD} each.
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
