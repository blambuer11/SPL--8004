// Polyfills MUST be first, before anything else
import "./polyfills";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Debug overlay was used during bootstrap; removed for production-like UX

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("❌ Root element not found!");
  document.body.innerHTML = '<div style="padding:40px;color:red;font-size:20px;">Error: Root element not found</div>';
} else {
  console.log("✅ Root element found, attempting render...");
  try {
    createRoot(rootElement).render(<App />);
    console.log("✅ App rendered successfully");
  } catch (error) {
    console.error("❌ Failed to render app:", error);
    // Fallback to simple working app
    const SimpleApp = () => (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🚀 Noema Protocol</h1>
        <div className="bg-red-100 border border-red-200 p-4 rounded-lg mb-4">
          <p className="text-red-800">Main app failed to load. Error: {String(error)}</p>
        </div>
        <a href="/app" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Try Dashboard
        </a>
      </div>
    );
    createRoot(rootElement).render(<SimpleApp />);
  }
}
