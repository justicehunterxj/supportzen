import { Badge } from '@/components/ui/badge';
import type { TicketStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Box, Loader, CheckCircle2, Archive } from 'lucide-react';

const statusConfig = {
  Open: {
    label: 'Open',
    icon: Box,
    color: 'bg-blue-500 hover:bg-blue-500/90',
  },
  'In Progress': {
    label: 'In Progress',
    icon: Loader,
    color: 'bg-yellow-500 hover:bg-yellow-500/90',
  },
  Resolved: {
    label: 'Resolved',
    icon: CheckCircle2,
    color: 'bg-green-500 hover:bg-green-500/90',
  },
  Closed: {
    label: 'Closed',
    icon: Archive,
    color: 'bg-gray-500 hover:bg-gray-500/90',
  },
};

type StatusBadgeProps = {
  status: TicketStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={cn('gap-1.5 text-white', config.color)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}
