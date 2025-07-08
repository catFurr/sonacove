import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    outDir: "../dist/worker",
    emptyOutDir: true,
    lib: {
      entry: "index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
