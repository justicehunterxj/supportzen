
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const features = [
  {
    value: "dashboard",
    title: "Main Dashboard",
    content: "The main dashboard provides at-a-glance statistics with key metrics like Open Tickets, Tickets Resolved Today, and Average Response Time. It also includes a table showing the most recent support tickets for a quick overview of activity."
  },
  {
    value: "ticket-management",
    title: "Ticket Management",
    content: "Full CRUD (Create, Read, Update, Delete) operations for support tickets are available through a user-friendly interface. A detailed dialog allows for comprehensive entry and editing of ticket information, including title, description, agent response, and assigning multiple categories. The system also features an AI-powered tool to suggest the most likely status for a ticket based on its description."
  },
  {
    value: "shift-management",
    title: "Shift Management",
    content: "Create and manage work shifts with specific start and end times. A live timer in the header tracks the duration of the active shift. Completed shifts are stored in an organized, expandable accordion view, where you can see all tickets worked on during that specific shift and even edit them in-context."
  },
  {
    value: "history",
    title: "Ticket History",
    content: "The history page allows you to view all archived tickets. Tickets are automatically archived when they are 'Resolved' or 'Closed' at the end of a shift. From here, you can review and edit past tickets to update details or re-assign them to the correct shift if needed."
  },
  {
    value: "analytics",
    title: "Analytics",
    content: "The analytics page provides charts to visualize ticket data. This includes a pie chart showing the distribution of tickets by status, a line chart tracking tickets created vs. resolved over time, and a chart showing the usage of different AI tools."
  },
  {
    value: "earnings",
    title: "Earnings Calculator",
    content: "This page automatically calculates total earnings based on the number of resolved and closed tickets. It also includes daily, weekly, and monthly reports. A currency converter is available to view earnings in a local currency with a user-configurable exchange rate."
  },
  {
    value: "settings",
    title: "Advanced Settings",
    content: "The settings page allows for extensive customization. You can change your profile picture, switch between light, dark, and system themes, and toggle the time format. The Data Management section allows you to export all your data to a JSON or CSV file, import data from a backup, or completely wipe the dashboard to a fresh state."
  }
];

export default function HelpPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <div>
                <CardTitle>Help Center</CardTitle>
                <CardDescription>
                A quick guide to the features and functionality of the SupportZen dashboard.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {features.map((feature) => (
            <AccordionItem key={feature.value} value={feature.value}>
              <AccordionTrigger className="text-lg">{feature.title}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                {feature.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
