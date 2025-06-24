/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedRallies = {
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
    description: {
      type: 'string',
    },
    media: {
      type: 'string',
      isNullable: true,
      format: 'uri',
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
    },
  },
} as const;
