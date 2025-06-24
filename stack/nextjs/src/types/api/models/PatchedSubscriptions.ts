/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubscriptionsStatusEnum } from './SubscriptionsStatusEnum';
export type PatchedSubscriptions = {
  readonly id?: number;
  readonly created_at?: string;
  readonly modified_at?: string;
  status?: SubscriptionsStatusEnum;
  author?: number | null;
  subscriber?: number | null;
  rally?: number | null;
  meeting?: number | null;
};

