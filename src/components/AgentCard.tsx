import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, ExternalLink, Star } from 'lucide-react';
import { SponsorDialog } from '@/components/SponsorDialog';

interface AgentCardProps {
  agentId: string;
  owner: string;
  score: number;
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  isActive: boolean;
  metadataUri?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (agentId: string) => void;
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
  isFavorite = false,
  onToggleFavorite,
}: AgentCardProps) => {
  return (
    <Card className="border border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-200 group rounded-xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="p-2 bg-gray-900 rounded-lg">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-900 font-semibold">{agentId}</span>
            </CardTitle>
            <CardDescription className="text-xs font-mono bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200">
              {owner.slice(0, 12)}...{owner.slice(-12)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={isFavorite ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}
              onClick={() => onToggleFavorite?.(agentId)}
              title={isFavorite ? "Remove from trusted" : "Add to trusted"}
            >
              <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-500" : ""}`} />
            </Button>
            <Badge 
              className={isActive ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100" : "bg-gray-100 text-gray-600 border-gray-200"}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium text-xs">Reputation Score</span>
            <span className="font-bold text-lg text-gray-900">{score}/10000</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gray-900 h-2 rounded-full transition-all"
              style={{ width: `${(score / 10000) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center space-y-1">
            <div className="text-xl font-bold text-gray-900">{totalTasks}</div>
            <div className="text-xs text-gray-500 font-medium">Total Tasks</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-xl font-bold text-green-600">{successfulTasks}</div>
            <div className="text-xs text-gray-500 font-medium">Success</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-xl font-bold text-red-600">{failedTasks}</div>
            <div className="text-xs text-gray-500 font-medium">Failed</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {metadataUri ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full border border-gray-200 hover:bg-gray-50 mt-2 text-gray-700 text-xs"
              onClick={() => window.open(metadataUri, '_blank')}
            >
              View Metadata
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div />
          )}
          <SponsorDialog
            agentId={agentId}
            trigger={
              <Button variant="default" size="sm" className="w-full mt-2 bg-gray-900 hover:bg-gray-800 text-white text-xs">Sponsor</Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};
