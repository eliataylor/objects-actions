/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ActionPlans = {
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
      isNullable: true,
      maxLength: 255,
    },
    recommendation: {
      type: 'string',
      isNullable: true,
    },
    exe_summary: {
      type: 'string',
      isNullable: true,
    },
    analysis: {
      type: 'string',
      isNullable: true,
    },
    background: {
      type: 'string',
      isNullable: true,
    },
    pro_argument: {
      type: 'string',
      isNullable: true,
    },
    con_argument: {
      type: 'string',
      isNullable: true,
    },
    prerequisites: {
      type: 'string',
      isRequired: true,
    },
    timeline: {
      type: 'string',
      isNullable: true,
    },
    author: {
      type: 'number',
      isNullable: true,
    },
    rally: {
      type: 'number',
      isNullable: true,
    },
    coauthors: {
      type: 'array',
      contains: {
        type: 'number',
      },
    },
  },
} as const;
