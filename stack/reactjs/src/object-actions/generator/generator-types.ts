import { RelEntity } from "../types/types";

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
  forceExpand?: boolean;
}

export interface WorksheetApiResponse {
  data: WorksheetModel;
  success: boolean;
  errors?: string[];
}

export interface WorksheetStreamResponse {
  reasoning?: string;
  schema?: Record<string, unknown>;
  config_id?: number;
  error?: string;
}

export interface WorksheetListResponse {
  count: number;
  offset: number;
  limit: number;
  meta: any;
  error: string | null;
  results: WorksheetModel[];
}

interface SerializedPromptConfig {
  id: number;
  author: RelEntity<'Users'>;

  collaborators: RelEntity<'Users'>[];

  run_id: string | null;
  thread_id: string | null;
  message_id: string | null;
  assistant_id: string | null;

}

export interface WorksheetModel {
  id: number;
  author: RelEntity<'Users'>
  created_at: string;
  modified_at: string;
  privacy: 'public' | 'unlisted' | 'inviteonly' | 'authusers' | 'onlyme' | 'archived'

  prompt: string;
  config: SerializedPromptConfig;

  response: string;
  schema: AiSchemaResponse;


  // Version tracking fields
  parent: number | null;
  version_notes: string | null;
  versions_count: number;
  version_tree: VersionTree;
}

interface VersionTree {
  id: number;
  name?: string;
  children: VersionTree[];
}


export type StreamChunk = {
  type: "message" | "tool_result" | "corrected_schema" | "done" | "reasoning";
  event?: string;
  content?: string;
  schema?: AiSchemaResponse
  config_id?: number;
  version_id?: number;
  error?: string;
};
