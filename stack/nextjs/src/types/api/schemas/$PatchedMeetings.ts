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
    rally: {
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
    meeting_type: {
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
    speakers: {
      type: 'array',
      contains: {
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
      },
      isReadOnly: true,
    },
    moderators: {
      type: 'array',
      contains: {
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
      },
      isReadOnly: true,
    },
    sponsors: {
      type: 'array',
      contains: {
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
      },
      isReadOnly: true,
    },
  },
} as const;
