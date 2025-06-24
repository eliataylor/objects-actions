/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OATester = {
  readonly id: number;
  /**
   * Model type name
   */
  readonly _type: string;
  last_login?: string | null;
  /**
   * Designates that this user has all permissions without explicitly assigning them.
   */
  is_superuser?: boolean;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   */
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  /**
   * Designates whether the user can log into this admin site.
   */
  is_staff?: boolean;
  /**
   * Designates whether this user should be treated as active. Unselect this instead of deleting accounts.
   */
  is_active?: boolean;
  date_joined?: string;
  phone?: string | null;
  website?: string | null;
  bio?: string | null;
  picture?: string | null;
  cover_photo?: string | null;
  readonly groups: Array<{
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
  }>;
  readonly user_permissions: Array<{
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
  }>;
  readonly resources: Array<{
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
  }>;
};

