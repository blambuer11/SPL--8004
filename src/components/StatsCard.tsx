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
    <Card className="border-2 border-border bg-gradient-card hover:shadow-glow-lg hover:border-primary/30 transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-gradient-primary group-hover:shadow-button transition-all">
            <Icon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold glow-text">{value}</div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};
