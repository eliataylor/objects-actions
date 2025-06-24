/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedRallies = {
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
    description: {
      type: 'string',
    },
    media: {
      type: 'string',
      isNullable: true,
      format: 'uri',
    },
    comments: {
      type: 'string',
      isNullable: true,
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
    topics: {
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
