import { metaArtifactApis } from "@/api/meta-artifact";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Frame,
  FrameFooter,
  FrameHeader,
  FramePanel,
} from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
      <Button variant="outline" onClick={() => setShowCreateModal(true)}>
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
        {/* The dialog portals to <body>, outside <Page>; the container class
            scopes this plug's styles to the dialog's content. */}
        <DialogContent className="care-excalidraw-container">
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
                variant="outline"
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
    placeholderData: keepPreviousData,
  });

  const totalCount = data?.count ?? 0;

  return (
    <Page>
      <Frame spacing="sm" className="min-w-0">
        <FrameHeader className="flex-row flex-wrap items-center gap-2">
          <InputGroup className="bg-background sm:w-auto sm:max-w-xs sm:flex-1">
            <InputGroupInput
              aria-label={t("search_drawings")}
              placeholder={t("search_drawings")}
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          {canWrite && (
            <div className="ml-auto">
              <NewDrawingButton
                associatingType={props.type}
                associatingId={associatingId}
              />
            </div>
          )}
        </FrameHeader>

        <FramePanel
          className={cn(
            "min-w-0",
            data?.results.length ? "p-3" : "overflow-hidden p-0",
          )}
        >
          {isLoading ? (
            <Loading />
          ) : !data?.results.length ? (
            <EmptyState
              className="border-0 sm:p-10"
              icon={<ImageOffIcon className="size-6" />}
              title={t("no_drawings_so_far")}
              description={
                search
                  ? t("no_drawings_match_search")
                  : canWrite
                    ? t("create_new_drawing_message")
                    : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.results.map((drawing) => (
                <DrawingCard key={drawing.id} artifact={drawing} />
              ))}
            </div>
          )}
        </FramePanel>

        {totalCount > 0 && (
          <FrameFooter className="flex-row flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              {t("drawings_result_range", {
                start: (page - 1) * RESULTS_PER_PAGE + 1,
                end: Math.min(page * RESULTS_PER_PAGE, totalCount),
                total: totalCount,
              })}
            </p>
            {totalCount > RESULTS_PER_PAGE && (
              <Pagination
                cPage={page}
                defaultPerPage={RESULTS_PER_PAGE}
                data={{ totalCount }}
                onChange={setPage}
                className=""
              />
            )}
          </FrameFooter>
        )}
      </Frame>
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
        "group flex cursor-pointer flex-col gap-0 overflow-hidden p-0 transition-all duration-200 hover:shadow-md",
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
      <div className="relative border-b">
        <div className="h-60 w-full bg-white md:h-40">
          {isSupported ? (
            <>
              <ExcalidrawPreview obj={artifact} />
              <div className="absolute inset-0 flex items-end justify-center bg-linear-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-sm font-medium text-neutral-900 shadow-sm">
                  <EyeIcon className="size-4" />
                  {t("view")}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="text-destructive flex h-full flex-col items-center justify-center gap-2 text-center">
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
          <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <FilePenLineIcon className="size-4" />
          </span>
          <span className="truncate font-semibold">{artifact.name}</span>
        </div>

        {artifact.note && (
          <p className="text-soft-foreground line-clamp-2 text-sm">
            {artifact.note}
          </p>
        )}

        <div className="border-soft-border text-muted-foreground mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-xs">
          <span className="flex items-center gap-1.5">
            <HistoryIcon className="text-placeholder-foreground size-3.5" />
            <RelativeDateTooltip date={artifact.modified_date} />
          </span>
          <span className="flex items-center gap-1.5">
            <UserIcon className="text-placeholder-foreground size-3.5" />
            {formatName(artifact.created_by)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
