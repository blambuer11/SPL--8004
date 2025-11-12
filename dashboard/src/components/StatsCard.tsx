import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export const StatsCard = ({ title, value, icon: Icon, description }: StatsCardProps) => {
  return (
    <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </CardTitle>
          <div className="p-2 rounded-lg border border-border bg-white">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-semibold text-foreground">{value}</div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};
