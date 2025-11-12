import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, TrendingUp, Activity, Users, CheckCircle, XCircle } from 'lucide-react';

export default function Analytics() {
  const { connected } = useWallet();
  const [agentStats, setAgentStats] = useState({ total: 0, active: 0, validators: 0 });
  const [validationStats, setValidationStats] = useState({ approved: 0, rejected: 0, pending: 0 });
  const [stakingStats, setStakingStats] = useState({ totalStaked: 0, stakers: 0, rewards: 0 });

  useEffect(() => {
    // Mock analytics data (replace with real queries later)
    setAgentStats({ total: 147, active: 89, validators: 23 });
    setValidationStats({ approved: 1243, rejected: 67, pending: 15 });
    setStakingStats({ totalStaked: 45678.9, stakers: 312, rewards: 1234.56 });
  }, [connected]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Network Analytics</h1>
        <p className="text-slate-400 mt-1">Real-time insights into SPL-8004 ecosystem activity</p>
      </div>

      {/* Agent Analytics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Agent Network
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Total Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{agentStats.total}</div>
              <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Active Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{agentStats.active}</div>
              <p className="text-xs text-slate-400 mt-1">
                {((agentStats.active / agentStats.total) * 100).toFixed(1)}% activity rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Validators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{agentStats.validators}</div>
              <p className="text-xs text-blue-400 mt-1">Active validators in network</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Validation Analytics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg">
          <Activity className="w-5 h-5 text-green-400" />
          Validation Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-900/60 to-green-800/40 border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{validationStats.approved.toLocaleString()}</div>
              <p className="text-xs text-green-300 mt-1">
                {((validationStats.approved / (validationStats.approved + validationStats.rejected)) * 100).toFixed(1)}% approval rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/60 to-red-800/40 border-red-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{validationStats.rejected.toLocaleString()}</div>
              <p className="text-xs text-red-300 mt-1">Quality enforcement active</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/60 to-amber-800/40 border-amber-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-300">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{validationStats.pending}</div>
              <p className="text-xs text-amber-300 mt-1">Awaiting validation</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Staking Analytics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart className="w-5 h-5 text-blue-400" />
          Staking Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Total Staked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stakingStats.totalStaked.toLocaleString()} SOL
              </div>
              <p className="text-xs text-blue-400 mt-1">Locked in validator staking</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Stakers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stakingStats.stakers}</div>
              <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8 this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Rewards Distributed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {stakingStats.rewards.toLocaleString()} SOL
              </div>
              <p className="text-xs text-purple-400 mt-1">Lifetime validator rewards</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trend Chart Placeholder */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Network Activity (7 Days)</CardTitle>
          <CardDescription>Agent registrations, validations, and staking events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <BarChart className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p>Chart visualization coming soon</p>
              <p className="text-sm mt-1">Integrate with Recharts or Chart.js</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Protocol Extension Stats */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Protocol Extensions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">SPL-ACP Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">42</div>
              <p className="text-xs text-purple-400 mt-1">Agents with declared capabilities</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">SPL-TAP Attestations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">18</div>
              <p className="text-xs text-green-400 mt-1">Verified tool attestations</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">SPL-FCP Consensus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">7</div>
              <p className="text-xs text-blue-400 mt-1">Active consensus requests</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

