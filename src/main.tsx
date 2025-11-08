import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// import App from "./App.test.tsx"; // Uncomment to test minimal app
import "./index.css";
// Minimal Buffer polyfill for browser
import { Buffer } from "buffer";
declare global {
	interface Window {
		Buffer?: typeof Buffer;
	}
}
if (!window.Buffer) window.Buffer = Buffer;

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
    document.body.innerHTML = `<div style="padding:40px;color:red;"><h1>Render Error</h1><pre>${String(error)}</pre></div>`;
  }
}
