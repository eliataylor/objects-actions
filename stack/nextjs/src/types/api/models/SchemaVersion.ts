/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlankEnum } from './BlankEnum';
import type { NullEnum } from './NullEnum';
import type { SchemaVersionPrivacyEnum } from './SchemaVersionPrivacyEnum';
export type SchemaVersion = {
  readonly id: number;
  readonly versions_count: string;
  readonly version_tree: string;
  readonly created_at: string;
  prompt: string;
  privacy?: (SchemaVersionPrivacyEnum | BlankEnum | NullEnum) | null;
  assistant_id: string;
  thread_id?: string | null;
  message_id?: string | null;
  run_id?: string | null;
  openai_model?: string | null;
  reasoning?: string | null;
  schema?: any;
  version_notes?: string | null;
  author?: number | null;
  project?: number | null;
  parent?: number | null;
};

