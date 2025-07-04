/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Invites = {
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
    status: {
      type: 'InvitesStatusEnum',
      isRequired: true,
    },
    author: {
      type: 'number',
      isNullable: true,
    },
    meeting: {
      type: 'number',
      isNullable: true,
    },
    user: {
      type: 'number',
      isNullable: true,
    },
    invited_by: {
      type: 'number',
      isNullable: true,
    },
  },
} as const;
