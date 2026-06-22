import { debounce } from "@/lib/utils";
import {
  ExcalidrawDrawingObjectValue,
  MetaArtifactDrawingApplication,
  MetaArtifactRead,
} from "@/types/meta-artifact";
import {
  Button,
  Excalidraw,
  hashElementsVersion,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { SaveIcon, XIcon } from "lucide-react";
import React from "react";
import { useNavigationPrompt } from "raviger";
import { useTranslation } from "@/hooks/use-translation";

/**
 * Calculates the scene version for a given meta artifact object. If the
 * `sceneVersion` is present in the object, it returns that. Otherwise, it
 * calculates the sceneVersion using the elements. This ensures that we can
 * detect changes to the drawing even for older meta artifacts that don't have
 * `sceneVersion`.
 */
const getSceneVersion = (obj: MetaArtifactRead) => {
  const state = obj.object_value;
  return state.sceneVersion ?? hashElementsVersion(state.elements || []);
};

export interface DrawingEditorProps {
  obj: MetaArtifactRead;
  value: ExcalidrawDrawingObjectValue;
  onChange: (value: ExcalidrawDrawingObjectValue) => void;
  handleSave?: () => void;
  handleExit?: () => void;
  disabled?: boolean;
}

export const DrawingEditor: React.FC<DrawingEditorProps> = ({
  obj,
  onChange,
  handleSave,
  handleExit,
  disabled,
}) => {
  const { t } = useTranslation();
  const [isDirty, setIsDirty] = React.useState(false);
  useNavigationPrompt(isDirty, t("unsaved_changes"));

  const oldSceneVersion = getSceneVersion(obj);

  return (
    <Excalidraw
      UIOptions={{
        canvasActions: {
          saveAsImage: true,
          export: false,
          loadScene: false,
        },
      }}
      initialData={{
        appState: { theme: "light" },
        elements: obj.object_value.elements ?? [],
        files: obj.object_value.files ?? {},
      }}
      onChange={debounce((elements, _appState, files) => {
        const value = {
          application: MetaArtifactDrawingApplication.EXCALIDRAW,
          elements,
          files,
          sceneVersion: hashElementsVersion(elements),
        };
        setIsDirty(oldSceneVersion !== value.sceneVersion);
        if (oldSceneVersion !== value.sceneVersion) {
          onChange(value);
        }
      }, 100)}
      renderTopRightUI={() => (
        <div className="flex gap-2">
          <style>
            {`
              .excalidraw .excalidraw-button {
                width: 2.5rem;
                height: 2.5rem;
              }
            `}
          </style>
          {handleSave && (
            <Button
              onSelect={() => handleSave()}
              title="Save"
              disabled={disabled}
            >
              <SaveIcon className="size-full" />
            </Button>
          )}
          {handleExit && (
            <Button
              onSelect={() => handleExit()}
              title="Close"
              disabled={disabled}
            >
              <XIcon className="size-full" />
            </Button>
          )}
        </div>
      )}
    />
  );
};
