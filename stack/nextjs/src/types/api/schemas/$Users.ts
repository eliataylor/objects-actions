/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Users = {
  properties: {
    id: {
      type: 'number',
      isReadOnly: true,
      isRequired: true,
    },
    _type: {
      type: 'string',
      description: `Model type name`,
      isReadOnly: true,
      isRequired: true,
    },
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
        properties: {
          id: {
            type: 'number',
            description: `Primary key of the related object`,
            isRequired: true,
          },
          str: {
            type: 'string',
            description: `String representation of the related object`,
            isRequired: true,
          },
          _type: {
            type: 'string',
            description: `Type name of the related object`,
            isRequired: true,
          },
        },
      },
      isReadOnly: true,
      isRequired: true,
    },
    user_permissions: {
      type: 'array',
      contains: {
        properties: {
          id: {
            type: 'number',
            description: `Primary key of the related object`,
            isRequired: true,
          },
          str: {
            type: 'string',
            description: `String representation of the related object`,
            isRequired: true,
          },
          _type: {
            type: 'string',
            description: `Type name of the related object`,
            isRequired: true,
          },
        },
      },
      isReadOnly: true,
      isRequired: true,
    },
    resources: {
      type: 'array',
      contains: {
        properties: {
          id: {
            type: 'number',
            description: `Primary key of the related object`,
            isRequired: true,
          },
          str: {
            type: 'string',
            description: `String representation of the related object`,
            isRequired: true,
          },
          _type: {
            type: 'string',
            description: `Type name of the related object`,
            isRequired: true,
          },
        },
      },
      isReadOnly: true,
      isRequired: true,
    },
  },
} as const;
