/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Rallies = {
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
    description: {
      type: 'string',
      isRequired: true,
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
      isRequired: true,
    },
  },
} as const;
