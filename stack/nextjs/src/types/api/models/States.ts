/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type States = {
  readonly id: number;
  /**
   * Model type name
   */
  readonly _type: string;
  readonly created_at: string;
  readonly modified_at: string;
  name?: string | null;
  state_code?: string | null;
  website?: string | null;
  icon?: string | null;
  population?: number | null;
  census2010_pop?: number | null;
  city_count?: number | null;
  total_city_population?: number | null;
  avg_city_population?: number | null;
  state_area?: number | null;
  population_density?: number | null;
  urban_population?: number | null;
  rural_population?: number | null;
  urban_percentage?: number | null;
  growth_rate?: number | null;
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
  readonly largest_city: {
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
  readonly smallest_city: {
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
  readonly fastest_growing_city: {
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

