/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedResources = {
  properties: {
    id: {
      type: 'number',
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
    description_html: {
      type: 'string',
    },
    image: {
      type: 'string',
      format: 'uri',
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
