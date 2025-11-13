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
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white">📊 Dashboard [UPDATED v2.0] 🚀</h1>
          <p className="text-sm text-slate-400">Unified AI Agent Infrastructure - 5 Protocols, 1 Interface</p>
          <div className="text-xs text-slate-500">Last updated: {new Date().toLocaleTimeString()}</div>
        </div>
        <Link
          to="/app/agents?create=1"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-purple-700"
        >
          <Users className="h-5 w-5" />
          + New Agent
        </Link>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <Zap className="h-6 w-6 text-indigo-400" />
              SPL-8004 Protocol Stack - All Active
            </h2>
            <div className="grid gap-3 md:grid-cols-5">
              <Link to="/app/agents" className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 transition hover:bg-indigo-500/20">
                <div className="mb-1 text-sm font-bold text-indigo-300">1️⃣ Identity</div>
                <div className="text-xs text-slate-300">Agent registration & PDA</div>
                <div className="mt-2 text-xl font-bold text-white">{realAgentCount}</div>
                <div className="text-xs text-slate-400">Registered agents</div>
              </Link>
              <Link to="/app/attestations" className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4 transition hover:bg-purple-500/20">
                <div className="mb-1 text-sm font-bold text-purple-300">2️⃣ Attestation</div>
                <div className="text-xs text-slate-300">Third-party validation</div>
                <div className="mt-2 text-xl font-bold text-white">842</div>
                <div className="text-xs text-slate-400">Active attestations</div>
              </Link>
              <Link to="/app/consensus" className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 transition hover:bg-blue-500/20">
                <div className="mb-1 text-sm font-bold text-blue-300">3️⃣ Consensus</div>
                <div className="text-xs text-slate-300">BFT 3/5 validation</div>
                <div className="mt-2 text-xl font-bold text-white">1,247</div>
                <div className="text-xs text-slate-400">Sessions completed</div>
              </Link>
              <Link to="/app/payments" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 transition hover:bg-emerald-500/20">
                <div className="mb-1 text-sm font-bold text-emerald-300">4️⃣ X402 Payments</div>
                <div className="text-xs text-slate-300">HTTP-402 + USDC</div>
                <div className="mt-2 text-xl font-bold text-white">${usdcBalance.toFixed(2)}</div>
                <div className="text-xs text-slate-400">Your balance (400ms)</div>
              </Link>
              <Link to="/app/marketplace" className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4 transition hover:bg-cyan-500/20">
                <div className="mb-1 text-sm font-bold text-cyan-300">5️⃣ Capabilities</div>
                <div className="text-xs text-slate-300">Skill marketplace</div>
                <div className="mt-2 text-xl font-bold text-white">342</div>
                <div className="text-xs text-slate-400">Listed agents</div>
              </Link>
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              💡 <strong className="text-slate-300">SPL-X Architecture:</strong> All protocols work together seamlessly - Identity anchors reputation, attestations build trust, consensus validates high-value actions, X402 handles instant payments, and marketplace enables discovery.
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="space-y-3 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-lg p-3 bg-${stat.color}-500/10`}>
                      <Icon className={`h-5 w-5 text-${stat.color}-400`} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                    <div className="mt-1 text-3xl font-bold text-white">{stat.value}</div>
                  </div>
                </div>
              );
            })}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">🤖 Your Agents ({yourAgents.length})</h2>
              <Link to="/app/agents" className="text-sm text-blue-400 transition hover:text-blue-300">View all →</Link>
            </div>
            {yourAgents.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <h3 className="mb-2 text-lg font-semibold text-white">No Agents Yet</h3>
                <p className="mb-4 text-sm text-slate-400">Create your first AI agent to get started</p>
                <Link
                  to="/app/agents"
                  className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  + Register First Agent
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {yourAgents.map(agent => (
                  <div key={agent.id} className="space-y-4 rounded-xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-5 transition hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-white">🤖 {agent.id.substring(0, 12)}...</div>
                        <div
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            agent.status === 'Active'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : agent.status === 'Validating'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-500/20 text-slate-300'
                          }`}
                        >
                          {agent.status}
                        </div>
                      </div>
                      <div className="truncate font-mono text-xs text-slate-400">Agent PDA: {agent.id}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
                        <div className="mb-1 text-xs text-purple-300">🎯 Reputation</div>
                        <div className="text-xl font-bold text-purple-200">{agent.rep.toLocaleString()}</div>
                        <div className="mt-1 text-xs text-purple-400">0-5000 band</div>
                      </div>
                      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                        <div className="mb-1 text-xs text-yellow-300">💰 Reward Pool</div>
                        <div className="text-xl font-bold text-yellow-200">${agent.earnings}</div>
                        <div className="mt-1 text-xs text-yellow-400">Claimable</div>
                      </div>
                    </div>

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

                    <div className="flex gap-2 border-t border-white/10 pt-2">
                      <Link
                        to={`/app/agents?view=${agent.id}`}
                        className="flex-1 rounded-lg bg-blue-600/20 px-3 py-2 text-center text-sm font-medium text-blue-300 transition hover:bg-blue-600/30"
                      >
                        View
                      </Link>
                      <Link
                        to={`/app/marketplace?assign=${agent.id}`}
                        className="flex-1 rounded-lg bg-purple-600/20 px-3 py-2 text-center text-sm font-medium text-purple-300 transition hover:bg-purple-600/30"
                      >
                        Assign Task
                      </Link>
                      <button
                        disabled={claimingAgentId === agent.id || agent.earnings === 0}
                        onClick={async () => {
                          if (agent.earnings === 0) {
                            setToast({ msg: 'No rewards to claim', type: 'error' });
                            return;
                          }

                          try {
                            setClaimingAgentId(agent.id);

                            // Simulate blockchain claim (reward pool withdrawal)
                            console.log('🎯 Claiming rewards:', {
                              agent: agent.id,
                              amount: agent.earnings,
                              owner: agent.owner,
                            });

                            await new Promise(resolve => setTimeout(resolve, 1200));

                            const mockSig = Array.from({ length: 88 }, () =>
                              'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[
                                Math.floor(Math.random() * 58)
                              ]
                            ).join('');

                            setToast({
                              msg: `✅ Claimed ${agent.earnings.toFixed(2)} USDC! (Demo mode - Real SPL-8004 reward pool integration coming soon)`,
                              type: 'success',
                            });

                            console.log('✅ Mock claim signature:', mockSig.substring(0, 16) + '...');

                            setYourAgents(prev => prev.map(a => (a.id === agent.id ? { ...a, earnings: 0 } : a)));

                            if (spl8004Client) {
                              try {
                                const updated = await spl8004Client.getAllUserAgents();
                                const updatedAgent = updated.find(a => a.agentId === agent.id);
                                if (updatedAgent && updatedAgent.reputation) {
                                  setYourAgents(prev =>
                                    prev.map(a =>
                                      a.id === agent.id
                                        ? {
                                            ...a,
                                            rep: updatedAgent.reputation!.score,
                                            tasks: updatedAgent.reputation!.totalTasks,
                                            success: (
                                              (updatedAgent.reputation!.successfulTasks /
                                                updatedAgent.reputation!.totalTasks) *
                                              100
                                            ).toFixed(1),
                                          }
                                        : a
                                    )
                                  );
                                }
                              } catch (refreshErr) {
                                console.error('Reputation refresh:', refreshErr);
                              }
                            }
                          } catch (e: unknown) {
                            const error = e as Error;
                            setToast({ msg: `Claim failed: ${error.message}`, type: 'error' });
                          } finally {
                            setClaimingAgentId(null);
                          }
                        }}
                        className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
                          claimingAgentId === agent.id
                            ? 'cursor-not-allowed bg-slate-600/40 text-slate-400'
                            : agent.earnings === 0
                              ? 'cursor-not-allowed bg-slate-600/20 text-slate-500'
                              : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                        }`}
                      >
                        {claimingAgentId === agent.id
                          ? 'Claiming…'
                          : agent.earnings === 0
                            ? 'No Rewards'
                            : 'Claim'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">📊 Recent Activity</h2>
              <Link to="/app/payments" className="text-sm text-blue-400 transition hover:text-blue-300">
                View all transactions →
              </Link>
            </div>
            <div className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-6">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-lg p-3 transition hover:bg-white/5">
                  <div className={`mt-2 h-2 w-2 rounded-full bg-${activity.color}-400`} />
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {activity.type === 'payment' && `Payment: ${activity.amount} → ${activity.to}`}
                      {activity.type === 'validation' && `Validation: ${activity.agent} ${activity.result}`}
                      {activity.type === 'message' && `Message: ${activity.from} → ${activity.to}`}
                      {activity.type === 'registration' && `Agent Registered: ${activity.agent}`}
                      {activity.type === 'stake' && `Staked: ${activity.amount} to ${activity.validator}`}
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="text-xs text-slate-400">{activity.time}</div>
                      <div
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          activity.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : activity.status === 'approved'
                              ? 'bg-blue-500/20 text-blue-300'
                              : activity.status === 'delivered'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-slate-500/20 text-slate-300'
                        }`}
                      >
                        {activity.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-6">
            <h2 className="mb-4 text-2xl font-semibold text-white">💰 Your Earnings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-black/20 p-4">
                <div className="text-xs text-slate-400">Today</div>
                <div className="text-2xl font-bold text-emerald-300">${earnings.today.toFixed(2)}</div>
              </div>
              <div className="rounded-lg bg-black/20 p-4">
                <div className="text-xs text-slate-400">This Week</div>
                <div className="text-2xl font-bold text-emerald-300">${earnings.week.toFixed(2)}</div>
              </div>
              <div className="rounded-lg bg-black/20 p-4">
                <div className="text-xs text-slate-400">This Month</div>
                <div className="text-2xl font-bold text-emerald-300">${earnings.month.toFixed(2)}</div>
              </div>
              <div className="rounded-lg bg-black/20 p-4">
                <div className="text-xs text-slate-400">All Time</div>
                <div className="text-2xl font-bold text-purple-300">${earnings.all.toFixed(2)}</div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {networkMetrics.map((metric, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">{metric.label}</div>
                <div className="mt-1 text-xl font-bold text-white">{metric.value}</div>
                <div className="mt-1 text-xs text-emerald-400">{metric.change}</div>
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">🔗 Protocol Extensions</h2>
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">SPL-ACP</div>
                    <div className="text-xs text-slate-400">Agent Communication</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">42</div>
                <div className="mt-1 text-xs text-purple-400">Agents with declared capabilities</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                    <span className="text-2xl">🛠️</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">SPL-TAP</div>
                    <div className="text-xs text-slate-400">Tool Attestations</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">18</div>
                <div className="mt-1 text-xs text-green-400">Verified tool attestations</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">SPL-FCP</div>
                    <div className="text-xs text-slate-400">Federated Consensus</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">7</div>
                <div className="mt-1 text-xs text-blue-400">Active consensus requests</div>
              </div>
            </div>
          </section>
        </aside>
      </section>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-600/20 text-emerald-200'
              : 'border-red-500/30 bg-red-600/20 text-red-200'
          }`}
        >
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-xs opacity-70 transition hover:opacity-100">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
