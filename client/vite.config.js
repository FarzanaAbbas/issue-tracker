import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// In development, /api requests are proxied to the Express server so the
// session cookie stays same-origin (exactly like production on Vercel).
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.CLIENT_PORT) || 5173,
    proxy: {
      "/api": `http://localhost:${process.env.API_PORT || 5000}`,
    },
  },
});
