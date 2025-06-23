/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $RoomsRequest = {
  properties: {
    start: {
      type: 'string',
      isRequired: true,
      format: 'date-time',
    },
    end: {
      type: 'string',
      isRequired: true,
      format: 'date-time',
    },
    privacy: {
      type: 'one-of',
      contains: [{
        type: 'RoomsPrivacyEnum',
      }, {
        type: 'BlankEnum',
      }, {
        type: 'NullEnum',
      }],
      isNullable: true,
    },
    status: {
      type: 'one-of',
      contains: [{
        type: 'RoomsStatusEnum',
      }, {
        type: 'BlankEnum',
      }, {
        type: 'NullEnum',
      }],
      isNullable: true,
    },
    chat_thread: {
      type: 'string',
      isNullable: true,
      maxLength: 255,
    },
    recording: {
      type: 'binary',
      isNullable: true,
      format: 'binary',
    },
    author: {
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
