import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/auth": {
        target: "https://dummyjson.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth/, "/auth"),
      },
    },
  },
});
