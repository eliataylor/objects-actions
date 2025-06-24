/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedAttendeesRequest = {
  properties: {
    display_name: {
      type: 'string',
      isNullable: true,
      maxLength: 255,
    },
    display_bg: {
      type: 'binary',
      isNullable: true,
      format: 'binary',
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
