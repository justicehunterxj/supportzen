import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Stat } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function StatCard({ title, value, icon: Icon, change, changeType }: Stat) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn(
            "text-xs text-muted-foreground flex items-center gap-1",
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          )}>
            {changeType === 'increase' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
