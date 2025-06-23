/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $RalliesRequest = {
  properties: {
    title: {
      type: 'string',
      isRequired: true,
      maxLength: 255,
      minLength: 1,
    },
    description: {
      type: 'string',
      isRequired: true,
      minLength: 1,
    },
    media: {
      type: 'binary',
      isNullable: true,
      format: 'binary',
    },
    comments: {
      type: 'string',
      isNullable: true,
    },
    author: {
      type: 'number',
      isNullable: true,
    },
    topics: {
      type: 'array',
      contains: {
        type: 'number',
      },
      isRequired: true,
    },
  },
} as const;
