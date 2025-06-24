/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $VerifyPhoneRequest = {
  properties: {
    phone: {
      type: 'string',
      isRequired: true,
      minLength: 1,
    },
    code: {
      type: 'string',
      isRequired: true,
      minLength: 1,
    },
  },
} as const;
