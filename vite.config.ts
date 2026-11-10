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
      shared: [
        "react",
        "react-dom",
        "react-i18next",
        "@tanstack/react-query",
        "raviger",
        "sonner",
      ],
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
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      // `use-sync-external-store` is CommonJS-only; its `require("react")`
      // escapes the federation plugin's ESM react-import rewriting and binds to
      // the remote's bundled React instead of the host's shared one — causing
      // "Cannot read properties of null (reading 'useRef' /
      // 'useSyncExternalStore')" at render time. Alias each entry point to an
      // ESM shim that imports React as a bare specifier so federation routes it
      // through the shared (host) React instance.
      //   - `shim/with-selector`: zustand@4 (via @excalidraw/excalidraw) and
      //     @base-ui/utils
      //   - `shim` and the package root: @base-ui/utils (@base-ui/react)
      // Anchored regexes: string aliases match by prefix, so `…/shim` would
      // otherwise also capture `…/shim/with-selector`.
      {
        find: /^use-sync-external-store\/shim\/with-selector(\.js)?$/,
        replacement: path.resolve(
          __dirname,
          "./src/shims/use-sync-external-store-with-selector.ts",
        ),
      },
      {
        find: /^use-sync-external-store(\/shim)?(\/index)?(\.js)?$/,
        replacement: path.resolve(
          __dirname,
          "./src/shims/use-sync-external-store.ts",
        ),
      },
    ],
  },
  preview: {
    port: Number(process.env.PORT) || 4173,
    strictPort: !!process.env.PORT,
    allowedHosts: true,
    host: "0.0.0.0",
    cors: true,
  },
});
