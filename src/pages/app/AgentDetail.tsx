import { useParams } from 'react-router-dom';

export default function AgentDetail() {
  const { agentId } = useParams();
  return (
    <div className="space-y-6 text-slate-200">
      <h1 className="text-2xl font-semibold">Agent: {agentId}</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">Reputation • score / tasks</div>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">Rewards • claim / compound</div>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">Metadata • URI</div>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">Recent activity</div>
      </div>
    </div>
  );
}
