/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedOfficials = {
  properties: {
    id: {
      type: 'number',
      isReadOnly: true,
    },
    _type: {
      type: 'string',
      description: `Model type name`,
      isReadOnly: true,
    },
    created_at: {
      type: 'string',
      isReadOnly: true,
      format: 'date-time',
    },
    modified_at: {
      type: 'string',
      isReadOnly: true,
      format: 'date-time',
    },
    title: {
      type: 'string',
      maxLength: 255,
    },
    office_phone: {
      type: 'string',
      isNullable: true,
      maxLength: 16,
    },
    office_email: {
      type: 'string',
      isNullable: true,
      format: 'email',
      maxLength: 254,
    },
    social_links: {
      type: 'string',
      isNullable: true,
      format: 'uri',
      maxLength: 200,
    },
    author: {
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
        entity: {
          type: 'dictionary',
          contains: {
            properties: {
            },
          },
          isNullable: true,
        },
        img: {
          type: 'string',
          description: `Image URL if available`,
          isNullable: true,
          format: 'uri',
        },
      },
      isReadOnly: true,
      isNullable: true,
    },
    party_affiliation: {
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
        entity: {
          type: 'dictionary',
          contains: {
            properties: {
            },
          },
          isNullable: true,
        },
        img: {
          type: 'string',
          description: `Image URL if available`,
          isNullable: true,
          format: 'uri',
        },
      },
      isReadOnly: true,
      isNullable: true,
    },
    city: {
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
          entity: {
            type: 'dictionary',
            contains: {
              properties: {
              },
            },
            isNullable: true,
          },
          img: {
            type: 'string',
            description: `Image URL if available`,
            isNullable: true,
            format: 'uri',
          },
        },
      },
      isReadOnly: true,
    },
  },
} as const;
