import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketsByStatusChart } from "@/components/charts/tickets-by-status-chart";
import { TicketsOverTimeChart } from "@/components/charts/tickets-over-time-chart";

export default function AnalyticsPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-1">
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
      <Card className="lg:col-span-1">
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
    </div>
  );
}
