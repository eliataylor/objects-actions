/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PatchedStakeholders = {
  readonly id?: number;
  /**
   * Model type name
   */
  readonly _type?: string;
  readonly created_at?: string;
  readonly modified_at?: string;
  name?: string | null;
  image?: string | null;
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
};

