import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The admin panel runs as its own app on its own port (default 5174).
// /api is proxied to the same Express server the user app uses.
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.ADMIN_PORT) || 5174,
    strictPort: true,
    proxy: {
      "/api": `http://localhost:${process.env.API_PORT || 5000}`,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          vendor: ["axios", "lucide-react"],
        },
      },
    },
  },
});
