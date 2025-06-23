/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedStatesRequest = {
  properties: {
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
      type: 'binary',
      isNullable: true,
      format: 'binary',
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
      type: 'number',
      isNullable: true,
    },
    largest_city: {
      type: 'number',
      isNullable: true,
    },
    smallest_city: {
      type: 'number',
      isNullable: true,
    },
    fastest_growing_city: {
      type: 'number',
      isNullable: true,
    },
  },
} as const;
