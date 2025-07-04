/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PaginatedMeetingTypesList = {
  properties: {
    count: {
      type: 'number',
      isRequired: true,
    },
    next: {
      type: 'string',
      isNullable: true,
      format: 'uri',
    },
    previous: {
      type: 'string',
      isNullable: true,
      format: 'uri',
    },
    results: {
      type: 'array',
      contains: {
        type: 'MeetingTypes',
      },
      isRequired: true,
    },
  },
} as const;
