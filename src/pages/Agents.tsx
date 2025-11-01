import { useState, useEffect, type ComponentProps } from 'react';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AgentCard } from '@/components/AgentCard';
import { Search, Filter } from 'lucide-react';

export default function Agents() {
  const { client } = useSPL8004();
  const [searchQuery, setSearchQuery] = useState('');
  type Agent = ComponentProps<typeof AgentCard>;
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAgents();
  }, [client]);

  const loadAgents = async () => {
    if (!client) return;
    
    setLoading(true);
    try {
      // Load mock data for development
      const mockData = client.getMockAgentData();
      setAgents(mockData);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Expanded mock data for display
  const mockAgents = [
    {
      agentId: 'ai-trader-001',
      owner: '7kNhGxL5GVs3F8mPQdKvBfJc2x9Y4tA8W3nR5eM6zDqP',
      score: 8750,
      totalTasks: 150,
      successfulTasks: 142,
      failedTasks: 8,
      isActive: true,
      metadataUri: 'https://arweave.net/example1',
    },
    {
      agentId: 'data-analyst-pro',
      owner: '9mNhGxL5GVs3F8mPQdKvBfJc2x9Y4tA8W3nR5eM6zDqX',
      score: 7200,
      totalTasks: 89,
      successfulTasks: 78,
      failedTasks: 11,
      isActive: true,
      metadataUri: 'https://arweave.net/example2',
    },
    {
      agentId: 'nft-curator',
      owner: '5kNhGxL5GVs3F8mPQdKvBfJc2x9Y4tA8W3nR5eM6zDqZ',
      score: 6100,
      totalTasks: 45,
      successfulTasks: 32,
      failedTasks: 13,
      isActive: true,
      metadataUri: 'https://arweave.net/example3',
    },
  ];

  // Use loaded agents if available, otherwise use mock data
  const displayAgents = agents.length > 0 ? agents : mockAgents;
  
  const filteredAgents = displayAgents.filter(
    (agent) =>
      agent.agentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold glow-text mb-2">AI Agents</h1>
        <p className="text-muted-foreground">
          Explore all registered AI agents on the SPL-8004 network
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search agents by ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border/50"
          />
        </div>
        <Button variant="outline" className="border-border/50">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.length > 0 ? (
          filteredAgents.map((agent) => (
            <AgentCard key={agent.agentId} {...agent} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No agents found</p>
          </div>
        )}
      </div>
    </div>
  );
}
