/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Resources = {
  properties: {
    id: {
      type: 'number',
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
    title: {
      type: 'string',
      isRequired: true,
      maxLength: 255,
    },
    description_html: {
      type: 'string',
      isRequired: true,
    },
    image: {
      type: 'string',
      isRequired: true,
      format: 'uri',
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
