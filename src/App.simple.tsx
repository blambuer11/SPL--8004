import React from "react";

const SimpleApp = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Noema Protocol
          </h1>
          <p className="text-xl text-gray-600">
            AI Agent Infrastructure on Solana
          </p>
        </header>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">🤖 Agent Identity</h3>
            <p className="text-gray-600">On-chain identity system for AI agents</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">⭐ Reputation</h3>
            <p className="text-gray-600">Verifiable reputation tracking</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">💰 Payments</h3>
            <p className="text-gray-600">Instant USDC settlements</p>
          </div>
        </div>
        
        <div className="bg-blue-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">✅ System Status</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• React rendering working</li>
            <li>• Tailwind CSS loaded</li>
            <li>• Development server active</li>
            <li>• Ready for full app</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;