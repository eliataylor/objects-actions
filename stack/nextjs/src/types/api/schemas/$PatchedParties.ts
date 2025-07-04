/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedParties = {
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
    name: {
      type: 'string',
      isNullable: true,
      maxLength: 255,
    },
    logo: {
      type: 'string',
      isNullable: true,
      format: 'uri',
    },
    website: {
      type: 'string',
      isNullable: true,
      format: 'uri',
      maxLength: 200,
    },
    author: {
      type: 'number',
      isNullable: true,
    },
  },
} as const;
