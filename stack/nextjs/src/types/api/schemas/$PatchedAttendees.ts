/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedAttendees = {
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
    display_name: {
      type: 'string',
      isNullable: true,
      maxLength: 255,
    },
    display_bg: {
      type: 'string',
      isNullable: true,
      format: 'uri',
    },
    role: {
      type: 'RoleEnum',
    },
    stream: {
      type: 'string',
      isNullable: true,
      maxLength: 255,
    },
    is_muted: {
      type: 'boolean',
      isNullable: true,
    },
    sharing_video: {
      type: 'boolean',
      isNullable: true,
    },
    sharing_audio: {
      type: 'boolean',
      isNullable: true,
    },
    sharing_screen: {
      type: 'boolean',
      isNullable: true,
    },
    hand_raised: {
      type: 'boolean',
      isNullable: true,
    },
    is_typing: {
      type: 'boolean',
      isNullable: true,
    },
    author: {
      type: 'number',
      isNullable: true,
    },
    room_id: {
      type: 'number',
      isNullable: true,
    },
  },
} as const;
