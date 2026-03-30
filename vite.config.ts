import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "window",
  },
  build: {
    minify: false,
    sourcemap: true,
    commonjsOptions: {
      strictRequires: ["node_modules/aws-sdk/**/*.js"],
    },
  },
});
