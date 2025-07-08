'use client';

import { Badge } from '@/components/ui/badge';
import type { ShiftStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

const statusConfig = {
  Pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-500 hover:bg-yellow-500/90',
  },
  Active: {
    label: 'Active',
    icon: PlayCircle,
    color: 'bg-green-500 hover:bg-green-500/90',
  },
  Completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'bg-gray-500 hover:bg-gray-500/90',
  },
};

type ShiftStatusBadgeProps = {
  status: ShiftStatus;
};

export function ShiftStatusBadge({ status }: ShiftStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={cn('gap-1.5 text-white', config.color)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}
