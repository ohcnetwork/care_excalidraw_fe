import { lazy, LazyExoticComponent } from "react";
import { MetaArtifactDrawingApplication } from "@/types/meta-artifact";
import { DrawingPreviewProps } from "@/components/DrawingPreview";
import { DrawingEditorProps } from "@/components/DrawingEditor";

import "@/style/index.css";
import { SiExcalidraw } from "react-icons/si";

type LazyComponent<T extends React.FC<any>> = LazyExoticComponent<T>;

export type DrawingApplicationManifest = {
  application: string;
  icon: React.FC<React.HTMLAttributes<HTMLElement>>;
  previewer: LazyComponent<React.FC<DrawingPreviewProps>>;
  editor: LazyComponent<React.FC<DrawingEditorProps>>;
};

interface Manifest {
  plugin: string;
  routes: Record<string, (...args: any) => React.ReactNode>;
  drawingApplications?: readonly DrawingApplicationManifest[];
}

const manifest: Manifest = {
  plugin: "care_excalidraw",
  drawingApplications: [
    {
      application: MetaArtifactDrawingApplication.EXCALIDRAW,
      icon: () => <SiExcalidraw />,
      previewer: lazy(() =>
        import("@/components/DrawingPreview").then((mod) => ({
          default: mod.DrawingPreview,
        })),
      ),
      editor: lazy(() =>
        import("@/components/DrawingEditor").then((mod) => ({
          default: mod.DrawingEditor,
        })),
      ),
    },
  ],
  routes: {},
};

export default manifest;
