/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $SubscriptionsRequest = {
  properties: {
    status: {
      type: 'SubscriptionsStatusEnum',
      isRequired: true,
    },
    author: {
      type: 'number',
      isNullable: true,
    },
    subscriber: {
      type: 'number',
      isNullable: true,
    },
    rally: {
      type: 'number',
      isNullable: true,
    },
    meeting: {
      type: 'number',
      isNullable: true,
    },
  },
} as const;
