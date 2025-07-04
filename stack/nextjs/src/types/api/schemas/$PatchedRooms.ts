/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedRooms = {
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
    start: {
      type: 'string',
      format: 'date-time',
    },
    end: {
      type: 'string',
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
      type: 'string',
      isNullable: true,
      format: 'uri',
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
