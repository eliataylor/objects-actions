/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedOATesterRequest = {
  properties: {
    last_login: {
      type: 'string',
      isNullable: true,
      format: 'date-time',
    },
    is_superuser: {
      type: 'boolean',
      description: `Designates that this user has all permissions without explicitly assigning them.`,
    },
    username: {
      type: 'string',
      description: `Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.`,
      maxLength: 150,
      minLength: 1,
      pattern: '^[\\w.@+-]+$',
    },
    first_name: {
      type: 'string',
      maxLength: 150,
    },
    last_name: {
      type: 'string',
      maxLength: 150,
    },
    email: {
      type: 'string',
      format: 'email',
      maxLength: 254,
    },
    is_staff: {
      type: 'boolean',
      description: `Designates whether the user can log into this admin site.`,
    },
    is_active: {
      type: 'boolean',
      description: `Designates whether this user should be treated as active. Unselect this instead of deleting accounts.`,
    },
    date_joined: {
      type: 'string',
      format: 'date-time',
    },
    phone: {
      type: 'string',
      isNullable: true,
      maxLength: 16,
    },
    website: {
      type: 'string',
      isNullable: true,
      format: 'uri',
      maxLength: 200,
    },
    bio: {
      type: 'string',
      isNullable: true,
    },
    picture: {
      type: 'binary',
      isNullable: true,
      format: 'binary',
    },
    cover_photo: {
      type: 'binary',
      isNullable: true,
      format: 'binary',
    },
    groups: {
      type: 'array',
      contains: {
        type: 'number',
      },
    },
    user_permissions: {
      type: 'array',
      contains: {
        type: 'number',
      },
    },
    resources: {
      type: 'array',
      contains: {
        type: 'number',
      },
    },
  },
} as const;
