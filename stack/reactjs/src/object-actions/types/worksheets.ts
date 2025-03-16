// src/types/worksheet.ts
export interface ObjectField {
  id: number;
  objectName: string;
  fieldName: string;
  fieldType: string;
  description?: string;
  isRequired: boolean;
  isUnique: boolean;
  defaultValue?: string;
  minValue?: number;
  maxValue?: number;
  options?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PermissionRule {
  id: number;
  objectName: string;
  action: "create" | "read" | "update" | "delete";
  role: string;
  isAllowed: boolean;
  conditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Worksheet {
  id: number;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  objectFields: ObjectField[];
  permissionRules: PermissionRule[];
}

export interface WorksheetListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WorksheetSummary[];
}

export interface WorksheetSummary {
  id: number;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  objectCount: number;
  permissionCount: number;
}

export interface GenerateFieldsRequest {
  objects: string[];
  enhanceWithAI?: boolean;
}

export interface GenerateFieldsResponse {
  success: boolean;
  generatedFields: ObjectField[];
}

export interface ExportResponse {
  success: boolean;
  fileUrl?: string;
  message?: string;
}

export interface WorksheetFormValues {
  name: string;
  description?: string;
  objects: {
    name: string;
    fields: {
      fieldName: string;
      fieldType: string;
      description?: string;
      isRequired: boolean;
      isUnique: boolean;
    }[]
  }[];
  permissions: {
    objectName: string;
    action: "create" | "read" | "update" | "delete";
    role: string;
    isAllowed: boolean;
    conditions?: string;
  }[];
}
