import { TicketPage } from "@/components/pages/ticket-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Tickets() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Management</CardTitle>
        <CardDescription>
          View, create, and manage all support tickets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TicketPage />
      </CardContent>
    </Card>
  );
}
