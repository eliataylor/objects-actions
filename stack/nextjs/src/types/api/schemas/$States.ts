/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $States = {
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
      isNullable: true,
      maxLength: 255,
    },
    state_code: {
      type: 'string',
      isNullable: true,
      maxLength: 2,
    },
    website: {
      type: 'string',
      isNullable: true,
      format: 'uri',
      maxLength: 200,
    },
    icon: {
      type: 'string',
      isNullable: true,
      format: 'uri',
    },
    population: {
      type: 'number',
      isNullable: true,
      format: 'int64',
      maximum: 9223372036854776000,
      minimum: -9223372036854776000,
    },
    census2010_pop: {
      type: 'number',
      isNullable: true,
      format: 'int64',
      maximum: 9223372036854776000,
      minimum: -9223372036854776000,
    },
    city_count: {
      type: 'number',
      isNullable: true,
      maximum: 2147483647,
      minimum: -2147483648,
    },
    total_city_population: {
      type: 'number',
      isNullable: true,
      format: 'int64',
      maximum: 9223372036854776000,
      minimum: -9223372036854776000,
    },
    avg_city_population: {
      type: 'number',
      isNullable: true,
      maximum: 2147483647,
      minimum: -2147483648,
    },
    state_area: {
      type: 'number',
      isNullable: true,
      maximum: 2147483647,
      minimum: -2147483648,
    },
    population_density: {
      type: 'number',
      isNullable: true,
      format: 'double',
    },
    urban_population: {
      type: 'number',
      isNullable: true,
      format: 'int64',
      maximum: 9223372036854776000,
      minimum: -9223372036854776000,
    },
    rural_population: {
      type: 'number',
      isNullable: true,
      format: 'int64',
      maximum: 9223372036854776000,
      minimum: -9223372036854776000,
    },
    urban_percentage: {
      type: 'number',
      isNullable: true,
      format: 'double',
    },
    growth_rate: {
      type: 'number',
      isNullable: true,
      format: 'double',
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
    largest_city: {
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
    smallest_city: {
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
    fastest_growing_city: {
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
  },
} as const;
