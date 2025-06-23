/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $UsersRequest = {
  properties: {
    last_login: {
      type: 'string',
      isNullable: true,
      format: 'date-time',
    },
    username: {
      type: 'string',
      description: `Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.`,
      isRequired: true,
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
