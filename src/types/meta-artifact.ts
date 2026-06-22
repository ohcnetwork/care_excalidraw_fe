import { UserReadMinimal } from "@/types/user";

import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { BinaryFiles } from "@excalidraw/excalidraw/types";

/**
 * Associating type of the meta artifact. It can be either a patient or an
 * encounter.
 */
export enum MetaArtifactAssociatingType {
  PATIENT = "patient",
  ENCOUNTER = "encounter",
}

/**
 * The object type of the meta artifact. This plug leverages meta artifact to
 * store drawings associated to the patient/encounter.
 */
export enum MetaArtifactObjectType {
  DRAWING = "drawing",
}

/**
 * The application used to create the drawing. Excalidraw in this plug.
 */
export enum MetaArtifactDrawingApplication {
  EXCALIDRAW = "excalidraw",
}

/**
 * The value of the meta artifact object. This is a drawing created using
 * Excalidraw.
 */
export interface ExcalidrawDrawingObjectValue {
  application: MetaArtifactDrawingApplication.EXCALIDRAW;
  elements?: readonly ExcalidrawElement[];
  files?: BinaryFiles;
  sceneVersion?: number;
}

/**
 * The base interface for meta artifact. It contains the common fields for
 * creating, updating and reading a meta artifact.
 */
interface MetaArtifactBase {
  name: string;
  note?: string;
  object_type: MetaArtifactObjectType;
  object_value: ExcalidrawDrawingObjectValue;
}

/**
 * Request body for creating a new meta artifact.
 */
export interface MetaArtifactCreateRequest extends MetaArtifactBase {
  associating_type: MetaArtifactAssociatingType;
  associating_id: string;
}

/**
 * Request body for updating an existing meta artifact.
 */
export type MetaArtifactUpdateRequest = MetaArtifactBase;

/**
 * Response body for retrieving/listing a meta artifact.
 */
export interface MetaArtifactRead extends MetaArtifactBase {
  id: string;
  associating_type: MetaArtifactAssociatingType;
  associating_id: string;
  created_date: string;
  modified_date: string;
  created_by: UserReadMinimal;
  updated_by: UserReadMinimal;
}
