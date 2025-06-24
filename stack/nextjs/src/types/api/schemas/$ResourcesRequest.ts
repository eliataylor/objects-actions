/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ResourcesRequest = {
  properties: {
    title: {
      type: 'string',
      isRequired: true,
      maxLength: 255,
      minLength: 1,
    },
    description_html: {
      type: 'string',
      isRequired: true,
      minLength: 1,
    },
    image: {
      type: 'binary',
      isRequired: true,
      format: 'binary',
    },
    postal_address: {
      type: 'string',
      isNullable: true,
      maxLength: 255,
    },
    price_ccoin: {
      type: 'number',
      isRequired: true,
      maximum: 2147483647,
      minimum: -2147483648,
    },
    author: {
      type: 'number',
      isNullable: true,
    },
    cities: {
      type: 'array',
      contains: {
        type: 'number',
      },
      isRequired: true,
    },
    resource_type: {
      type: 'array',
      contains: {
        type: 'number',
      },
      isRequired: true,
    },
  },
} as const;
