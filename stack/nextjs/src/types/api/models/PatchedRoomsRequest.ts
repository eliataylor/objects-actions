/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlankEnum } from './BlankEnum';
import type { NullEnum } from './NullEnum';
import type { RoomsPrivacyEnum } from './RoomsPrivacyEnum';
import type { RoomsStatusEnum } from './RoomsStatusEnum';
export type PatchedRoomsRequest = {
  start?: string;
  end?: string;
  privacy?: (RoomsPrivacyEnum | BlankEnum | NullEnum) | null;
  status?: (RoomsStatusEnum | BlankEnum | NullEnum) | null;
  chat_thread?: string | null;
  recording?: Blob | null;
  author?: number | null;
  rally?: number | null;
  meeting?: number | null;
};

