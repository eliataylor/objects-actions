/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Officials = {
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
    office_phone: {
      type: 'string',
      isNullable: true,
      maxLength: 16,
    },
    office_email: {
      type: 'string',
      isNullable: true,
      format: 'email',
      maxLength: 254,
    },
    social_links: {
      type: 'string',
      isNullable: true,
      format: 'uri',
      maxLength: 200,
    },
    author: {
      type: 'number',
      isNullable: true,
    },
    party_affiliation: {
      type: 'number',
      isNullable: true,
    },
    city: {
      type: 'array',
      contains: {
        type: 'number',
      },
      isRequired: true,
    },
  },
} as const;
