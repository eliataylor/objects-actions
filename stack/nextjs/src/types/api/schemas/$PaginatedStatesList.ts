/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PaginatedStatesList = {
  properties: {
    count: {
      type: 'number',
      isRequired: true,
    },
    next: {
      type: 'string',
      isNullable: true,
      format: 'uri',
    },
    previous: {
      type: 'string',
      isNullable: true,
      format: 'uri',
    },
    results: {
      type: 'array',
      contains: {
        type: 'States',
      },
      isRequired: true,
    },
  },
} as const;
