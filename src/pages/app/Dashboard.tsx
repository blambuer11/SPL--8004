import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Zap } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Active Agents', value: '127', change: '+23', trend: 'up', icon: Users, color: 'blue' },
    { label: 'Total Volume (24h)', value: '$45,892', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'emerald' },
    { label: 'Network Reputation', value: '2.4M', change: '+8.2%', trend: 'up', icon: Zap, color: 'purple' },
    { label: 'Transactions (24h)', value: '1,847', change: '-3.1%', trend: 'down', icon: Activity, color: 'amber' },
  ];

  const yourAgents = [
    { id: 'data-analyzer-001', rep: 8500, status: 'Active', tasks: 342, success: 98.5, earnings: 1240 },
    { id: 'trading-bot-v1', rep: 7200, status: 'Active', tasks: 189, success: 96.2, earnings: 890 },
    { id: 'content-creator-pro', rep: 6800, status: 'Active', tasks: 521, success: 94.8, earnings: 2340 },
    { id: 'researcher-ai-2', rep: 4200, status: 'Active', tasks: 97, success: 99.1, earnings: 560 },
    { id: 'image-processor', rep: 3100, status: 'Validating', tasks: 45, success: 91.2, earnings: 180 },
    { id: 'oracle-syncer', rep: 1300, status: 'Pending', tasks: 12, success: 100, earnings: 45 },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Welcome back! Here's your agent ecosystem overview</p>
        </div>
        <div className="text-sm text-slate-400">
          Last updated: {new Date().toLocaleTimeString()}
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

      {/* Your Agents Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white">🤖 Your Agents ({yourAgents.length})</h2>
          <a href="/app/agents" className="text-sm text-blue-400 hover:text-blue-300">View all →</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {yourAgents.map(agent => (
            <div key={agent.id} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white">{agent.id}</div>
                <div className={`text-xs px-2 py-1 rounded ${
                  agent.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' :
                  agent.status === 'Validating' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-slate-500/20 text-slate-300'
                }`}>
                  {agent.status}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-400">Reputation</div>
                  <div className="font-semibold text-purple-300">{agent.rep.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Tasks</div>
                  <div className="font-semibold text-blue-300">{agent.tasks}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Success Rate</div>
                  <div className="font-semibold text-emerald-300">{agent.success}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Earned</div>
                  <div className="font-semibold text-yellow-300">${agent.earnings}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
          <a href="/app/payments" className="text-sm text-blue-400 hover:text-blue-300">View all transactions →</a>
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

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/app/agents" className="p-6 rounded-xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 hover:border-blue-400/50 transition text-center">
          <div className="text-3xl mb-2">🤖</div>
          <div className="font-semibold text-white">Register New Agent</div>
          <div className="text-xs text-slate-400 mt-1">Add agent to network</div>
        </a>
        <a href="/app/marketplace" className="p-6 rounded-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 hover:border-purple-400/50 transition text-center">
          <div className="text-3xl mb-2">🏪</div>
          <div className="font-semibold text-white">Browse Marketplace</div>
          <div className="text-xs text-slate-400 mt-1">Hire AI agents</div>
        </a>
        <a href="/app/staking" className="p-6 rounded-xl bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 hover:border-emerald-400/50 transition text-center">
          <div className="text-3xl mb-2">💎</div>
          <div className="font-semibold text-white">Stake & Validate</div>
          <div className="text-xs text-slate-400 mt-1">Earn rewards</div>
        </a>
      </section>
    </div>
  );
}
