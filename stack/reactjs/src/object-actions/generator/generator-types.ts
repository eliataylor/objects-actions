interface AIFieldDefinition {
  label?: string;
  machine_name?: string;
  field_type?: string;
  cardinality?: number | typeof Infinity;
  required?: boolean;
  relationship?: string;
  default?: string;
  example?: string;
}

export interface AiSchemaResponse {
  content_types: SchemaContentType[];
}

export interface SchemaContentType {
  model_name: string;
  name: string;
  fields: AIFieldDefinition[];
}

export interface WorksheetApiResponse {
  data: WorksheetModel;
  success: boolean;
  errors?: string[];
}

export interface WorksheetApiResponse {
  data: WorksheetModel;
  success: boolean;
  errors?: string[];
}

export interface WorksheetListResponse {
  count: number;
  offset: number;
  limit: number;
  meta: any;
  error: string | null;
  results: WorksheetModel[];
}

export interface WorksheetModel {
  id: number;
  prompt: string;
  response: string;
  schema: AiSchemaResponse;
  created_at: string;
  modified_at: string;
  assistantconfig: number;

  // Version tracking fields
  parent: number | null;
  versions_count: number;
  version_tree: VersionTree;
}

interface VersionTree {
  id: number;
  name?: string;
  children: VersionTree[];
}
