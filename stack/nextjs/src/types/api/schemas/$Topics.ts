/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Topics = {
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
    name: {
      type: 'string',
      isNullable: true,
      maxLength: 255,
    },
    icon: {
      type: 'string',
      isNullable: true,
      format: 'uri',
    },
    photo: {
      type: 'string',
      isNullable: true,
      format: 'uri',
    },
    author: {
      type: 'number',
      isNullable: true,
    },
  },
} as const;
