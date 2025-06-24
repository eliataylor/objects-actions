/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoleEnum } from './RoleEnum';
export type Attendees = {
  readonly id: number;
  /**
   * Model type name
   */
  readonly _type: string;
  readonly created_at: string;
  readonly modified_at: string;
  display_name?: string | null;
  display_bg?: string | null;
  role: RoleEnum;
  stream?: string | null;
  is_muted?: boolean | null;
  sharing_video?: boolean | null;
  sharing_audio?: boolean | null;
  sharing_screen?: boolean | null;
  hand_raised?: boolean | null;
  is_typing?: boolean | null;
  readonly author: {
    /**
     * Primary key of the related object
     */
    id: number;
    /**
     * String representation of the related object
     */
    str: string;
    /**
     * Type name of the related object
     */
    _type: string;
    /**
     * Additional fields based on query parameters
     */
    entity?: Record<string, any> | null;
    /**
     * Image URL if available
     */
    img?: string | null;
  } | null;
  readonly room_id: {
    /**
     * Primary key of the related object
     */
    id: number;
    /**
     * String representation of the related object
     */
    str: string;
    /**
     * Type name of the related object
     */
    _type: string;
    /**
     * Additional fields based on query parameters
     */
    entity?: Record<string, any> | null;
    /**
     * Image URL if available
     */
    img?: string | null;
  } | null;
};

