/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $SchemaVersionRequest = {
  properties: {
    prompt: {
      type: 'string',
      isRequired: true,
      maxLength: 4000,
      minLength: 1,
    },
    privacy: {
      type: 'one-of',
      contains: [{
        type: 'SchemaVersionPrivacyEnum',
      }, {
        type: 'BlankEnum',
      }, {
        type: 'NullEnum',
      }],
      isNullable: true,
    },
    assistant_id: {
      type: 'string',
      isRequired: true,
      maxLength: 100,
      minLength: 1,
    },
    thread_id: {
      type: 'string',
      isNullable: true,
      maxLength: 100,
    },
    message_id: {
      type: 'string',
      isNullable: true,
      maxLength: 100,
    },
    run_id: {
      type: 'string',
      isNullable: true,
      maxLength: 100,
    },
    openai_model: {
      type: 'string',
      isNullable: true,
      maxLength: 100,
    },
    reasoning: {
      type: 'string',
      isNullable: true,
    },
    schema: {
      properties: {
      },
      isNullable: true,
    },
    version_notes: {
      type: 'string',
      isNullable: true,
    },
    author: {
      type: 'number',
      isNullable: true,
    },
    project: {
      type: 'number',
      isNullable: true,
    },
    parent: {
      type: 'number',
      isNullable: true,
    },
  },
} as const;
