import { useState, useEffect, useCallback, useRef, type ComponentProps } from 'react';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { Input } from '@/components/ui/input';
import { AgentCard } from '@/components/AgentCard';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { usePreferences } from '@/hooks/usePreferences';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function Agents() {
  const { client, connected, publicKey } = useSPL8004();
  const [searchQuery, setSearchQuery] = useState('');
  type Agent = ComponentProps<typeof AgentCard> & { updatedAt?: number };
  type NetworkAgent = {
    agentId: string;
    owner: string;
    metadataUri: string;
    isActive: boolean;
    score?: number;
    totalTasks?: number;
    successfulTasks?: number;
    failedTasks?: number;
    updatedAt?: number;
  };
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ownerFilter, setOwnerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'active'|'inactive'>('all');
  const [minScore, setMinScore] = useState<number | ''>('');
  const [maxScore, setMaxScore] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'scoreDesc'|'scoreAsc'|'recent'>('scoreDesc');
  const [onlyTrusted, setOnlyTrusted] = useState(false);
  const statusValues = ['all','active','inactive'] as const;
  type Status = typeof statusValues[number];
  const isStatus = (v: string): v is Status => (statusValues as readonly string[]).includes(v);
  const sortValues = ['scoreDesc','scoreAsc','recent'] as const;
  type Sort = typeof sortValues[number];
  const isSort = (v: string): v is Sort => (sortValues as readonly string[]).includes(v);

  const loadAgents = useCallback(async () => {
    if (!client) return;
    
    setLoading(true);
    setError(null);
    try {
        const networkAgents = await client.getAllNetworkAgents();
        const list: NetworkAgent[] = Array.isArray(networkAgents) ? (networkAgents as NetworkAgent[]) : [];
        const mapped: Agent[] = list.map((a) => ({
          agentId: a.agentId,
          owner: a.owner,
          metadataUri: a.metadataUri,
          isActive: a.isActive,
          score: a.score ?? 5000,
          totalTasks: a.totalTasks ?? 0,
          successfulTasks: a.successfulTasks ?? 0,
          failedTasks: a.failedTasks ?? 0,
          updatedAt: typeof a.updatedAt === 'number' ? a.updatedAt : undefined,
        }));
        setAgents(mapped);
    } catch (error) {
      console.error('Error loading agents:', error);
      setError((error as Error)?.message || 'Failed to load agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
    }, [client]);

    useEffect(() => {
      loadAgents();
    }, [loadAgents]);

  // Show only real on-chain agents
  const { isFavorite, toggleFavorite, favorites, defaultAgentId, setDefaultAgentId, alertsEnabled, setAlertsEnabled, alertThreshold, setAlertThreshold } = usePreferences();
  const displayAgents = onlyTrusted ? agents.filter((a) => isFavorite(a.agentId)) : agents;

  // Alerts: keep last seen scores for favorites and notify on drop
  const lastScoresRef = useRef<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    // seed last scores on first load/update
    const map: Record<string, number> = { ...lastScoresRef.current };
    agents.forEach((a) => {
      map[a.agentId] = a.score ?? map[a.agentId] ?? 0;
    });
    lastScoresRef.current = map;
  }, [agents]);

  useEffect(() => {
    if (!alertsEnabled || favorites.length === 0 || !client) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        for (const id of favorites) {
          if (cancelled) break;
          const rep = await client.getReputation(id);
          if (!rep) continue;
          const prev = lastScoresRef.current[id] ?? rep.score;
          if (rep.score < prev && prev - rep.score >= alertThreshold) {
            toast({ title: `Score dropped: ${id}`, description: `Previous: ${prev} → New: ${rep.score}` });
          }
          lastScoresRef.current[id] = rep.score;
        }
      } catch {
        // ignore transient errors
      }
    }, 60000); // 60s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [alertsEnabled, alertThreshold, favorites, client, toast]);
  
  const filteredAgents = displayAgents
    .filter((agent) =>
      agent.agentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.owner.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((agent) => (ownerFilter ? agent.owner.toLowerCase().includes(ownerFilter.toLowerCase()) : true))
    .filter((agent) => (statusFilter === 'all' ? true : statusFilter === 'active' ? agent.isActive : !agent.isActive))
    .filter((agent) => (minScore !== '' ? (agent.score ?? 0) >= Number(minScore) : true))
    .filter((agent) => (maxScore !== '' ? (agent.score ?? 0) <= Number(maxScore) : true))
    .sort((a, b) => {
      if (sortBy === 'scoreDesc') return (b.score ?? 0) - (a.score ?? 0);
      if (sortBy === 'scoreAsc') return (a.score ?? 0) - (b.score ?? 0);
      // recently updated: higher updatedAt first
      const au = a.updatedAt ?? 0;
      const bu = b.updatedAt ?? 0;
      return bu - au;
    });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">AI Agents</h1>
          <p className="text-gray-600 text-sm">
            Explore all registered AI agents on the Noema network
          </p>
          <p className="text-xs text-gray-500 mt-1">Status: {loading ? 'Loading…' : 'Ready'} • Count: {agents.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
            disabled={!connected || !client}
            onClick={async () => {
              if (!client || !publicKey) return;
              try {
                const id = `demo-${publicKey.toBase58().slice(0,6)}-${Date.now()%1000}`;
                const sig = await client.registerAgent(id, 'https://example.com/metadata.json');
                console.log('register sig', sig);
                await loadAgents();
              } catch (e) {
                console.error('register demo failed', e);
              }
            }}
            title={!connected ? 'Connect wallet' : 'Register a sample agent on Devnet'}
          >
            Register Sample (Devnet)
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search agents by ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
          />
        </div>
      </div>

      <Card className="border border-gray-200 bg-white p-5 shadow-sm rounded-xl">
        <div className="grid md:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Owner</label>
            <Input
              placeholder="Owner pubkey..."
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-400 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
            <Select value={statusFilter} onValueChange={(v) => { if (isStatus(v)) setStatusFilter(v); }}>
              <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white text-sm">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Min Score</label>
            <Input
              type="number"
              min={0}
              max={10000}
              value={minScore}
              onChange={(e) => setMinScore(e.target.value === '' ? '' : Number(e.target.value))}
              className="bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-400 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Max Score</label>
            <Input
              type="number"
              min={0}
              max={10000}
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value === '' ? '' : Number(e.target.value))}
              className="bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-400 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Sort</label>
            <Select value={sortBy} onValueChange={(v) => { if (isSort(v)) setSortBy(v); }}>
              <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scoreDesc">Score (High → Low)</SelectItem>
                <SelectItem value="scoreAsc">Score (Low → High)</SelectItem>
                <SelectItem value="recent">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Only Trusted</label>
              <div className="h-9 px-3 py-2 border border-gray-200 rounded-lg flex items-center gap-2 bg-gray-50">
                <Switch checked={onlyTrusted} onCheckedChange={setOnlyTrusted} />
                <span className="text-sm text-gray-700">Trusted</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Default Agent (Routing)</label>
            <Select value={defaultAgentId ?? 'none'} onValueChange={(v) => setDefaultAgentId(v === 'none' ? null : v)}>
              <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white text-sm">
                <SelectValue placeholder="Select default agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.agentId} value={a.agentId}>{a.agentId}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Score Drop Alert</label>
            <div className="flex items-center gap-3">
              <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
              <span className="text-sm text-gray-700">Monitor favorites</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Threshold (points)</label>
            <Input
              type="number"
              min={1}
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value) || 1)}
              className="bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-400 transition-colors text-sm"
              disabled={!alertsEnabled}
            />
          </div>
        </div>
  </Card>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse border border-gray-200" />
          ))
        ) : filteredAgents.length > 0 ? (
          filteredAgents.map((agent) => (
            <AgentCard
              key={agent.agentId}
              {...agent}
              isFavorite={isFavorite(agent.agentId)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-sm">No agents found</p>
          </div>
        )}
      </div>
    </div>
  );
}
