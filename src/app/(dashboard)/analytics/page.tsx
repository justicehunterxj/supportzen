import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AiToolsUsageChart } from "@/components/charts/ai-tools-usage-chart";
import { TicketsByStatusChart } from "@/components/charts/tickets-by-status-chart";
import { TicketsOverTimeChart } from "@/components/charts/tickets-over-time-chart";

export default function AnalyticsPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tickets by Status</CardTitle>
          <CardDescription>
            A breakdown of current tickets by their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TicketsByStatusChart />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ticket Resolution Over Time</CardTitle>
          <CardDescription>
            Number of tickets created vs. resolved in the last 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TicketsOverTimeChart />
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>AI Tool Usage</CardTitle>
          <CardDescription>
            Frequency of AI tools used in ticket resolutions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiToolsUsageChart />
        </CardContent>
      </Card>
    </div>
  );
}
