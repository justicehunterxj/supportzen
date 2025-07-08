export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export type Ticket = {
  id: string;
  description: string;
  assignee: {
    name: string;
    avatar: string;
  };
  status: TicketStatus;
  createdAt: Date;
};

export type Shift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  assigned: string;
};

export type Stat = {
  title: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  change?: string;
  changeType?: 'increase' | 'decrease';
};

export type AnalyticsChartData = {
  date: string;
  [key: string]: number | string;
};
