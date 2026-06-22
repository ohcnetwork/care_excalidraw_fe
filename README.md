# CARE Excalidraw

A CARE plugin that embeds an [Excalidraw](https://excalidraw.com/) whiteboard
into CARE, letting clinicians sketch and annotate diagrams directly within
patient workflows.

> Built as a CARE micro-frontend using
> [Module Federation](https://github.com/originjs/vite-plugin-federation). The
> plugin exposes a `manifest` that CARE loads at runtime from a remote
> `remoteEntry.js`.

## Tech stack

- React 19 + TypeScript
- Vite 6 with `@originjs/vite-plugin-federation`
- `@excalidraw/excalidraw`
- Tailwind CSS v4
- `raviger` (routing) and `react-i18next` (localization) — shared with the CARE host

## Getting started

Clone the repository and install dependencies:

```bash
git clone https://github.com/ohcnetwork/care_excalidraw
cd care_excalidraw
npm install
```

Start the dev server (builds the federated bundle in watch mode and serves a
preview):

```bash
npm run dev
```

The plugin is served at `http://localhost:4173`, with the federation entry at
`http://localhost:4173/assets/remoteEntry.js`.

## Connecting the plugin to CARE

Make sure you have CARE running locally, then:

1. Open the CARE Admin Dashboard (usually `http://localhost:4000/admin`).
2. Go to the **Apps** section and click **Add New Config**.
3. Add a slug and set the following as the Meta:

   ```json
   {
     "url": "http://localhost:4173/assets/remoteEntry.js",
     "name": "care_excalidraw"
   }
   ```

4. Save the configuration and reload CARE.

> The `name` **must** match the federation `name` in `vite.config.ts`
> (`care_excalidraw`). Changing one without the other will prevent CARE from
> resolving the remote module.

### Via the CARE App Store

This plugin is published in the
[CARE Apps Registry](https://github.com/ohcnetwork/care_apps_registry) as
`care_excalidraw`. When installing through the App Store, CARE computes the
`meta.url` from the configured **App base URL** as
`${appBaseUrl}/assets/remoteEntry.js`, so you only need to provide the base URL
(e.g. `http://localhost:4173` for local development or
`https://care-excalidraw.pages.dev` for production).

## Project structure

```text
care_excalidraw/
  public/locale/        Localization message catalogs
  src/
    manifest.tsx        Plugin manifest (routes, components, nav links)
    shims/              Shared-dependency interop shims
  vite.config.ts        Federation + build configuration
  .env                  Local environment defaults
```

## Configuring the manifest

The manifest lives at `src/manifest.tsx` and is the contract between this plugin
and CARE. Use it to register routes, mount components into CARE UI slots, and add
navigation links.

### Add a route

```tsx
import Whiteboard from "./pages/Whiteboard";

export const manifest = {
  // ...
  routes: {
    "/excalidraw": () => (
      <Page>
        <Whiteboard />
      </Page>
    ),
  },
};
```

### Mount a component into a CARE slot

```tsx
export const manifest = {
  // ...
  components: {
    PatientInfoCardQuickActions: lazy(() => import("./components/OpenBoardButton")),
  },
};
```

CARE injects the component wherever the named slot is defined in its UI.

### Add a navigation link

```tsx
export const manifest = {
  // ...
  userNavItems: [
    {
      url: "/excalidraw",
      name: "Whiteboard",
    },
  ],
};
```

## Building and deploying

Create a production build:

```bash
npm run build
```

The output in `dist/` is a set of static assets (including
`assets/remoteEntry.js`) that can be served from any static host. The hosted
build is deployed to **https://care-excalidraw.pages.dev** via Cloudflare Pages.

## Shared dependencies

`react`, `react-dom`, `react-i18next`, and `raviger` are declared as `shared` in
`vite.config.ts` so the plugin reuses the CARE host's instances instead of
bundling its own. Keep these versions compatible with the host to avoid
duplicate-React issues.

> **Note:** `@excalidraw/excalidraw` pulls in `zustand@4`, which imports the
> CommonJS-only `use-sync-external-store/shim/with-selector`. That import escapes
> the federation plugin's ESM React rewriting and would otherwise bind to the
> remote's bundled React (causing
> `Cannot read properties of null (reading 'useRef')` at render time). It is
> aliased to an ESM shim in `vite.config.ts` so it routes through the host's
> shared React instance. Keep that alias in place.

## Scripts

| Command           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Build in watch mode and serve the preview on `:4173` |
| `npm run build`   | Type-check and produce a production build            |
| `npm run preview` | Serve a previously built bundle                       |
| `npm run lint`    | Run ESLint                                            |

## License

MIT
`
