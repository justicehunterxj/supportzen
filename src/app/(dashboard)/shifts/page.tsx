import { ShiftPage } from "@/components/pages/shift-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Shifts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Management</CardTitle>
        <CardDescription>
          Review completed shifts and manage upcoming schedules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ShiftPage />
      </CardContent>
    </Card>
  );
}
