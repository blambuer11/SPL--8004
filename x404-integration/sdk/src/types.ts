export interface MarketStats {
  totalAgents: number;
  totalVolume: number;
  activeListings: number;
  avgFloorPrice: number;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
  buyer: string;
  seller: string;
}

export interface AgentPortfolio {
  ownedAgents: string[];
  totalValue: number;
  totalRewards: number;
}
