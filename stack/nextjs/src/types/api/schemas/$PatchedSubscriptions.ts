/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedSubscriptions = {
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
    status: {
      type: 'SubscriptionsStatusEnum',
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
