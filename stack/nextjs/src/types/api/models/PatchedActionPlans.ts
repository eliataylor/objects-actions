/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PatchedActionPlans = {
  readonly id?: number;
  /**
   * Model type name
   */
  readonly _type?: string;
  readonly created_at?: string;
  readonly modified_at?: string;
  title?: string | null;
  recommendation?: string | null;
  exe_summary?: string | null;
  analysis?: string | null;
  background?: string | null;
  pro_argument?: string | null;
  con_argument?: string | null;
  prerequisites?: string;
  timeline?: string | null;
  readonly author?: {
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
  readonly rally?: {
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
  readonly coauthors?: Array<{
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
  }>;
};

