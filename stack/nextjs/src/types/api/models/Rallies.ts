/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Rallies = {
  readonly id: number;
  readonly created_at: string;
  readonly modified_at: string;
  title: string;
  description: string;
  media?: string | null;
  comments?: string | null;
  author?: number | null;
  topics: Array<number>;
};

