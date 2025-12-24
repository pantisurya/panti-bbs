import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode in the current working directory
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server: {
      // Use a different default port to avoid conflict with backend (3000)
      port: parseInt(env.VITE_PORT) || 5173,
      host: true,
      open: true,
      // Proxy /api requests to backend running on localhost:3000
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: parseInt(env.VITE_PORT) || 5173,
      host: true,
      open: true,
    },
  };
});
