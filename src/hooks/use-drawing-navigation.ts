import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";

/**
 * Navigation between the Drawings tab and the editor.
 *
 * The host shows the Drawings tab at `…/files?file=drawings`. The plug mounts
 * the editor beside it, at `…/drawing/<id>` (see `manifest.tsx`). The plug
 * does not know the host route tree, so these paths resolve from the URL path
 * (`unsafeRelative: "path"`), not from the matched route.
 */
export function useDrawingNavigation() {
  const router = useRouter();
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();

  return {
    /** From the Drawings tab (`…/files`) to `…/drawing/<id>`. */
    openDrawing: (drawingId: string) =>
      navigate({ to: `../drawing/${drawingId}`, unsafeRelative: "path" }),

    /** Back to the previous page, or to the Drawings tab after a direct open. */
    closeDrawing: () => {
      if (canGoBack) {
        router.history.back();
        return;
      }
      navigate({
        to: "../../files",
        search: { file: "drawings" },
        unsafeRelative: "path",
      });
    },
  };
}
