/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvitesStatusEnum } from './InvitesStatusEnum';
export type Invites = {
  readonly id: number;
  /**
   * Model type name
   */
  readonly _type: string;
  readonly created_at: string;
  readonly modified_at: string;
  status: InvitesStatusEnum;
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
  readonly meeting: {
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
  readonly user: {
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
  readonly invited_by: {
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

