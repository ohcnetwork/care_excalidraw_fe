import { PatientRead } from "@/types/patient";
import { Permission } from "@/types/permission";

export enum EncounterStatus {
  PLANNED = "planned",
  IN_PROGRESS = "in_progress",
  ON_HOLD = "on_hold",
  DISCHARGED = "discharged",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  DISCONTINUED = "discontinued",
  ENTERED_IN_ERROR = "entered_in_error",
  UNKNOWN = "unknown",
}

export const COMPLETED_ENCOUNTER_STATUSES = [EncounterStatus.COMPLETED];
export const INACTIVE_ENCOUNTER_STATUSES = [
  EncounterStatus.CANCELLED,
  EncounterStatus.ENTERED_IN_ERROR,
  EncounterStatus.DISCONTINUED,
  ...COMPLETED_ENCOUNTER_STATUSES,
] as const;

export interface EncounterRead {
  id: string;
  permissions: Permission[];
  patient: PatientRead;
  status: EncounterStatus;
}
