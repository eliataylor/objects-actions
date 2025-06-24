/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedResourcesRequest = {
  properties: {
    title: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
    },
    description_html: {
      type: 'string',
      minLength: 1,
    },
    image: {
      type: 'binary',
      format: 'binary',
    },
    postal_address: {
      type: 'string',
      isNullable: true,
      maxLength: 255,
    },
    price_ccoin: {
      type: 'number',
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
    },
    resource_type: {
      type: 'array',
      contains: {
        type: 'number',
      },
    },
  },
} as const;
