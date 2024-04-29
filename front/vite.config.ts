import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import vitePluginFaviconsInject from "vite-plugin-favicons-inject";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), vitePluginFaviconsInject()],
  resolve: {
    alias: [{ find: "@/", replacement: path.resolve(__dirname, "./src/") }],
  },
});
