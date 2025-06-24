/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PatchedSchemaVersion = {
  properties: {
    id: {
      type: 'number',
      isReadOnly: true,
    },
    versions_count: {
      type: 'string',
      isReadOnly: true,
    },
    version_tree: {
      type: 'string',
      isReadOnly: true,
    },
    created_at: {
      type: 'string',
      isReadOnly: true,
      format: 'date-time',
    },
    prompt: {
      type: 'string',
      maxLength: 4000,
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
      maxLength: 100,
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
