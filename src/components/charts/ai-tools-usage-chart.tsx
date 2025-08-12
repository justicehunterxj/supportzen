"use client";

import { useMemo } from "react";
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { useTickets } from "@/contexts/ticket-context";
import type { AITool } from "@/lib/types";

const chartConfig = {
  tickets: {
    label: "Tickets",
  },
  ChatGPT: {
    label: "ChatGPT",
    color: "hsl(var(--chart-1))",
  },
  Gemini: {
    label: "Gemini",
    color: "hsl(var(--chart-2))",
  },
  Claude: {
    label: "Claude",
    color: "hsl(var(--chart-3))",
  },
  Copilot: {
    label: "Copilot",
    color: "hsl(var(--chart-4))",
  },
  Perplexity: {
    label: "Perplexity",
    color: "hsl(var(--chart-5))",
  },
};

export function AiToolsUsageChart() {
  const { tickets } = useTickets();

  const chartData = useMemo(() => {
    const toolCounts = tickets.reduce((acc, ticket) => {
      if (ticket.aiToolsUsed) {
        ticket.aiToolsUsed.forEach((tool) => {
          acc[tool] = (acc[tool] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<AITool, number>);

    if (Object.keys(toolCounts).length === 0) {
      return [{ tool: "No data", tickets: 1, fill: "hsl(var(--muted))" }];
    }

    return Object.entries(toolCounts).map(([tool, count]) => ({
      tool,
      tickets: count,
      fill: chartConfig[tool as AITool]?.color || "hsl(var(--muted))",
    }));
  }, [tickets]);

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={chartData}
          dataKey="tickets"
          nameKey="tool"
          innerRadius={60}
          strokeWidth={5}
        >
          {chartData.map((entry) => (
            <Cell key={`cell-${entry.tool}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="tool" />}
          className="-translate-y-[2rem] flex-wrap"
        />
      </PieChart>
    </ChartContainer>
  );
}
