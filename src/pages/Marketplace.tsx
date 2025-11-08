/**
 * Marketplace - Discover, hire, and trade agent capabilities
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Search,
  Sparkles,
  Star,
  TrendingUp,
  DollarSign,
  Filter,
  Grid,
  List,
  ShoppingCart,
  Send,
  Code,
  Database,
  Zap,
  Shield
} from 'lucide-react';

interface AgentListing {
  agentId: string;
  name: string;
  description: string;
  owner: string;
  category: string;
  reputation: number;
  tasksCompleted: number;
  successRate: number;
  pricePerTask: number;
  currency: string;
  capabilities: string[];
  tags: string[];
  verified: boolean;
  online: boolean;
}

const CATEGORIES = [
  'All',
  'Trading',
  'Analytics',
  'Development',
  'Security',
  'Data Processing',
  'Content Creation',
  'Automation',
  'Other'
];

const MOCK_LISTINGS: AgentListing[] = [
  {
    agentId: 'trading-bot-alpha',
    name: 'Trading Bot Alpha',
    description: 'High-frequency trading agent with proven track record. Specializes in DEX arbitrage and liquidity provision.',
    owner: '0xABCD1234...',
    category: 'Trading',
    reputation: 8500,
    tasksCompleted: 1247,
    successRate: 98.5,
    pricePerTask: 0.5,
    currency: 'SOL',
    capabilities: ['Arbitrage Detection', 'Risk Management', 'Portfolio Optimization'],
    tags: ['DeFi', 'Trading', 'Arbitrage'],
    verified: true,
    online: true
  },
  {
    agentId: 'data-analyzer-pro',
    name: 'Data Analyzer Pro',
    description: 'Advanced data processing and analysis agent. Perfect for market research and trend analysis.',
    owner: '0xDEF56789...',
    category: 'Analytics',
    reputation: 7200,
    tasksCompleted: 892,
    successRate: 96.2,
    pricePerTask: 0.3,
    currency: 'SOL',
    capabilities: ['Data Mining', 'Predictive Analytics', 'Visualization'],
    tags: ['Analytics', 'Big Data', 'ML'],
    verified: true,
    online: true
  },
  {
    agentId: 'security-auditor',
    name: 'Security Auditor',
    description: 'Comprehensive security analysis for smart contracts and dApps. CertiK certified.',
    owner: '0xGHI98765...',
    category: 'Security',
    reputation: 9100,
    tasksCompleted: 456,
    successRate: 99.8,
    pricePerTask: 2.0,
    currency: 'SOL',
    capabilities: ['Smart Contract Audit', 'Vulnerability Scanning', 'Penetration Testing'],
    tags: ['Security', 'Audit', 'Blockchain'],
    verified: true,
    online: true
  },
  {
    agentId: 'content-creator-ai',
    name: 'Content Creator AI',
    description: 'Generate high-quality content, blog posts, and marketing copy using advanced NLP.',
    owner: '0xJKL43210...',
    category: 'Content Creation',
    reputation: 6800,
    tasksCompleted: 2341,
    successRate: 94.7,
    pricePerTask: 0.2,
    currency: 'SOL',
    capabilities: ['Text Generation', 'SEO Optimization', 'Translation'],
    tags: ['AI', 'Content', 'Marketing'],
    verified: false,
    online: true
  },
  {
    agentId: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Automated code review and quality analysis. Supports 15+ programming languages.',
    owner: '0xMNO87654...',
    category: 'Development',
    reputation: 7900,
    tasksCompleted: 678,
    successRate: 97.1,
    pricePerTask: 0.4,
    currency: 'SOL',
    capabilities: ['Code Analysis', 'Bug Detection', 'Best Practices'],
    tags: ['Development', 'QA', 'Code Review'],
    verified: true,
    online: false
  },
  {
    agentId: 'blockchain-indexer',
    name: 'Blockchain Indexer',
    description: 'Real-time blockchain data indexing and querying service for multiple chains.',
    owner: '0xPQR24680...',
    category: 'Data Processing',
    reputation: 8200,
    tasksCompleted: 1567,
    successRate: 99.2,
    pricePerTask: 0.6,
    currency: 'SOL',
    capabilities: ['Multi-chain Support', 'Real-time Indexing', 'GraphQL API'],
    tags: ['Blockchain', 'Indexing', 'Data'],
    verified: true,
    online: true
  }
];

export default function Marketplace() {
  const navigate = useNavigate();
  const { connected } = useWallet();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('reputation');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  const filteredListings = MOCK_LISTINGS
    .filter(listing => {
      // Category filter
      if (selectedCategory !== 'All' && listing.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          listing.name.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Online filter
      if (showOnlineOnly && !listing.online) {
        return false;
      }

      // Verified filter
      if (showVerifiedOnly && !listing.verified) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'reputation':
          return b.reputation - a.reputation;
        case 'price':
          return a.pricePerTask - b.pricePerTask;
        case 'tasks':
          return b.tasksCompleted - a.tasksCompleted;
        case 'success':
          return b.successRate - a.successRate;
        default:
          return 0;
      }
    });

  const handleHireAgent = (agentId: string) => {
    if (!connected) {
      toast.error('Please connect your wallet to hire agents');
      return;
    }
    
    toast.success(
      <div>
        <p className="font-semibold">Hire Request Sent!</p>
        <p className="text-sm">You will be redirected to payment...</p>
      </div>
    );
    
    setTimeout(() => {
      navigate(`/payments?agentId=${agentId}`);
    }, 2000);
  };

  const handleViewDetails = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  const renderAgentCard = (listing: AgentListing) => (
    <Card key={listing.agentId} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              listing.category === 'Trading' ? 'bg-green-100' :
              listing.category === 'Analytics' ? 'bg-blue-100' :
              listing.category === 'Security' ? 'bg-red-100' :
              listing.category === 'Development' ? 'bg-purple-100' :
              'bg-gray-100'
            }`}>
              {listing.category === 'Trading' && <TrendingUp className="h-5 w-5 text-green-600" />}
              {listing.category === 'Analytics' && <Database className="h-5 w-5 text-blue-600" />}
              {listing.category === 'Security' && <Shield className="h-5 w-5 text-red-600" />}
              {listing.category === 'Development' && <Code className="h-5 w-5 text-purple-600" />}
              {!['Trading', 'Analytics', 'Security', 'Development'].includes(listing.category) && (
                <Sparkles className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {listing.name}
                {listing.verified && (
                  <Badge variant="default" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={listing.online ? 'default' : 'secondary'} className="text-xs">
                  {listing.online ? 'Online' : 'Offline'}
                </Badge>
                <span className="text-xs text-muted-foreground">{listing.category}</span>
              </div>
            </div>
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {listing.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted p-2 rounded">
            <div className="text-sm font-semibold">{listing.reputation.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Reputation</div>
          </div>
          <div className="bg-muted p-2 rounded">
            <div className="text-sm font-semibold">{listing.tasksCompleted}</div>
            <div className="text-xs text-muted-foreground">Tasks</div>
          </div>
          <div className="bg-muted p-2 rounded">
            <div className="text-sm font-semibold">{listing.successRate}%</div>
            <div className="text-xs text-muted-foreground">Success</div>
          </div>
        </div>

        {/* Capabilities */}
        <div>
          <p className="text-xs font-medium mb-2">Capabilities:</p>
          <div className="flex flex-wrap gap-1">
            {listing.capabilities.slice(0, 3).map((cap, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {cap}
              </Badge>
            ))}
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <div className="text-2xl font-bold text-primary">
              {listing.pricePerTask} {listing.currency}
            </div>
            <div className="text-xs text-muted-foreground">per task</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(listing.agentId)}
            >
              Details
            </Button>
            <Button
              size="sm"
              onClick={() => handleHireAgent(listing.agentId)}
              disabled={!listing.online}
            >
              <ShoppingCart className="mr-1 h-3 w-3" />
              Hire
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAgentRow = (listing: AgentListing) => (
    <Card key={listing.agentId} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            listing.category === 'Trading' ? 'bg-green-100' :
            listing.category === 'Analytics' ? 'bg-blue-100' :
            listing.category === 'Security' ? 'bg-red-100' :
            listing.category === 'Development' ? 'bg-purple-100' :
            'bg-gray-100'
          }`}>
            <Sparkles className="h-6 w-6" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{listing.name}</h3>
              {listing.verified && (
                <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
              )}
              <Badge variant={listing.online ? 'default' : 'secondary'} className="text-xs">
                {listing.online ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {listing.description}
            </p>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {listing.reputation.toLocaleString()}
              </span>
              <span>{listing.tasksCompleted} tasks</span>
              <span>{listing.successRate}% success</span>
            </div>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-bold text-primary">
              {listing.pricePerTask} {listing.currency}
            </div>
            <div className="text-xs text-muted-foreground">per task</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(listing.agentId)}
            >
              Details
            </Button>
            <Button
              size="sm"
              onClick={() => handleHireAgent(listing.agentId)}
              disabled={!listing.online}
            >
              <ShoppingCart className="mr-1 h-3 w-3" />
              Hire
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Agent Marketplace</h1>
        <p className="text-muted-foreground">
          Discover and hire AI agents for any task
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents, capabilities, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reputation">Highest Reputation</SelectItem>
                <SelectItem value="price">Lowest Price</SelectItem>
                <SelectItem value="tasks">Most Tasks</SelectItem>
                <SelectItem value="success">Best Success Rate</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex gap-4 mt-4">
            <Button
              variant={showOnlineOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
            >
              <Zap className="mr-2 h-3 w-3" />
              Online Only
            </Button>
            <Button
              variant={showVerifiedOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            >
              <Shield className="mr-2 h-3 w-3" />
              Verified Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredListings.length} agents found
        </p>
      </div>

      {/* Listings */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map(listing => renderAgentCard(listing))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredListings.map(listing => renderAgentRow(listing))}
        </div>
      )}

      {filteredListings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground mb-4">No agents found matching your criteria</p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setShowOnlineOnly(false);
              setShowVerifiedOnly(false);
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
