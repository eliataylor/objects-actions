/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PartiesRequest = {
  properties: {
    name: {
      type: 'string',
      isNullable: true,
      maxLength: 255,
    },
    logo: {
      type: 'binary',
      isNullable: true,
      format: 'binary',
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
