/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvitesStatusEnum } from './InvitesStatusEnum';
export type PatchedInvitesRequest = {
  status?: InvitesStatusEnum;
  author?: number | null;
  meeting?: number | null;
  user?: number | null;
  invited_by?: number | null;
};

