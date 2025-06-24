/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedOfficialsRequest = {
  properties: {
    title: {
      type: 'string',
      maxLength: 255,
      minLength: 1,
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
    },
  },
} as const;
