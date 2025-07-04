/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoleEnum } from './RoleEnum';
export type PatchedAttendees = {
  readonly id?: number;
  readonly created_at?: string;
  readonly modified_at?: string;
  display_name?: string | null;
  display_bg?: string | null;
  role?: RoleEnum;
  stream?: string | null;
  is_muted?: boolean | null;
  sharing_video?: boolean | null;
  sharing_audio?: boolean | null;
  sharing_screen?: boolean | null;
  hand_raised?: boolean | null;
  is_typing?: boolean | null;
  author?: number | null;
  room_id?: number | null;
};

