/**
 * ESM shim for `use-sync-external-store` and `use-sync-external-store/shim`.
 *
 * Same problem as `./use-sync-external-store-with-selector.ts`: the real
 * package is CommonJS and does `require("react")`, which the federation plugin
 * does not route to the host's shared React. `@base-ui/react` (via
 * `@base-ui/utils`) imports `use-sync-external-store/shim`, so without this
 * alias every Base UI component crashes inside CARE with:
 *   "TypeError: Cannot read properties of null (reading 'useSyncExternalStore')"
 *
 * React 18+ ships `useSyncExternalStore`, so the shim is a re-export of the
 * shared React's implementation.
 */
import * as React from "react";

export const useSyncExternalStore = React.useSyncExternalStore;
