/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedCitiesRequest = {
  properties: {
    name: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
    description: {
      type: 'string',
      isNullable: true,
    },
    postal_address: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
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
      type: 'number',
      isNullable: true,
    },
    state_id: {
      type: 'number',
      isNullable: true,
    },
    sponsors: {
      type: 'array',
      contains: {
        type: 'number',
      },
    },
    officials: {
      type: 'array',
      contains: {
        type: 'number',
      },
    },
  },
} as const;
