import { metaArtifactApis } from "@/api/meta-artifact";
import { Button } from "@/components/careui/button";
import { Card, CardContent } from "@/components/careui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/careui/dialog";
import { Input } from "@/components/careui/input";
import { Label } from "@/components/careui/label";
import { Textarea } from "@/components/careui/textarea";
import { ExcalidrawPreview } from "@/components/ExcalidrawPreview";
import { Loading } from "@/components/Loading";
import Pagination from "@/components/Pagination";
import RelativeDateTooltip from "@/components/RelativeDateTooltip";
import { useTranslation } from "@/hooks/use-translation";
import { mutate, query } from "@/lib/http-request";
import { cn, formatName } from "@/lib/utils";
import { EncounterRead, INACTIVE_ENCOUNTER_STATUSES } from "@/types/encounter";
import {
  MetaArtifactAssociatingType,
  MetaArtifactDrawingApplication,
  MetaArtifactObjectType,
  MetaArtifactRead,
} from "@/types/meta-artifact";
import { PatientRead } from "@/types/patient";
import { Permission } from "@/types/permission";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  EyeIcon,
  FilePenLineIcon,
  HistoryIcon,
  ImageOffIcon,
  PlusIcon,
  SearchIcon,
  TriangleAlertIcon,
  UserIcon,
} from "lucide-react";
import { navigate } from "raviger";
import { useState } from "react";
import Page from "@/components/Page";

const RESULTS_PER_PAGE = 15;

const hasReadPermission = ({
  type,
  patient,
  encounter,
}: EncounterFileSubTabProps) => {
  const permissions = new Set([
    ...(patient?.permissions ?? []),
    ...(encounter?.permissions ?? []),
  ]);

  if (permissions.has(Permission.READ_CLINICAL_DATA)) {
    return true;
  }

  if (type === MetaArtifactAssociatingType.ENCOUNTER) {
    return permissions.has(Permission.READ_ENCOUNTER_CLINICAL_DATA);
  }

  return false;
};

const hasWritePermission = ({
  type,
  patient,
  encounter,
  readOnly,
}: EncounterFileSubTabProps) => {
  if (readOnly) {
    return false;
  }

  const permissions = new Set([
    ...(patient?.permissions ?? []),
    ...(encounter?.permissions ?? []),
  ]);

  if (type === MetaArtifactAssociatingType.PATIENT) {
    return permissions.has(Permission.WRITE_PATIENT);
  }

  if (type === MetaArtifactAssociatingType.ENCOUNTER) {
    if (encounter && INACTIVE_ENCOUNTER_STATUSES.includes(encounter.status)) {
      return false;
    }
    return permissions.has(Permission.WRITE_ENCOUNTER_CLINICAL_DATA);
  }

  return false;
};

interface NewDrawingButtonProps {
  associatingType: MetaArtifactAssociatingType;
  associatingId: string;
}

