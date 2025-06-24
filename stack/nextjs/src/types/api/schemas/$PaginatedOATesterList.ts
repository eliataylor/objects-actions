/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PaginatedOATesterList = {
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
        type: 'OATester',
      },
      isRequired: true,
    },
  },
} as const;
