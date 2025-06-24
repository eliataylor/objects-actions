/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Users = {
  readonly id: number;
  last_login?: string | null;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   */
  username: string;
  first_name?: string;
  last_name?: string;
  date_joined?: string;
  phone?: string | null;
  website?: string | null;
  bio?: string | null;
  picture?: string | null;
  cover_photo?: string | null;
  /**
   * The groups this user belongs to. A user will get all permissions granted to each of their groups.
   */
  groups?: Array<number>;
  /**
   * Specific permissions for this user.
   */
  user_permissions?: Array<number>;
  resources?: Array<number>;
};

