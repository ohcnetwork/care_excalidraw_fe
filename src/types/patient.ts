import { Permission } from "@/types/permission";

export interface PatientRead {
  id: string;
  name: string;
  permissions: Permission[];
}
