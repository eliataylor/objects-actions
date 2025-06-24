/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Cities = {
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
    created_at: {
      type: 'string',
      isReadOnly: true,
      isRequired: true,
      format: 'date-time',
    },
    modified_at: {
      type: 'string',
      isReadOnly: true,
      isRequired: true,
      format: 'date-time',
    },
    name: {
      type: 'string',
      isRequired: true,
      maxLength: 255,
    },
    description: {
      type: 'string',
      isNullable: true,
    },
    postal_address: {
      type: 'string',
      isRequired: true,
      maxLength: 255,
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
    website: {
      type: 'string',
      isNullable: true,
      format: 'uri',
      maxLength: 200,
    },
    population: {
      type: 'number',
      isNullable: true,
      maximum: 2147483647,
      minimum: -2147483648,
    },
    census2010_pop: {
      type: 'number',
      isNullable: true,
      maximum: 2147483647,
      minimum: -2147483648,
    },
    altitude: {
      type: 'number',
      isNullable: true,
      maximum: 2147483647,
      minimum: -2147483648,
    },
    county: {
      type: 'string',
      isNullable: true,
      maxLength: 255,
    },
    land_area: {
      type: 'number',
      isNullable: true,
      maximum: 2147483647,
      minimum: -2147483648,
    },
    water_area: {
      type: 'number',
      isNullable: true,
      maximum: 2147483647,
      minimum: -2147483648,
    },
    total_area: {
      type: 'number',
      isNullable: true,
      maximum: 2147483647,
      minimum: -2147483648,
    },
    density: {
      type: 'number',
      isNullable: true,
      maximum: 2147483647,
      minimum: -2147483648,
    },
    timezone: {
      type: 'string',
      isNullable: true,
      maxLength: 255,
    },
    place_code: {
      type: 'string',
      isNullable: true,
      maxLength: 7,
    },
    sumlev: {
      type: 'string',
      isNullable: true,
      maxLength: 3,
    },
    funcstat: {
      type: 'string',
      isNullable: true,
      maxLength: 1,
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
      isRequired: true,
      isNullable: true,
    },
    state_id: {
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
      isRequired: true,
      isNullable: true,
    },
    sponsors: {
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
      isRequired: true,
    },
    officials: {
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
      isRequired: true,
    },
  },
} as const;