const NewDrawingButton = (props: NewDrawingButtonProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const { mutate: createDrawing, isPending: isCreating } = useMutation({
    mutationFn: mutate(metaArtifactApis.create),
    onSuccess: (data: MetaArtifactRead) => {
      queryClient.invalidateQueries({
        queryKey: [
          "drawings",
          { type: props.associatingType, associatingId: props.associatingId },
        ],
      });
      setShowCreateModal(false);
      setName("");
      setNote("");
      navigate(`./drawing/${data.id}`);
    },
  });

  const handleCreateDrawing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCreateModal || !name.trim()) {
      return;
    }
    createDrawing({
      name: name.trim(),
      note: note.trim() || undefined,
      object_type: MetaArtifactObjectType.DRAWING,
      object_value: { application: MetaArtifactDrawingApplication.EXCALIDRAW },
      associating_type: props.associatingType,
      associating_id: props.associatingId,
    });
  };

  return (
    <>
      <Button
        variant="outline_primary"
        onClick={() => setShowCreateModal(true)}
      >
        <PlusIcon />
        {t("new_drawing")}
      </Button>

      <Dialog
        open={!!showCreateModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setName("");
            setNote("");
          }
        }}
      >
        <DialogContent>
          <form onSubmit={handleCreateDrawing}>
            <DialogHeader>
              <DialogTitle>{t("new_drawing")}</DialogTitle>
            </DialogHeader>
            <div className="my-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="drawing-name">{t("name")}</Label>
                <Input
                  id="drawing-name"
                  autoFocus
                  autoComplete="off"
                  placeholder={t("enter_drawing_name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drawing-note">{t("note")}</Label>
                <Textarea
                  id="drawing-note"
                  placeholder={t("optional")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setName("");
                  setNote("");
                }}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={!name.trim() || isCreating}>
                {t("create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export interface EncounterFileSubTabProps {
  type: MetaArtifactAssociatingType;
  encounter?: EncounterRead;
  patient?: PatientRead;
  readOnly?: boolean;
}

export const EncounterFileDrawingsTab: React.FC<EncounterFileSubTabProps> = (
  props,
) => {
  const { t } = useTranslation();
  const associatingId =
    {
      [MetaArtifactAssociatingType.PATIENT]: props.patient?.id,
      [MetaArtifactAssociatingType.ENCOUNTER]: props.encounter?.id,
    }[props.type] ?? "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const canRead = hasReadPermission(props);
  const canWrite = hasWritePermission(props);

  const { data, isLoading } = useQuery({
    queryKey: ["drawings", { type: props.type, associatingId, search, page }],
    queryFn: query.debounced(metaArtifactApis.list, {
      queryParams: {
        object_type: MetaArtifactObjectType.DRAWING,
        associating_type: props.type,
        associating_id: associatingId,
        name: search || undefined,
        limit: RESULTS_PER_PAGE,
        offset: (page - 1) * RESULTS_PER_PAGE,
      },
    }),
    enabled: canRead,
  });

  return (
    <Page>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="relative ml-1 max-w-96 min-w-72 flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder={t("search")}
            value={search || ""}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="pl-8"
          />
        </div>
        {canWrite && (
          <NewDrawingButton
            associatingType={props.type}
            associatingId={associatingId}
          />
        )}
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          {data?.results.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <ImageOffIcon className="mb-2 text-4xl" />
              <p className="text-lg font-medium">{t("no_drawings_so_far")}</p>
              {canWrite && (
                <p className="text-sm">{t("create_new_drawing_message")}</p>
              )}
            </div>
          ) : (
            <div className="ml-1 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data?.results.map((drawing) => (
                <DrawingCard key={drawing.id} artifact={drawing} />
              ))}
            </div>
          )}
        </>
      )}

      {data && (
        <div className="mt-4 flex items-center justify-center">
          <Pagination
            cPage={page}
            defaultPerPage={RESULTS_PER_PAGE}
            data={{ totalCount: data.count }}
            onChange={setPage}
          />
        </div>
      )}
    </Page>
  );
};

const DrawingCard = ({ artifact }: { artifact: MetaArtifactRead }) => {
  const { t } = useTranslation();

  const handleSelect = () => {
    navigate(`./drawing/${artifact.id}`);
  };

  const isSupported =
    artifact.object_value.application ===
    MetaArtifactDrawingApplication.EXCALIDRAW;

  return (
    <Card
      className={cn(
        "group flex cursor-pointer flex-col gap-0 overflow-hidden rounded-xl border-gray-200 p-0 shadow-xs transition-all duration-200 hover:shadow-md",
        isSupported ? "cursor-pointer" : "cursor-not-allowed opacity-50",
      )}
      role="button"
      tabIndex={0}
      onClick={() => handleSelect()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSelect();
        }
      }}
    >
      <div className="relative border-b border-gray-200">
        <div className="h-60 w-full bg-white md:h-40">
          {isSupported ? (
            <>
              <ExcalidrawPreview obj={artifact} />
              <div className="absolute inset-0 flex items-end justify-center bg-linear-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-sm font-medium text-gray-900 shadow-sm">
                  <EyeIcon className="size-4" />
                  {t("view")}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-red-700">
                <TriangleAlertIcon />
                {t("unsupported_drawing_application", {
                  application: artifact.object_value.application,
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <span className="bg-primary-50 text-primary-600 flex size-8 shrink-0 items-center justify-center rounded-lg">
            <FilePenLineIcon className="size-4" />
          </span>
          <span className="truncate font-semibold text-gray-900">
            {artifact.name}
          </span>
        </div>

        {artifact.note && (
          <p className="line-clamp-2 text-sm text-gray-600">{artifact.note}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <HistoryIcon className="size-3.5 text-gray-400" />
            <RelativeDateTooltip date={artifact.modified_date} />
          </span>
          <span className="flex items-center gap-1.5">
            <UserIcon className="size-3.5 text-gray-400" />
            {formatName(artifact.created_by)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
