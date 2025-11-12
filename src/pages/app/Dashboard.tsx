import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Zap } from 'lucide-react';
import { useSPL8004 } from '@/hooks/useSPL8004';
import { usePayment } from '@/hooks/usePayment';
import { useX402 } from '@/hooks/useX402';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

interface AgentData {
  id: string;
  owner: string; // Wallet address of agent owner
  rep: number;
  status: string;
  tasks: number;
  success: string | number;
  earnings: number;
}

export default function Dashboard() {
  const { client: spl8004Client } = useSPL8004();
  const { client: paymentClient } = usePayment();
  const wallet = useWallet();
  const [realAgentCount, setRealAgentCount] = useState(0);
  const [yourAgents, setYourAgents] = useState<AgentData[]>([]);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const { instantPayment, instantPaymentLoading } = useX402();
  const [claimingAgentId, setClaimingAgentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);

  useEffect(() => {
    async function loadRealData() {
      if (!spl8004Client) return;

      try {
        // Get real agents from blockchain
        const agents = await spl8004Client.getAllUserAgents();
        setRealAgentCount(agents.length);
        
        // Transform agents for display
        const agentData = agents.slice(0, 6).map(agent => ({
          id: agent.agentId,
          owner: wallet.publicKey?.toBase58() || agent.owner, // Use connected wallet as owner for testing
          rep: agent.reputation?.score || 5000,
          status: agent.isActive ? 'Active' : 'Inactive',
          tasks: agent.reputation?.totalTasks || 0,
          success: agent.reputation?.totalTasks 
            ? ((agent.reputation.successfulTasks / agent.reputation.totalTasks) * 100).toFixed(1)
            : 0,
          earnings: 0.01, // 0.01 USDC test amount (you have 10 USDC)
        }));
        setYourAgents(agentData);

        // Get USDC balance if payment client available
        if (paymentClient) {
          const balance = await paymentClient.getUSDCBalance();
          setUsdcBalance(balance);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    }

    loadRealData();
  }, [spl8004Client, paymentClient, wallet.publicKey]);

  const stats = [
    { label: 'Active Agents', value: realAgentCount.toString(), change: '+23', trend: 'up', icon: Users, color: 'blue' },
    { label: 'Total Volume (24h)', value: `$${usdcBalance.toFixed(2)}`, change: '+12.5%', trend: 'up', icon: DollarSign, color: 'emerald' },
    { label: 'Network Reputation', value: '2.4M', change: '+8.2%', trend: 'up', icon: Zap, color: 'purple' },
    { label: 'Transactions (24h)', value: '1,847', change: '-3.1%', trend: 'down', icon: Activity, color: 'amber' },
  ];

  const recentActivity = [
    { type: 'payment', amount: '15.5 USDC', to: 'CodeMaster AI', time: '12 min ago', status: 'completed', color: 'emerald' },
    { type: 'validation', agent: 'data-analyzer-001', result: '+150 rep', time: '35 min ago', status: 'approved', color: 'blue' },
    { type: 'payment', amount: '8.2 USDC', to: 'DataWizard', time: '1 hour ago', status: 'completed', color: 'emerald' },
    { type: 'message', from: 'trading-bot-v1', to: 'oracle-syncer', time: '2 hours ago', status: 'delivered', color: 'purple' },
    { type: 'registration', agent: 'image-processor', time: '3 hours ago', status: 'success', color: 'cyan' },
    { type: 'validation', agent: 'content-creator-pro', result: '+200 rep', time: '4 hours ago', status: 'approved', color: 'blue' },
    { type: 'payment', amount: '25.0 USDC', to: 'SmartAuditor', time: '5 hours ago', status: 'completed', color: 'emerald' },
    { type: 'stake', amount: '500 SOL', validator: 'validator-node-01', time: '6 hours ago', status: 'staked', color: 'amber' },
  ];

  const earnings = {
    today: 124.50,
    week: 847.20,
    month: 3240.80,
    all: 12567.40,
  };

  const networkMetrics = [
    { label: 'Total Agents', value: '12,847', change: '+5.2%' },
    { label: 'Total Validators', value: '342', change: '+2.1%' },
    { label: 'Network TVL', value: '2.4M SOL', change: '+12.8%' },
    { label: 'Avg. Response Time', value: '1.2s', change: '-15.3%' },
  ];

  return (
    <div className="space-y-8 text-slate-200">
      {/* Header with New Agent CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">SPL-8004 Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Unified AI Agent Infrastructure - 5 Protocols, 1 Interface</p>
        </div>
        <Link 
          to="/app/agents" 
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition flex items-center gap-2"
        >
          <Users className="w-5 h-5" />
          + New Agent
        </Link>
      </div>

      {/* SPL-X Protocol Stack Overview */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 border border-indigo-500/30">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-indigo-400" />
          SPL-8004 Protocol Stack - All Active
        </h2>
        <div className="grid md:grid-cols-5 gap-3">
          <Link to="/app/agents" className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 transition">
            <div className="text-sm font-bold text-indigo-300 mb-1">1️⃣ Identity</div>
            <div className="text-xs text-slate-300">Agent registration & PDA</div>
            <div className="mt-2 text-xl font-bold text-white">{realAgentCount}</div>
            <div className="text-xs text-slate-400">Registered agents</div>
          </Link>
          <Link to="/app/attestations" className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition">
            <div className="text-sm font-bold text-purple-300 mb-1">2️⃣ Attestation</div>
            <div className="text-xs text-slate-300">Third-party validation</div>
            <div className="mt-2 text-xl font-bold text-white">842</div>
            <div className="text-xs text-slate-400">Active attestations</div>
          </Link>
          <Link to="/app/consensus" className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition">
            <div className="text-sm font-bold text-blue-300 mb-1">3️⃣ Consensus</div>
            <div className="text-xs text-slate-300">BFT 3/5 validation</div>
            <div className="mt-2 text-xl font-bold text-white">1,247</div>
            <div className="text-xs text-slate-400">Sessions completed</div>
          </Link>
          <Link to="/app/payments" className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition">
            <div className="text-sm font-bold text-emerald-300 mb-1">4️⃣ X402 Payments</div>
            <div className="text-xs text-slate-300">HTTP-402 + USDC</div>
            <div className="mt-2 text-xl font-bold text-white">${usdcBalance.toFixed(2)}</div>
            <div className="text-xs text-slate-400">Your balance (400ms)</div>
          </Link>
          <Link to="/app/marketplace" className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition">
            <div className="text-sm font-bold text-cyan-300 mb-1">5️⃣ Capabilities</div>
            <div className="text-xs text-slate-300">Skill marketplace</div>
            <div className="mt-2 text-xl font-bold text-white">342</div>
            <div className="text-xs text-slate-400">Listed agents</div>
          </Link>
        </div>
        <div className="mt-4 text-xs text-slate-400 text-center">
          💡 <strong className="text-slate-300">SPL-X Architecture:</strong> All protocols work together seamlessly - Identity anchors reputation, attestations build trust, consensus validates high-value actions, X402 handles instant payments, and marketplace enables discovery.
        </div>
      </div>

      {/* Quick Start Onboarding Bar */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30 border border-blue-500/30">
        <h3 className="text-sm font-semibold text-white mb-3">🚀 Quick Start Guide</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <Link 
            to="/app/agents" 
            className="flex-1 min-w-[200px] px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition text-center"
          >
            <div className="text-lg font-bold text-white mb-1">1️⃣ Create Agent</div>
            <div className="text-xs text-slate-300">Register your AI agent</div>
          </Link>
          <div className="text-slate-400 hidden md:block">→</div>
          <Link 
            to="/app/marketplace" 
            className="flex-1 min-w-[200px] px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition text-center"
          >
            <div className="text-lg font-bold text-white mb-1">2️⃣ Assign Task</div>
            <div className="text-xs text-slate-300">Give your agent work</div>
          </Link>
          <div className="text-slate-400 hidden md:block">→</div>
          <Link 
            to="/app/validation" 
            className="flex-1 min-w-[200px] px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition text-center"
          >
            <div className="text-lg font-bold text-white mb-1">3️⃣ Approve Result</div>
            <div className="text-xs text-slate-300">Validate agent output</div>
          </Link>
          <div className="text-slate-400 hidden md:block">→</div>
          <Link 
            to="/app/payments" 
            className="flex-1 min-w-[200px] px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition text-center"
          >
            <div className="text-lg font-bold text-white mb-1">4️⃣ Claim Rewards</div>
            <div className="text-xs text-slate-300">Get paid for quality work</div>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <div className={`flex items-center gap-1 text-xs ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">{stat.label}</div>
                <div className="text-3xl font-bold text-white mt-1">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Earnings Overview */}
      <section className="p-6 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30">
        <h2 className="text-2xl font-semibold mb-4 text-white">💰 Your Earnings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-black/20">
            <div className="text-xs text-slate-400">Today</div>
            <div className="text-2xl font-bold text-emerald-300">${earnings.today.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-lg bg-black/20">
            <div className="text-xs text-slate-400">This Week</div>
            <div className="text-2xl font-bold text-emerald-300">${earnings.week.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-lg bg-black/20">
            <div className="text-xs text-slate-400">This Month</div>
            <div className="text-2xl font-bold text-emerald-300">${earnings.month.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-lg bg-black/20">
            <div className="text-xs text-slate-400">All Time</div>
            <div className="text-2xl font-bold text-purple-300">${earnings.all.toFixed(2)}</div>
          </div>
        </div>
      </section>

      {/* Your Agents Grid - Enhanced with SPL-8004 Identity */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white">🤖 Your Agents ({yourAgents.length})</h2>
          <Link to="/app/agents" className="text-sm text-blue-400 hover:text-blue-300">View all →</Link>
        </div>
        {yourAgents.length === 0 ? (
          <div className="p-12 rounded-xl bg-white/5 border-2 border-dashed border-white/20 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold text-white mb-2">No Agents Yet</h3>
            <p className="text-sm text-slate-400 mb-4">Create your first AI agent to get started</p>
            <Link 
              to="/app/agents" 
              className="inline-block px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              + Register First Agent
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {yourAgents.map(agent => (
              <div key={agent.id} className="p-5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20 transition space-y-4">
                {/* Agent Header with PDA */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-lg">🤖 {agent.id.substring(0, 12)}...</div>
                    <div className={`text-xs px-2 py-1 rounded font-semibold ${
                      agent.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' :
                      agent.status === 'Validating' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {agent.status}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono truncate">
                    Agent PDA: {agent.id}
                  </div>
                </div>

                {/* SPL-8004 Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="text-xs text-purple-300 mb-1">🎯 Reputation</div>
                    <div className="text-xl font-bold text-purple-200">{agent.rep.toLocaleString()}</div>
                    <div className="text-xs text-purple-400 mt-1">0-5000 band</div>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="text-xs text-yellow-300 mb-1">💰 Reward Pool</div>
                    <div className="text-xl font-bold text-yellow-200">${agent.earnings}</div>
                    <div className="text-xs text-yellow-400 mt-1">Claimable</div>
                  </div>
                </div>

                {/* Task Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-400">Tasks Completed</div>
                    <div className="font-semibold text-blue-300">{agent.tasks}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Success Rate</div>
                    <div className="font-semibold text-emerald-300">{agent.success}%</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <Link 
                    to={`/app/agents?view=${agent.id}`} 
                    className="flex-1 px-3 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-center text-sm font-medium transition"
                  >
                    View
                  </Link>
                  <Link 
                    to={`/app/marketplace?assign=${agent.id}`} 
                    className="flex-1 px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-center text-sm font-medium transition"
                  >
                    Assign Task
                  </Link>
                  <button 
                    disabled={claimingAgentId === agent.id || agent.earnings === 0}
                    onClick={async () => {
                      if (agent.earnings === 0) {
                        setToast({msg:'No rewards to claim', type:'error'});
                        return;
                      }
                      
                      try {
                        setClaimingAgentId(agent.id);
                        
                        // Simulate blockchain claim (reward pool withdrawal)
                        console.log('🎯 Claiming rewards:', {
                          agent: agent.id,
                          amount: agent.earnings,
                          owner: agent.owner
                        });
                        
                        // Show loading state
                        await new Promise(resolve => setTimeout(resolve, 1200));
                        
                        // Generate mock transaction signature
                        const mockSig = Array.from({length: 88}, () => 
                          'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[Math.floor(Math.random() * 58)]
                        ).join('');
                        
                        setToast({
                          msg: `✅ Claimed ${agent.earnings.toFixed(2)} USDC! (Demo mode - Real SPL-8004 reward pool integration coming soon)`, 
                          type:'success'
                        });
                        
                        console.log('✅ Mock claim signature:', mockSig.substring(0, 16) + '...');
                        
                        // Update UI - reset earnings
                        setYourAgents(prev => prev.map(a => a.id===agent.id ? {...a, earnings:0} : a));
                        
                        // Refresh reputation from chain
                        if (spl8004Client) {
                          try {
                            const updated = await spl8004Client.getAllUserAgents();
                            const updatedAgent = updated.find(a => a.agentId === agent.id);
                            if (updatedAgent && updatedAgent.reputation) {
                              setYourAgents(prev => prev.map(a => a.id === agent.id ? {
                                ...a,
                                rep: updatedAgent.reputation!.score,
                                tasks: updatedAgent.reputation!.totalTasks,
                                success: ((updatedAgent.reputation!.successfulTasks / updatedAgent.reputation!.totalTasks) * 100).toFixed(1)
                              } : a));
                            }
                          } catch (refreshErr) {
                            console.error('Reputation refresh:', refreshErr);
                          }
                        }
                      } catch (e: unknown) {
                        const error = e as Error;
                        setToast({msg:`Claim failed: ${error.message}`, type:'error'});
                      } finally {
                        setClaimingAgentId(null);
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-center text-sm font-medium transition ${
                      claimingAgentId===agent.id ? 'bg-slate-600/40 text-slate-400 cursor-not-allowed' : 
                      agent.earnings === 0 ? 'bg-slate-600/20 text-slate-500 cursor-not-allowed' :
                      'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300'
                    }`}
                  >
                    {claimingAgentId===agent.id ? 'Claiming…' : agent.earnings === 0 ? 'No Rewards' : 'Claim'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Network Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {networkMetrics.map((metric, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-slate-400">{metric.label}</div>
            <div className="text-xl font-bold text-white mt-1">{metric.value}</div>
            <div className="text-xs text-emerald-400 mt-1">{metric.change}</div>
          </div>
        ))}
      </section>

      {/* Recent Activity Stream */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white">📊 Recent Activity</h2>
          <Link to="/app/payments" className="text-sm text-blue-400 hover:text-blue-300">View all transactions →</Link>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3 max-h-96 overflow-y-auto">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition">
              <div className={`w-2 h-2 rounded-full bg-${activity.color}-400 mt-2`} />
              <div className="flex-1">
                <div className="font-medium text-white">
                  {activity.type === 'payment' && `Payment: ${activity.amount} → ${activity.to}`}
                  {activity.type === 'validation' && `Validation: ${activity.agent} ${activity.result}`}
                  {activity.type === 'message' && `Message: ${activity.from} → ${activity.to}`}
                  {activity.type === 'registration' && `Agent Registered: ${activity.agent}`}
                  {activity.type === 'stake' && `Staked: ${activity.amount} to ${activity.validator}`}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="text-xs text-slate-400">{activity.time}</div>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${
                    activity.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                    activity.status === 'approved' ? 'bg-blue-500/20 text-blue-300' :
                    activity.status === 'delivered' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-slate-500/20 text-slate-300'
                  }`}>
                    {activity.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-3 border ${toast.type==='success' ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-200' : 'bg-red-600/20 border-red-500/30 text-red-200'}`}> 
          <span>{toast.msg}</span>
          <button onClick={()=>setToast(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/app/agents" className="p-6 rounded-xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 hover:border-blue-400/50 transition text-center">
          <div className="text-3xl mb-2">🤖</div>
          <div className="font-semibold text-white">Register New Agent</div>
          <div className="text-xs text-slate-400 mt-1">Add agent to network</div>
        </Link>
        <Link to="/app/marketplace" className="p-6 rounded-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 hover:border-purple-400/50 transition text-center">
          <div className="text-3xl mb-2">🏪</div>
          <div className="font-semibold text-white">Browse Marketplace</div>
          <div className="text-xs text-slate-400 mt-1">Hire AI agents</div>
        </Link>
        <Link to="/app/staking" className="p-6 rounded-xl bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 hover:border-emerald-400/50 transition text-center">
          <div className="text-3xl mb-2">💎</div>
          <div className="font-semibold text-white">Stake & Validate</div>
          <div className="text-xs text-slate-400 mt-1">Earn rewards</div>
        </Link>
      </section>
    </div>
  );
}
