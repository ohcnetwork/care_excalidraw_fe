import {
  ExcalidrawDrawingObjectValue,
  MetaArtifactRead,
} from "@/types/meta-artifact";
import { exportToSvg } from "@excalidraw/excalidraw";
import { LoaderCircleIcon } from "lucide-react";
import React, { memo, useRef, useState } from "react";

const ExcalidrawPreview = memo(
  ({ elements, files }: Omit<ExcalidrawDrawingObjectValue, "application">) => {
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [svgKey, setSvgKey] = useState(0);

    React.useEffect(() => {
      setIsLoading(true);
      setSvgKey((prev) => prev + 1);
    }, [elements, files]);

    React.useEffect(() => {
      let isMounted = true;

      if (!elements?.length || !svgContainerRef.current) {
        if (isMounted) setIsLoading(false);
        return;
      }

      const generateSvg = async () => {
        try {
          if (svgContainerRef.current) {
            svgContainerRef.current.innerHTML = "";
          }

          const svg = await exportToSvg({
            elements: elements || [],
            appState: {
              viewBackgroundColor: "#ffffff",
              exportWithDarkMode: false,
              theme: "light",
            },
            exportPadding: 10,
            files: files || null,
          });

          if (isMounted && svgContainerRef.current) {
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.style.maxHeight = "100%";
            svg.style.maxWidth = "100%";
            svg.style.display = "block";
            svg.style.margin = "auto";

            svgContainerRef.current.appendChild(svg);
          }
        } catch {
          console.error("Failed to generate SVG preview for drawing");
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };

      const timeoutId = setTimeout(() => {
        generateSvg();
      }, 50);

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    }, [elements, files, svgKey]);

    if (isLoading) {
      return (
        <div className="flex size-full items-center justify-center">
          <LoaderCircleIcon className="animate-spin text-gray-400" />
        </div>
      );
    }

    if (!elements?.length) {
      return <div className="flex size-full" />;
    }

    return (
      <div
        ref={svgContainerRef}
        className="flex size-full items-center justify-center p-2"
      />
    );
  },
);

ExcalidrawPreview.displayName = "ExcalidrawPreview";

export interface DrawingPreviewProps {
  obj: MetaArtifactRead;
}

export const DrawingPreview: React.FC<DrawingPreviewProps> = ({ obj }) => {
  return (
    <ExcalidrawPreview
      elements={obj.object_value.elements}
      files={obj.object_value.files}
      key={obj.modified_date}
    />
  );
};
