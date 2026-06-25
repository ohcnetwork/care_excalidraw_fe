import { lazy, LazyExoticComponent } from "react";

import Page from "@/components/Page";
import { ExcalidrawEditorPage } from "@/pages/ExcalidrawEditor";
import { EncounterFileSubTabProps } from "@/components/EncounterFileDrawingsTab";

type LazyComponent<T extends React.FC<any>> = LazyExoticComponent<T>;

interface Manifest {
  plugin: string;
  routes: Record<string, (...args: any) => React.ReactNode>;
  encounterFileTabs?: Record<
    string,
    LazyComponent<React.FC<EncounterFileSubTabProps>>
  >;
}

const manifest: Manifest = {
  plugin: "care_excalidraw",
  routes: {
    "/facility/:facilityId/patient/:patientId/drawing/:drawingId": (props) => (
      <Page>
        <ExcalidrawEditorPage {...props} />
      </Page>
    ),
    "/patient/:patientId/drawing/:drawingId": (props) => (
      <Page>
        <ExcalidrawEditorPage {...props} />
      </Page>
    ),
    "/facility/:facilityId/patient/:patientId/encounter/:encounterId/drawing/:drawingId":
      (props) => (
        <Page>
          <ExcalidrawEditorPage {...props} />
        </Page>
      ),
  },
  encounterFileTabs: {
    drawings: lazy(() =>
      import("@/components/EncounterFileDrawingsTab").then((module) => ({
        default: module.EncounterFileDrawingsTab,
      })),
    ),
  },
};

export default manifest;
