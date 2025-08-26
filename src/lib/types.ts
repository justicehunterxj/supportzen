
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type AITool = 'ChatGPT' | 'Gemini' | 'Claude' | 'Copilot' | 'Perplexity';
export type ShiftStatus = 'Pending' | 'Active' | 'Completed';
export type TicketCategory = 'Account Issue' | 'Billing & Payments' | 'Technical Issue' | 'Feedback' | 'General Query' | 'Others';


export type Ticket = {
  id: string;
  title: string;
  description: string;
  category: TicketCategory[];
  agentResponse?: string;
  link?: string;
  aiToolsUsed?: AITool[];
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  shiftId?: string;
  isArchived: boolean;
};

export type Shift = {
  id: string;
  name: string;
  startTime: string; // Scheduled start time
  endTime?: string; // Scheduled end time
  startedAt?: Date;
  endedAt?: Date;
  status: ShiftStatus;
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
