/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Cities = {
  readonly id: number;
  /**
   * Model type name
   */
  readonly _type: string;
  readonly created_at: string;
  readonly modified_at: string;
  name: string;
  description?: string | null;
  postal_address: string;
  picture?: string | null;
  cover_photo?: string | null;
  website?: string | null;
  population?: number | null;
  census2010_pop?: number | null;
  altitude?: number | null;
  county?: string | null;
  land_area?: number | null;
  water_area?: number | null;
  total_area?: number | null;
  density?: number | null;
  timezone?: string | null;
  place_code?: string | null;
  sumlev?: string | null;
  funcstat?: string | null;
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
  readonly state_id: {
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
  readonly sponsors: Array<{
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
  readonly officials: Array<{
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

