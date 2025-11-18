import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// import App from "./App.test.tsx"; // Uncomment to test minimal app
import "./index.css";
// Minimal Buffer polyfill for browser
import { Buffer } from "buffer";

// Polyfills for Solana libs
declare global {
	interface Window {
		Buffer?: typeof Buffer;
		global?: typeof globalThis;
		process?: { env: Record<string, string | undefined> };
	}
}
if (!window.Buffer) window.Buffer = Buffer;
if (!window.global) window.global = globalThis;
if (!window.process) window.process = { env: {} } as any;

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("❌ Root element not found!");
  document.body.innerHTML = '<div style="padding:40px;color:red;font-size:20px;">Error: Root element not found</div>';
} else {
  console.log("✅ Root element found, attempting render...");
  try {
    // Force dark theme for consistent dashboard styling
    document.documentElement.classList.add('dark');
    createRoot(rootElement).render(<App />);
    console.log("✅ App rendered successfully");
  } catch (error) {
    console.error("❌ Failed to render app:", error);
    document.body.innerHTML = `<div style="padding:40px;color:red;"><h1>Render Error</h1><pre>${String(error)}</pre></div>`;
  }
}
