import { defineConfig } from "vite";
import federation from "@originjs/vite-plugin-federation";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    federation({
      name: "care_excalidraw",
      filename: "remoteEntry.js",
      exposes: {
        "./manifest": "./src/manifest.tsx",
      },
      shared: ["react", "react-dom", "react-i18next", "raviger"],
    }),
    tailwindcss(),
    react(),
  ],
  build: {
    target: "esnext",
    minify: true,
    cssCodeSplit: false,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      external: [],
      input: {
        main: "./index.html",
      },
      output: {
        format: "esm",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // `zustand@4` (via @excalidraw/excalidraw) imports the CommonJS-only
      // `use-sync-external-store/shim/with-selector`, whose `require("react")`
      // escapes the federation plugin's ESM react-import rewriting and binds to
      // the remote's bundled React instead of the host's shared one — causing
      // "Cannot read properties of null (reading 'useRef')" at render time.
      // Alias it to an ESM shim that imports React as a bare specifier so
      // federation routes it through the shared (host) React instance.
      "use-sync-external-store/shim/with-selector.js": path.resolve(
        __dirname,
        "./src/shims/use-sync-external-store-with-selector.ts",
      ),
      "use-sync-external-store/shim/with-selector": path.resolve(
        __dirname,
        "./src/shims/use-sync-external-store-with-selector.ts",
      ),
    },
  },
  preview: {
    port: 4173,
    allowedHosts: true,
    host: "0.0.0.0",
    cors: true,
  },
});
