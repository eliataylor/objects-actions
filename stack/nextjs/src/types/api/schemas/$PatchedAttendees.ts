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
    _type: {
      type: 'string',
      description: `Model type name`,
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
      properties: {
        id: {
          type: 'number',
          description: `Primary key of the related object`,
          isRequired: true,
        },
        str: {
          type: 'string',
          description: `String representation of the related object`,
          isRequired: true,
        },
        _type: {
          type: 'string',
          description: `Type name of the related object`,
          isRequired: true,
        },
        entity: {
          type: 'dictionary',
          contains: {
            properties: {
            },
          },
          isNullable: true,
        },
        img: {
          type: 'string',
          description: `Image URL if available`,
          isNullable: true,
          format: 'uri',
        },
      },
      isReadOnly: true,
      isNullable: true,
    },
    room_id: {
      properties: {
        id: {
          type: 'number',
          description: `Primary key of the related object`,
          isRequired: true,
        },
        str: {
          type: 'string',
          description: `String representation of the related object`,
          isRequired: true,
        },
        _type: {
          type: 'string',
          description: `Type name of the related object`,
          isRequired: true,
        },
        entity: {
          type: 'dictionary',
          contains: {
            properties: {
            },
          },
          isNullable: true,
        },
        img: {
          type: 'string',
          description: `Image URL if available`,
          isNullable: true,
          format: 'uri',
        },
      },
      isReadOnly: true,
      isNullable: true,
    },
  },
} as const;
