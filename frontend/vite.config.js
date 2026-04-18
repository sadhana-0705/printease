import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = (env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
  const publicBase = (env.VITE_PUBLIC_BASE || "/").trim();

  return {
    base: publicBase.endsWith("/") ? publicBase : `${publicBase}/`,
    plugins: [react()],
    css: {
      postcss: "./postcss.config.js",
    },
    server: {
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
        },
        "/uploads": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
