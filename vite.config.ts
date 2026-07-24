import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const requestedBase = process.env.VITE_BASE_PATH || "/";
const base = requestedBase.endsWith("/") ? requestedBase : `${requestedBase}/`;

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
