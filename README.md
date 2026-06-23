# CARE Excalidraw

A CARE plugin that embeds an [Excalidraw](https://excalidraw.com/) whiteboard
into CARE, letting clinicians sketch and annotate diagrams directly within
patient workflows.

<img width="5088" height="3796" alt="image" src="https://github.com/user-attachments/assets/bfb49294-fad6-48fe-a791-3f3996ef552b" />

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
git clone https://github.com/ohcnetwork/care_excalidraw_fe
cd care_excalidraw_fe
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

## License

MIT
