import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, TrendingUp, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

interface AgentCardProps {
  agentId: string;
  owner: string;
  score: number;
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  isActive: boolean;
  metadataUri?: string;
}

export const AgentCard = ({
  agentId,
  owner,
  score,
  totalTasks,
  successfulTasks,
  failedTasks,
  isActive,
  metadataUri,
}: AgentCardProps) => {
  const successRate = totalTasks > 0 ? ((successfulTasks / totalTasks) * 100).toFixed(1) : '0';
  
  const getScoreColor = (score: number) => {
    if (score >= 9000) return 'text-accent';
    if (score >= 7000) return 'text-success';
    if (score >= 5000) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 9000) return 'Elite';
    if (score >= 7000) return 'Expert';
    if (score >= 5000) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <Card className="group hover:shadow-glow transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-primary group-hover:animate-pulse-glow">
              <Cpu className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{agentId}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {owner.slice(0, 4)}...{owner.slice(-4)}
              </p>
            </div>
          </div>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Reputation Score</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getScoreColor(score)}>
              {getScoreBadge(score)}
            </Badge>
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
          </div>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-primary transition-all duration-500"
            style={{ width: `${(score / 10000) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">Total</span>
            </div>
            <p className="text-lg font-bold">{totalTasks}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-success/10">
            <div className="flex items-center justify-center gap-1 text-success mb-1">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-xs">Success</span>
            </div>
            <p className="text-lg font-bold text-success">{successfulTasks}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-destructive/10">
            <div className="flex items-center justify-center gap-1 text-destructive mb-1">
              <XCircle className="h-3 w-3" />
              <span className="text-xs">Failed</span>
            </div>
            <p className="text-lg font-bold text-destructive">{failedTasks}</p>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Success Rate</span>
            <span className="font-bold text-success">{successRate}%</span>
          </div>
        </div>

        {metadataUri && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open(metadataUri, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Metadata
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
