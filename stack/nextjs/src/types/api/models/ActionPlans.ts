/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ActionPlans = {
  readonly id: number;
  readonly created_at: string;
  readonly modified_at: string;
  title?: string | null;
  recommendation?: string | null;
  exe_summary?: string | null;
  analysis?: string | null;
  background?: string | null;
  pro_argument?: string | null;
  con_argument?: string | null;
  prerequisites: string;
  timeline?: string | null;
  author?: number | null;
  rally?: number | null;
  coauthors?: Array<number>;
};

