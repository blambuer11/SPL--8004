import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  plugins: [
    nodePolyfills({
      // Polyfill global variables like Buffer and process
      globals: {
        Buffer: true,
        process: true,
      },
      // Allow protocol imports like node:buffer
      protocolImports: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  define: {
    'global': 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: ["buffer", "react", "react-dom"],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
}));
