import { HistoryPage } from "@/components/pages/history-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function History() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket History</CardTitle>
        <CardDescription>
          View and manage archived tickets from previous shifts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <HistoryPage />
      </CardContent>
    </Card>
  );
}
