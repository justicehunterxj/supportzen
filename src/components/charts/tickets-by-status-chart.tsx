'use client';

import { Pie, PieChart, Cell } from 'recharts';

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
  tickets: {
    label: 'Tickets',
  },
  Open: {
    label: 'Open',
    color: 'hsl(var(--chart-1))',
  },
  'In Progress': {
    label: 'In Progress',
    color: 'hsl(var(--chart-3))',
  },
  Resolved: {
    label: 'Resolved',
    color: 'hsl(var(--chart-2))',
  },
  Closed: {
    label: 'Closed',
    color: 'hsl(var(--chart-5))',
  },
};

export function TicketsByStatusChart() {
  const chartData = useMemo(() => {
    const statusCounts = mockTickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      tickets: count,
      fill: chartConfig[status as keyof typeof chartConfig]?.color,
    }));
  }, []);

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={chartData}
          dataKey="tickets"
          nameKey="status"
          innerRadius={60}
          strokeWidth={5}
        >
            {chartData.map((entry) => (
                <Cell key={`cell-${entry.status}`} fill={entry.fill} />
            ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="status" />} />
      </PieChart>
    </ChartContainer>
  );
}
