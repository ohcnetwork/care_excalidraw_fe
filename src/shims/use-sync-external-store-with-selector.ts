/**
 * ESM shim for `use-sync-external-store/shim/with-selector`.
 *
 * The real package is CommonJS-only and does `require("react")`. Under
 * @originjs/vite-plugin-federation, CommonJS `require("react")` is NOT rewritten
 * to the shared (host) React, so it binds to the remote's *bundled* React. When
 * the host renders the remote tree with its own React, that bundled React's
 * dispatcher is null, producing:
 *   "TypeError: Cannot read properties of null (reading 'useRef')"
 *
 * `zustand@4` (pulled in by `@excalidraw/excalidraw`) imports this module for
 * `useSyncExternalStoreWithSelector`. By aliasing the specifier to this ESM
 * file, the federation plugin rewrites the bare `import ... from "react"` below
 * into the shared host React, so all hooks resolve to a single React instance.
 *
 * The implementation mirrors React's official `with-selector` shim
 * (packages/use-sync-external-store), targeting React 18+ where
 * `useSyncExternalStore` is built in.
 */
import * as React from "react";

const { useRef, useEffect, useMemo, useDebugValue } = React;
const useSyncExternalStore = React.useSyncExternalStore;

function defaultIs(x: unknown, y: unknown): boolean {
  return (
    (x === y && (x !== 0 || 1 / (x as number) === 1 / (y as number))) ||
    (x !== x && y !== y)
  );
}

const objectIs: (x: unknown, y: unknown) => boolean =
  typeof Object.is === "function" ? Object.is : defaultIs;

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot: undefined | null | (() => Snapshot),
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: (a: Selection, b: Selection) => boolean,
): Selection {
  const instRef = useRef<{ hasValue: boolean; value: Selection | null } | null>(
    null,
  );
  let inst: { hasValue: boolean; value: Selection | null };
  if (instRef.current === null) {
    inst = { hasValue: false, value: null };
    instRef.current = inst;
  } else {
    inst = instRef.current;
  }

  const [getSelection, getServerSelection] = useMemo(() => {
    let hasMemo = false;
    let memoizedSnapshot: Snapshot;
    let memoizedSelection: Selection;
    const memoizedSelector = (nextSnapshot: Snapshot): Selection => {
      if (!hasMemo) {
        hasMemo = true;
        memoizedSnapshot = nextSnapshot;
        const nextSelection = selector(nextSnapshot);
        if (isEqual !== undefined && inst.hasValue) {
          const currentSelection = inst.value as Selection;
          if (isEqual(currentSelection, nextSelection)) {
            memoizedSelection = currentSelection;
            return currentSelection;
          }
        }
        memoizedSelection = nextSelection;
        return nextSelection;
      }

      const prevSnapshot = memoizedSnapshot;
      const prevSelection = memoizedSelection;

      if (objectIs(prevSnapshot, nextSnapshot)) {
        return prevSelection;
      }

      const nextSelection = selector(nextSnapshot);

      if (isEqual !== undefined && isEqual(prevSelection, nextSelection)) {
        memoizedSnapshot = nextSnapshot;
        return prevSelection;
      }

      memoizedSnapshot = nextSnapshot;
      memoizedSelection = nextSelection;
      return nextSelection;
    };

    const maybeGetServerSnapshot =
      getServerSnapshot === undefined || getServerSnapshot === null
        ? null
        : getServerSnapshot;
    const getSnapshotWithSelector = () => memoizedSelector(getSnapshot());
    const getServerSnapshotWithSelector =
      maybeGetServerSnapshot === null
        ? undefined
        : () => memoizedSelector(maybeGetServerSnapshot());
    return [getSnapshotWithSelector, getServerSnapshotWithSelector] as const;
  }, [getSnapshot, getServerSnapshot, selector, isEqual]);

  const value = useSyncExternalStore(
    subscribe,
    getSelection,
    getServerSelection,
  );

  useEffect(() => {
    inst.hasValue = true;
    inst.value = value;
  }, [value]);

  useDebugValue(value);
  return value;
}

export default { useSyncExternalStoreWithSelector };
