/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedUsers = {
  properties: {
    id: {
      type: 'number',
      isReadOnly: true,
    },
    last_login: {
      type: 'string',
      isNullable: true,
      format: 'date-time',
    },
    username: {
      type: 'string',
      description: `Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.`,
      maxLength: 150,
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
      type: 'string',
      isNullable: true,
      format: 'uri',
    },
    cover_photo: {
      type: 'string',
      isNullable: true,
      format: 'uri',
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
