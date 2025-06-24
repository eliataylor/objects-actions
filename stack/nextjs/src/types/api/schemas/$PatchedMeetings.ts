/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedMeetings = {
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
    title: {
      type: 'string',
      isNullable: true,
      maxLength: 255,
    },
    address: {
      type: 'string',
      maxLength: 255,
    },
    start: {
      type: 'string',
      format: 'date-time',
    },
    end: {
      type: 'string',
      format: 'date-time',
    },
    agenda_json: {
      properties: {
      },
      isNullable: true,
    },
    duration: {
      type: 'number',
      isNullable: true,
      maximum: 2147483647,
      minimum: -2147483648,
    },
    privacy: {
      type: 'number',
      isNullable: true,
      maximum: 2147483647,
      minimum: -2147483648,
    },
    author: {
      type: 'number',
      isNullable: true,
    },
    rally: {
      type: 'number',
      isNullable: true,
    },
    meeting_type: {
      type: 'number',
      isNullable: true,
    },
    speakers: {
      type: 'array',
      contains: {
        type: 'number',
      },
    },
    moderators: {
      type: 'array',
      contains: {
        type: 'number',
      },
    },
    sponsors: {
      type: 'array',
      contains: {
        type: 'number',
      },
    },
  },
} as const;
