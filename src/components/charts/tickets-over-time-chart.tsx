'use client';

import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { mockTickets } from '@/lib/mock-data';
import { useMemo } from 'react';

const chartConfig = {
  created: {
    label: 'Created',
    color: 'hsl(var(--chart-1))',
  },
  resolved: {
    label: 'Resolved',
    color: 'hsl(var(--chart-2))',
  },
};

export function TicketsOverTimeChart() {
  const chartData = useMemo(() => {
    const dataByDate: Record<string, { created: number; resolved: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dataByDate[dateString] = { created: 0, resolved: 0 };
    }

    mockTickets.forEach(ticket => {
      const createdAt = new Date(ticket.createdAt);
      const dateString = createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dataByDate[dateString]) {
        dataByDate[dateString].created += 1;
        if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
          dataByDate[dateString].resolved += 1;
        }
      }
    });

    return Object.entries(dataByDate).map(([date, values]) => ({
      date,
      ...values,
    }));
  }, []);

  return (
    <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
      <LineChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line dataKey="created" type="monotone" stroke="var(--color-created)" strokeWidth={2} dot={false} />
        <Line dataKey="resolved" type="monotone" stroke="var(--color-resolved)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  );
}
