import { useTranslation } from "@/hooks/use-translation";
import {
  ExcalidrawDrawingObjectValue,
  MetaArtifactDrawingApplication,
  MetaArtifactObjectType,
} from "@/types/meta-artifact";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mutate, query } from "@/lib/http-request";
import { metaArtifactApis } from "@/api/meta-artifact";
import { Loading } from "@/components/Loading";
import { toast } from "sonner";
import { debounce, goBack } from "@/lib/utils";
import {
  Button,
  Excalidraw,
  hashElementsVersion,
} from "@excalidraw/excalidraw";
import { useNavigationPrompt } from "raviger";
import { SaveIcon, XIcon } from "lucide-react";

import "@excalidraw/excalidraw/index.css";

interface Props {
  drawingId: string;
}

export const ExcalidrawEditorPage: React.FC<Props> = ({ drawingId }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [value, setValue] = useState<ExcalidrawDrawingObjectValue>();
  const [isDirty, setIsDirty] = useState(false);

  useNavigationPrompt(isDirty, t("unsaved_changes"));

  const { data, isFetching: isFetchingDrawing } = useQuery({
    queryKey: ["drawing", drawingId],
    queryFn: query(metaArtifactApis.retrieve, {
      pathParams: { external_id: drawingId },
    }),
  });

  const { mutate: saveDrawing, isPending: isSaving } = useMutation({
    mutationFn: mutate(metaArtifactApis.update, {
      pathParams: { external_id: drawingId },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["drawing", drawingId],
      });
    },
  });

  useEffect(() => {
    if (isFetchingDrawing || value || !data) {
      return;
    }

    setValue(data.object_value);
  }, [isFetchingDrawing, data, value]);

  if (isFetchingDrawing || !data || !value) {
    return <Loading />;
  }

  const handleChange = (value: ExcalidrawDrawingObjectValue) => {
    setValue(value);
    setIsDirty(true);
  };

  const handleSave = () => {
    setIsDirty(false);
    saveDrawing(
      {
        name: data.name,
        object_type: MetaArtifactObjectType.DRAWING,
        object_value: value,
        note: data.note,
      },
      {
        onSuccess: () => {
          toast.success(t("saved"), { duration: 700 });
          console.log({ isDirty });
          goBack();
        },
      },
    );
  };

  return (
    <div className="-mt-6.5 -mb-2.5 -ml-2.5 h-[calc(100vh-1.4rem)] w-[calc(100%+1.25rem)] overflow-clip rounded-md">
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
          elements: data.object_value.elements ?? [],
          files: data.object_value.files ?? {},
        }}
        onChange={debounce((elements, _appState, files) => {
          const oldVersion = hashElementsVersion(value?.elements ?? []);
          const newVersion = hashElementsVersion(elements);

          if (oldVersion !== newVersion) {
            handleChange({
              application: MetaArtifactDrawingApplication.EXCALIDRAW,
              elements,
              files,
            });
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
            <Button
              onSelect={() => handleSave()}
              title={t("save")}
              disabled={isSaving}
            >
              <SaveIcon className="size-full" />
            </Button>
            <Button
              onSelect={() => goBack()}
              title={t("close")}
              disabled={isSaving}
            >
              <XIcon className="size-full" />
            </Button>
          </div>
        )}
      />
    </div>
  );
};
