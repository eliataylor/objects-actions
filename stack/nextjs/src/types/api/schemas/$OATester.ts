/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $OATester = {
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
    is_superuser: {
      type: 'boolean',
      description: `Designates that this user has all permissions without explicitly assigning them.`,
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
