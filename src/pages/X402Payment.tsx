import React from 'react';
// Lightweight placeholder for X402Payment until full integration
export default function X402Payment() {
  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-4 text-slate-900">X402 Payment Protocol</h1>
      <p className="text-slate-600 max-w-2xl mb-8">Autonomous micropayment layer (HTTP 402) — gasless USDC transfers for agent-to-agent interactions. Full dashboard will be integrated soon.</p>
      <div className="rounded-xl border bg-white shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Status</h2>
        <p className="text-sm text-slate-600 mb-4">Beta preview. Core facilitator & settlement logic lives in the agent-aura-sovereign package. This page will evolve into a full payment console.</p>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>• Gasless USDC transfers (devnet)</li>
          <li>• Facilitator service orchestration</li>
          <li>• Verify / Settle flow</li>
          <li>• Local history & explorer links</li>
        </ul>
        <p className="mt-4 text-xs text-slate-500">Advanced form & history UI exists in <code className="px-1 py-0.5 bg-slate-100 rounded">agent-aura-sovereign/src/pages/X402Payment.tsx</code>.</p>
      </div>
    </div>
  );
}
