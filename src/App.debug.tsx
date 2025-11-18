import React, { Suspense, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NetworkProvider } from "./components/NetworkProvider";
import { WalletProvider } from "./components/WalletProvider";
import ErrorBoundary from "./components/ErrorBoundary";

const DebugHome = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    { name: "React Basic", component: <div className="p-8">✅ React Working</div> },
    { name: "Router", component: <BrowserRouter><div className="p-8">✅ Router Working</div></BrowserRouter> },
    { name: "NetworkProvider", component: <NetworkProvider><div className="p-8">✅ NetworkProvider Working</div></NetworkProvider> },
  ];
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">🔧 Noema Debug Mode</h1>
      
      <div className="mb-4">
        <p>Current step: {steps[step].name}</p>
        <button 
          onClick={() => setStep(Math.max(0, step - 1))}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          disabled={step === 0}
        >
          Previous
        </button>
        <button 
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={step === steps.length - 1}
        >
          Next
        </button>
      </div>
      
      <ErrorBoundary>
        {steps[step].component}
      </ErrorBoundary>
    </div>
  );
};

const App = () => {
  console.log("🚀 Debug App starting...");
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="p-8">Loading debug app...</div>}>
        <DebugHome />
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;