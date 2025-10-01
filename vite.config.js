import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
  hmr: false,
  host: "localhost",
  port: 5173,
  strictPort: true,
}
});
