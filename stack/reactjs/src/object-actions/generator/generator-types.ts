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

export interface WorksheetListResponse {
  count: number;
  offset: number;
  limit: number;
  meta: any;
  error: string | null;
  results: SchemaVersions[];
}

export type ProjectSchema = {
  id: number;
  title?: string;
  author?: RelEntity<"Users">;
  created_at: string; // ISO 8601 date string
  modifiedAt: string; // ISO 8601 date string
  active: boolean;
  collaborators: RelEntity<"Users">[];
};

type PrivacyChoices =
  | "public"
  | "unlisted"
  | "inviteonly"
  | "authusers"
  | "onlyme"
  | "archived";

export type SchemaVersions = {
  id: number;
  author?: RelEntity<"Users">;
  created_at: string; // ISO 8601 date string
  project?: ProjectSchema;
  prompt: string;
  privacy: PrivacyChoices;
  assistant_id: string;
  thread_id?: string;
  message_id?: string;
  run_id?: string;
  openai_model?: string;
  reasoning?: string;
  schema?: AiSchemaResponse;
  versions_count: number;
  version_tree: VersionTree;
  parent?: number;
  version_notes?: string;
  versions?: SchemaVersions[];
};

interface VersionTree {
  id: number;
  name?: string;
  children: VersionTree[];
}

export type StreamChunk = {
  type: "message" | "tool_result" | "corrected_schema" | "done" | "reasoning" | "keep_alive" | "error";
  event?: string;
  content?: string;
  schema?: AiSchemaResponse
  config_id?: number;
  version_id?: number;
  error?: string;
};
