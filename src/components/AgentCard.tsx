import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, ExternalLink } from 'lucide-react';

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
  return (
    <Card className="border-2 border-border bg-gradient-card hover:shadow-glow-lg hover:border-primary/30 transition-all group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-button">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="glow-text">{agentId}</span>
            </CardTitle>
            <CardDescription className="text-xs font-mono bg-muted px-2 py-1 rounded">
              {owner.slice(0, 12)}...{owner.slice(-12)}
            </CardDescription>
          </div>
          <Badge 
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-gradient-primary text-white border-0" : ""}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Reputation Score</span>
            <span className="font-bold text-xl glow-text">{score}/10000</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-primary h-3 rounded-full transition-all shadow-sm"
              style={{ width: `${(score / 10000) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-border">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold">{totalTasks}</div>
            <div className="text-xs text-muted-foreground font-medium">Total Tasks</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-success">{successfulTasks}</div>
            <div className="text-xs text-muted-foreground font-medium">Success</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-destructive">{failedTasks}</div>
            <div className="text-xs text-muted-foreground font-medium">Failed</div>
          </div>
        </div>

        {metadataUri && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-2 hover:bg-muted mt-2"
            onClick={() => window.open(metadataUri, '_blank')}
          >
            View Metadata
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
