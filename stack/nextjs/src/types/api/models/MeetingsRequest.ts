/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MeetingsRequest = {
  title?: string | null;
  address: string;
  start: string;
  end: string;
  agenda_json?: any;
  duration?: number | null;
  privacy?: number | null;
  author?: number | null;
  rally?: number | null;
  meeting_type?: number | null;
  speakers: Array<number>;
  moderators: Array<number>;
  sponsors?: Array<number>;
};

