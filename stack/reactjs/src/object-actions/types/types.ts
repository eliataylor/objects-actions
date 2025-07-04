//---OBJECT-ACTIONS-API-RESP-STARTS---//
export type ModelName =
  "Users"
  | "Topics"
  | "ResourceTypes"
  | "MeetingTypes"
  | "States"
  | "Parties"
  | "Stakeholders"
  | "Resources"
  | "Cities"
  | "Officials"
  | "Rallies"
  | "ActionPlans"
  | "Meetings"
  | "Invites"
  | "Subscriptions"
  | "Rooms"
  | "Attendees";

export type ModelType<T extends ModelName> = T extends "Users" ? Users :
  T extends "Topics" ? Topics :
    T extends "ResourceTypes" ? ResourceTypes :
      T extends "MeetingTypes" ? MeetingTypes :
        T extends "States" ? States :
          T extends "Parties" ? Parties :
            T extends "Stakeholders" ? Stakeholders :
              T extends "Resources" ? Resources :
                T extends "Cities" ? Cities :
                  T extends "Officials" ? Officials :
                    T extends "Rallies" ? Rallies :
                      T extends "ActionPlans" ? ActionPlans :
                        T extends "Meetings" ? Meetings :
                          T extends "Invites" ? Invites :
                            T extends "Subscriptions" ? Subscriptions :
                              T extends "Rooms" ? Rooms :
                                T extends "Attendees" ? Attendees : never

export interface RelEntity<T extends ModelName = ModelName> {
  id: string | number;
  str: string;
  _type: T;
  img?: string;
  entity?: Partial<ModelType<T>>;
}

export type ITypeFieldSchema = {
  [K in ModelName]: {
    [fieldName: string]: FieldTypeDefinition;
  };
}

export interface ApiListResponse<T extends ModelName> {
  count: number;
  offset: number;
  limit: number;
  meta: any;
  error: string | null;
  results: Array<ModelType<T>>;
}

export function getProp<T extends ModelName, K extends keyof ModelType<T>>(
  entity: ModelType<T>,
  key: K
): ModelType<T>[K] | null {
  if (key in entity) return entity[key];
  return null;
}

export function restructureAsAllEntities<T extends ModelName>(
  modelName: T,
  entity: Partial<ModelType<T>>
): ModelType<T> {
  const schema = TypeFieldSchema[modelName];
  const result: any = { id: entity.id || 0, _type: modelName };

  Object.entries(schema).forEach(([key, field]) => {
    const value = (entity as any)[key];

    if (field.data_type === "RelEntity") {
      if (!value) {
        // Skip undefined values
      } else if (Array.isArray(value)) {
        // Transform array of RelEntities
        result[key] = value.map((item) =>
          item.entity ? restructureAsAllEntities(item._type as ModelName, item.entity) : item
        );
      } else if (value.entity) {
        // Transform single RelEntity
        result[key] = value.entity ?
          restructureAsAllEntities(value._type as ModelName, value.entity) :
          value;
      } else {
        result[key] = { id: value.id };
      }
    } else if (value !== undefined) {
      result[key] = value;
    }
  });
  return result as ModelType<T>;
}

//---OBJECT-ACTIONS-API-RESP-ENDS---//


//---OBJECT-ACTIONS-TYPE-CONSTANTS-STARTS---//
export interface FieldTypeDefinition {
  machine: string;
  singular: string;
  plural: string;
  data_type: "string" | "number" | "boolean" | "object" | "RelEntity";
  field_type: string;
  cardinality: number | typeof Infinity;
  relationship?: ModelName;
  required: boolean;
  default: string;
  example: string;
  options?: Array<{ label: string; id: string; }>;
}

export const TypeFieldSchema: ITypeFieldSchema = {
  "Topics": {
    "name": {
      "machine": "name",
      "singular": "Name",
      "plural": "Names",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "icon": {
      "machine": "icon",
      "singular": "Icon",
      "plural": "Icons",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "photo": {
      "machine": "photo",
      "singular": "Photo",
      "plural": "Photos",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "ResourceTypes": {
    "name": {
      "machine": "name",
      "singular": "Name",
      "plural": "Names",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "MeetingTypes": {
    "name": {
      "machine": "name",
      "singular": "Name",
      "plural": "Names",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "States": {
    "name": {
      "machine": "name",
      "singular": "Name",
      "plural": "Names",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "website": {
      "machine": "website",
      "singular": "Website",
      "plural": "Websites",
      "field_type": "url",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "icon": {
      "machine": "icon",
      "singular": "Icon",
      "plural": "Icons",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Parties": {
    "name": {
      "machine": "name",
      "singular": "Name",
      "plural": "Names",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "logo": {
      "machine": "logo",
      "singular": "Logo",
      "plural": "Logos",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "website": {
      "machine": "website",
      "singular": "Website",
      "plural": "Websites",
      "field_type": "url",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Stakeholders": {
    "name": {
      "machine": "name",
      "singular": "Name",
      "plural": "Names",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "image": {
      "machine": "image",
      "singular": "Image",
      "plural": "Images",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Resources": {
    "title": {
      "machine": "title",
      "singular": "Title",
      "plural": "Titles",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "description_html": {
      "machine": "description_html",
      "singular": "Description HTML",
      "plural": "Description HTMLS",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "image": {
      "machine": "image",
      "singular": "Image",
      "plural": "Images",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "postal_address": {
      "machine": "postal_address",
      "singular": "Postal Addres",
      "plural": "Postal Addresses",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "price_ccoin": {
      "machine": "price_ccoin",
      "singular": "Price (citizencoin)",
      "plural": "Price (citizencoin)s",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "resource_type": {
      "machine": "resource_type",
      "singular": "Resource Type",
      "plural": "Resource Types",
      "relationship": "ResourceTypes",
      "field_type": "vocabulary_reference",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "default": "",
      "required": true,
      "example": ""
    }
  },
  "Users": {
    "email": {
      "machine": "email",
      "singular": "Email",
      "plural": "Emails",
      "field_type": "email",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "phone": {
      "machine": "phone",
      "singular": "Phone",
      "plural": "Phones",
      "field_type": "phone",
      "data_type": "string",
      "cardinality": 0,
      "default": "",
      "required": false,
      "example": ""
    },
    "website": {
      "machine": "website",
      "singular": "Website",
      "plural": "Websites",
      "field_type": "url",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "bio": {
      "machine": "bio",
      "singular": "Bio",
      "plural": "Bios",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "picture": {
      "machine": "picture",
      "singular": "Picture",
      "plural": "Pictures",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "cover_photo": {
      "machine": "cover_photo",
      "singular": "Cover Photo",
      "plural": "Cover Photos",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "resources": {
      "machine": "resources",
      "singular": "Resource",
      "plural": "Resourceses",
      "relationship": "Resources",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Cities": {
    "name": {
      "machine": "name",
      "singular": "Name",
      "plural": "Names",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "description": {
      "machine": "description",
      "singular": "Description",
      "plural": "Descriptions",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "postal_address": {
      "machine": "postal_address",
      "singular": "Postal Addres",
      "plural": "Postal Addresses",
      "field_type": "address",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "picture": {
      "machine": "picture",
      "singular": "Picture",
      "plural": "Pictures",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "cover_photo": {
      "machine": "cover_photo",
      "singular": "Cover Photo",
      "plural": "Cover Photos",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "sponsors": {
      "machine": "sponsors",
      "singular": "Sponsor",
      "plural": "Sponsorss",
      "relationship": "Users",
      "field_type": "user_profile",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "default": "",
      "required": false,
      "example": ""
    },
    "website": {
      "machine": "website",
      "singular": "Website",
      "plural": "Websites",
      "field_type": "url",
      "data_type": "string",
      "cardinality": 3,
      "default": "",
      "required": false,
      "example": ""
    },
    "population": {
      "machine": "population",
      "singular": "Population",
      "plural": "Populations",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "altitude": {
      "machine": "altitude",
      "singular": "Altitude",
      "plural": "Altitudes",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "county": {
      "machine": "county",
      "singular": "County",
      "plural": "Countys",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "state_id": {
      "machine": "state_id",
      "singular": "State",
      "plural": "States",
      "relationship": "States",
      "field_type": "vocabulary_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "officials": {
      "machine": "officials",
      "singular": "Official",
      "plural": "Officialss",
      "relationship": "Users",
      "field_type": "user_profile",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "default": "",
      "required": false,
      "example": ""
    },
    "land_area": {
      "machine": "land_area",
      "singular": "Land Area",
      "plural": "Land Areas",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "water_area": {
      "machine": "water_area",
      "singular": "Water Area",
      "plural": "Water Areas",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "total_area": {
      "machine": "total_area",
      "singular": "Total Area",
      "plural": "Total Areas",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "density": {
      "machine": "density",
      "singular": "Density",
      "plural": "Densitys",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "timezone": {
      "machine": "timezone",
      "singular": "Timezone",
      "plural": "Timezones",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Officials": {
    "title": {
      "machine": "title",
      "singular": "Job Title",
      "plural": "Job Titles",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "office_phone": {
      "machine": "office_phone",
      "singular": "Office Phone",
      "plural": "Office Phones",
      "field_type": "phone",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "office_email": {
      "machine": "office_email",
      "singular": "Office Email",
      "plural": "Office Emails",
      "field_type": "email",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "social_links": {
      "machine": "social_links",
      "singular": "Social Media link",
      "plural": "Social Media linkss",
      "field_type": "url",
      "data_type": "string",
      "cardinality": Infinity,
      "default": "",
      "required": false,
      "example": ""
    },
    "party_affiliation": {
      "machine": "party_affiliation",
      "singular": "Party",
      "plural": "Partys",
      "relationship": "Parties",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "city": {
      "machine": "city",
      "singular": "City",
      "plural": "Citys",
      "relationship": "Cities",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "default": "",
      "required": true,
      "example": ""
    }
  },
  "Rallies": {
    "title": {
      "machine": "title",
      "singular": "Title",
      "plural": "Titles",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "description": {
      "machine": "description",
      "singular": "Description",
      "plural": "Descriptions",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "media": {
      "machine": "media",
      "singular": "Media",
      "plural": "Medias",
      "field_type": "media",
      "data_type": "string",
      "cardinality": Infinity,
      "default": "",
      "required": false,
      "example": ""
    },
    "topics": {
      "machine": "topics",
      "singular": "Topic",
      "plural": "Topicss",
      "relationship": "Topics",
      "field_type": "vocabulary_reference",
      "data_type": "RelEntity",
      "cardinality": 3,
      "default": "",
      "required": true,
      "example": ""
    },
    "comments": {
      "machine": "comments",
      "singular": "Comment",
      "plural": "Commentss",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": Infinity,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "ActionPlans": {
    "title": {
      "machine": "title",
      "singular": "Title",
      "plural": "Titles",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "recommendation": {
      "machine": "recommendation",
      "singular": "Recommendation",
      "plural": "Recommendations",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "exe_summary": {
      "machine": "exe_summary",
      "singular": "Executive Summary",
      "plural": "Executive Summarys",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "analysis": {
      "machine": "analysis",
      "singular": "Analysis and Policy Alternatives / Proposal",
      "plural": "Analysis and Policy Alternatives / Proposals",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "background": {
      "machine": "background",
      "singular": "Background / Legislative History / Problem Statement",
      "plural": "Background / Legislative History / Problem Statements",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "coauthors": {
      "machine": "coauthors",
      "singular": "CoAuthor",
      "plural": "CoAuthorss",
      "relationship": "Users",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "default": "",
      "required": false,
      "example": ""
    },
    "pro_argument": {
      "machine": "pro_argument",
      "singular": "Pro Argument",
      "plural": "Pro Arguments",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "con_argument": {
      "machine": "con_argument",
      "singular": "Con Argument",
      "plural": "Con Arguments",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "prerequisites": {
      "machine": "prerequisites",
      "singular": "Prerequisite",
      "plural": "Prerequisiteses",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "timeline": {
      "machine": "timeline",
      "singular": "Timeline",
      "plural": "Timelines",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "rally": {
      "machine": "rally",
      "singular": "Rally",
      "plural": "Rallys",
      "relationship": "Rallies",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Meetings": {
    "title": {
      "machine": "title",
      "singular": "Title",
      "plural": "Titles",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "rally": {
      "machine": "rally",
      "singular": "Rally",
      "plural": "Rallys",
      "relationship": "Rallies",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "meeting_type": {
      "machine": "meeting_type",
      "singular": "Meeting Type",
      "plural": "Meeting Types",
      "relationship": "MeetingTypes",
      "field_type": "vocabulary_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "speakers": {
      "machine": "speakers",
      "singular": "Speaker",
      "plural": "Speakerss",
      "relationship": "Users",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 7,
      "default": "",
      "required": true,
      "example": ""
    },
    "moderators": {
      "machine": "moderators",
      "singular": "Moderator",
      "plural": "Moderatorss",
      "relationship": "Users",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 2,
      "default": "",
      "required": true,
      "example": ""
    },
    "sponsors": {
      "machine": "sponsors",
      "singular": "Sponsor",
      "plural": "Sponsorss",
      "relationship": "Users",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "default": "",
      "required": false,
      "example": ""
    },
    "address": {
      "machine": "address",
      "singular": "Postal Addres",
      "plural": "Postal Addresses",
      "field_type": "address",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "start": {
      "machine": "start",
      "singular": "Start",
      "plural": "Starts",
      "field_type": "date_time",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "end": {
      "machine": "end",
      "singular": "End",
      "plural": "Ends",
      "field_type": "date_time",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "agenda_json": {
      "machine": "agenda_json",
      "singular": "Agenda JSON",
      "plural": "Agenda JSONS",
      "field_type": "json",
      "data_type": "object",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "duration": {
      "machine": "duration",
      "singular": "Duration",
      "plural": "Durations",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "privacy": {
      "machine": "privacy",
      "singular": "Privacy",
      "plural": "Privacys",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Invites": {
    "meeting": {
      "machine": "meeting",
      "singular": "Meeting",
      "plural": "Meetings",
      "relationship": "Meetings",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "user": {
      "machine": "user",
      "singular": "User",
      "plural": "Users",
      "relationship": "Users",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "invited_by": {
      "machine": "invited_by",
      "singular": "Invited By",
      "plural": "Invited Bys",
      "relationship": "Users",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "status": {
      "machine": "status",
      "singular": "Status",
      "plural": "Statuses",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": "invited, rsvpd, attending, attended",
      "options": [
        {
          "label": "Invited",
          "id": "invited"
        },
        {
          "label": " rsvpd",
          "id": "rsvpd"
        },
        {
          "label": " attending",
          "id": "attending"
        },
        {
          "label": " attended",
          "id": "attended"
        }
      ]
    }
  },
  "Subscriptions": {
    "subscriber": {
      "machine": "subscriber",
      "singular": "Subscriber",
      "plural": "Subscribers",
      "relationship": "Users",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "rally": {
      "machine": "rally",
      "singular": "Rally",
      "plural": "Rallys",
      "relationship": "Rallies",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "meeting": {
      "machine": "meeting",
      "singular": "Meeting",
      "plural": "Meetings",
      "relationship": "Meetings",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "status": {
      "machine": "status",
      "singular": "Status",
      "plural": "Statuses",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": "\"approved\", \"denied\", \"active\", \"seen\"",
      "options": [
        {
          "label": "Approved",
          "id": "approved"
        },
        {
          "label": " denied",
          "id": "denied"
        },
        {
          "label": " active",
          "id": "active"
        },
        {
          "label": " seen",
          "id": "seen"
        }
      ]
    }
  },
  "Rooms": {
    "author": {
      "machine": "author",
      "singular": "Owner",
      "plural": "Owners",
      "relationship": "Users",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "start": {
      "machine": "start",
      "singular": "Start",
      "plural": "Starts",
      "field_type": "date_time",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "end": {
      "machine": "end",
      "singular": "End",
      "plural": "Ends",
      "field_type": "date_time",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "rally": {
      "machine": "rally",
      "singular": "Rally",
      "plural": "Rallys",
      "relationship": "Rallies",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "meeting": {
      "machine": "meeting",
      "singular": "Meeting",
      "plural": "Meetings",
      "relationship": "Meetings",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "privacy": {
      "machine": "privacy",
      "singular": "Privacy",
      "plural": "Privacys",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": "public, invite-only, requests",
      "options": [
        {
          "label": "Public",
          "id": "public"
        },
        {
          "label": " invite-only",
          "id": "inviteonly"
        },
        {
          "label": " requests",
          "id": "requests"
        }
      ]
    },
    "status": {
      "machine": "status",
      "singular": "Status",
      "plural": "Statuses",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": "live, scheduled, ended",
      "options": [
        {
          "label": "Live",
          "id": "live"
        },
        {
          "label": " scheduled",
          "id": "scheduled"
        },
        {
          "label": " ended",
          "id": "ended"
        }
      ]
    },
    "chat_thread": {
      "machine": "chat_thread",
      "singular": "Chat Thread",
      "plural": "Chat Threads",
      "field_type": "text",
      "data_type": "string",
      "cardinality": Infinity,
      "default": "",
      "required": false,
      "example": ""
    },
    "recording": {
      "machine": "recording",
      "singular": "Recording",
      "plural": "Recordings",
      "field_type": "video",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Attendees": {
    "room_id": {
      "machine": "room_id",
      "singular": "Room ID",
      "plural": "Room IDS",
      "relationship": "Rooms",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "display_name": {
      "machine": "display_name",
      "singular": "Display Name",
      "plural": "Display Names",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "display_bg": {
      "machine": "display_bg",
      "singular": "Display Bg",
      "plural": "Display Bgs",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "role": {
      "machine": "role",
      "singular": "Role",
      "plural": "Roles",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": "viewer, presenter, admin, chat moderator",
      "options": [
        {
          "label": "Viewer",
          "id": "viewer"
        },
        {
          "label": " presenter",
          "id": "presenter"
        },
        {
          "label": " admin",
          "id": "admin"
        },
        {
          "label": " chat moderator",
          "id": "chat_moderator"
        }
      ]
    },
    "stream": {
      "machine": "stream",
      "singular": "Stream",
      "plural": "Streams",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "is_muted": {
      "machine": "is_muted",
      "singular": "Is Muted",
      "plural": "Is Muteds",
      "field_type": "boolean",
      "data_type": "boolean",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "sharing_video": {
      "machine": "sharing_video",
      "singular": "Sharing Video",
      "plural": "Sharing Videos",
      "field_type": "boolean",
      "data_type": "boolean",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "sharing_audio": {
      "machine": "sharing_audio",
      "singular": "Sharing Audio",
      "plural": "Sharing Audios",
      "field_type": "boolean",
      "data_type": "boolean",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "sharing_screen": {
      "machine": "sharing_screen",
      "singular": "Sharing Screen",
      "plural": "Sharing Screens",
      "field_type": "boolean",
      "data_type": "boolean",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "hand_raised": {
      "machine": "hand_raised",
      "singular": "Hand Raised",
      "plural": "Hand Raiseds",
      "field_type": "boolean",
      "data_type": "boolean",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "is_typing": {
      "machine": "is_typing",
      "singular": "Is Typing",
      "plural": "Is Typings",
      "field_type": "boolean",
      "data_type": "boolean",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  }
};
//---OBJECT-ACTIONS-TYPE-CONSTANTS-ENDS---//

//---OBJECT-ACTIONS-TYPE-SCHEMA-STARTS---//
export interface SuperModel {
  readonly id: number | string;
  author: RelEntity<"Users">;
  created_at: string;
  modified_at: string;
  _type: ModelName;
}

export interface Topics extends SuperModel {
  name?: string | null;
  icon?: string | null;
  photo?: string | null;
}

export interface ResourceTypes extends SuperModel {
  name?: string | null;
}

export interface MeetingTypes extends SuperModel {
  name?: string | null;
}

export interface States extends SuperModel {
  name?: string | null;
  website?: string | null;
  icon?: string | null;
}

export interface Parties extends SuperModel {
  name?: string | null;
  logo?: string | null;
  website?: string | null;
}

export interface Stakeholders extends SuperModel {
  name?: string | null;
  image?: string | null;
}

export interface Resources extends SuperModel {
  title: string;
  description_html: string;
  image: string;
  postal_address?: string | null;
  price_ccoin: number;
  resource_type: RelEntity<"ResourceTypes">[];
}

export interface Users {
  readonly id: number | string;
  _type: string;
  is_active?: boolean;
  is_staff?: boolean;
  last_login?: string;
  date_joined?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  groups?: string[];
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  bio?: string | null;
  picture?: string | null;
  cover_photo?: string | null;
  resources?: RelEntity<"Resources">[] | null;
}

export interface Cities extends SuperModel {
  name: string;
  description?: string | null;
  postal_address?: string | null;
  picture?: string | null;
  cover_photo?: string | null;
  sponsors?: RelEntity<"Users">[] | null;
  website?: string[] | null;
  population?: number | null;
  altitude?: number | null;
  county?: string | null;
  state_id?: RelEntity<"States"> | null;
  officials?: RelEntity<"Users">[] | null;
  land_area?: number | null;
  water_area?: number | null;
  total_area?: number | null;
  density?: number | null;
  timezone?: string | null;
}

export interface Officials extends SuperModel {
  title: string;
  office_phone?: string | null;
  office_email?: string | null;
  social_links?: string[] | null;
  party_affiliation?: RelEntity<"Parties"> | null;
  city: RelEntity<"Cities">[];
}

export interface Rallies extends SuperModel {
  title: string;
  description: string;
  media?: string[] | null;
  topics: RelEntity<"Topics">[];
  comments?: string[] | null;
}

export interface ActionPlans extends SuperModel {
  title?: string | null;
  recommendation?: string | null;
  exe_summary?: string | null;
  analysis?: string | null;
  background?: string | null;
  coauthors?: RelEntity<"Users">[] | null;
  pro_argument?: string | null;
  con_argument?: string | null;
  prerequisites: string;
  timeline?: string | null;
  rally?: RelEntity<"Rallies"> | null;
}

export interface Meetings extends SuperModel {
  title?: string | null;
  rally?: RelEntity<"Rallies"> | null;
  meeting_type: RelEntity<"MeetingTypes">;
  speakers: RelEntity<"Users">[];
  moderators: RelEntity<"Users">[];
  sponsors?: RelEntity<"Users">[] | null;
  address?: string | null;
  start: string;
  end: string;
  agenda_json?: object | null;
  duration?: number | null;
  privacy?: number | null;
}

export interface Invites extends SuperModel {
  meeting: RelEntity<"Meetings">;
  user: RelEntity<"Users">;
  invited_by: RelEntity<"Users">;
  status: string;
}

export interface Subscriptions extends SuperModel {
  subscriber: RelEntity<"Users">;
  rally: RelEntity<"Rallies">;
  meeting?: RelEntity<"Meetings"> | null;
  status: string;
}

export interface Rooms extends SuperModel {
  author: RelEntity<"Users">;
  start: string;
  end: string;
  rally?: RelEntity<"Rallies"> | null;
  meeting?: RelEntity<"Meetings"> | null;
  privacy?: string | null;
  status?: string | null;
  chat_thread?: string[] | null;
  recording?: string | null;
}

export interface Attendees extends SuperModel {
  room_id: RelEntity<"Rooms">;
  display_name?: string | null;
  display_bg?: string | null;
  role: string;
  stream?: string | null;
  is_muted?: boolean | null;
  sharing_video?: boolean | null;
  sharing_audio?: boolean | null;
  sharing_screen?: boolean | null;
  hand_raised?: boolean | null;
  is_typing?: boolean | null;
}

//---OBJECT-ACTIONS-TYPE-SCHEMA-ENDS---//


//---OBJECT-ACTIONS-NAV-ITEMS-STARTS---//
export interface NavItem<T extends ModelName = ModelName> {
  singular: string;
  plural: string;
  segment: string;
  api: string;
  icon?: string; // WARN: this should be a React.ReactNode of the icon so the entire icon library is not embedded.
  type: T;
  model_type?: "vocabulary" | string;
  search_fields: string[];
}

export const NAVITEMS: { [K in ModelName]: NavItem<K> }[ModelName][] = [
  {
    "singular": "Topic",
    "plural": "Topics",
    "type": "Topics",
    "segment": "topics",
    "api": "/api/topics",
    "search_fields": ["name"],
    "model_type": "vocabulary",
    "icon": "Category"
  },
  {
    "singular": "Resource Type",
    "plural": "Resource Types",
    "type": "ResourceTypes",
    "segment": "resource-types",
    "api": "/api/resource-types",
    "search_fields": ["name"],
    "model_type": "vocabulary",
    "icon": "Inventory"
  },
  {
    "singular": "Meeting Type",
    "plural": "Meeting Types",
    "type": "MeetingTypes",
    "segment": "meeting-types",
    "api": "/api/meeting-types",
    "search_fields": ["name"],
    "model_type": "vocabulary",
    "icon": "Event"
  },
  {
    "singular": "State",
    "plural": "States",
    "type": "States",
    "segment": "states",
    "api": "/api/states",
    "search_fields": ["name"],
    "model_type": "vocabulary",
    "icon": "Flag"
  },
  {
    "singular": "Party",
    "plural": "Parties",
    "type": "Parties",
    "segment": "parties",
    "api": "/api/parties",
    "search_fields": ["name"],
    "model_type": "vocabulary",
    "icon": "Groups"
  },
  {
    "singular": "Stakeholder",
    "plural": "Stakeholders",
    "type": "Stakeholders",
    "segment": "stakeholders",
    "api": "/api/stakeholders",
    "search_fields": ["name"],
    "model_type": "vocabulary",
    "icon": "Business"
  },
  {
    "singular": "Resource",
    "plural": "Resources",
    "type": "Resources",
    "segment": "resources",
    "api": "/api/resources",
    "search_fields": ["title"],
    "icon": "SupportAgent"
  },
  {
    "singular": "User",
    "plural": "Users",
    "type": "Users",
    "segment": "users",
    "api": "/api/users",
    "search_fields": ["first_name", "last_name"],
    "icon": "Person"
  },
  {
    "singular": "City",
    "plural": "Cities",
    "type": "Cities",
    "segment": "cities",
    "api": "/api/cities",
    "search_fields": ["name"],
    "icon": "LocationCity"
  },
  {
    "singular": "Official",
    "plural": "Officials",
    "type": "Officials",
    "segment": "officials",
    "api": "/api/officials",
    "search_fields": ["title"],
    "icon": "Gavel"
  },
  {
    "singular": "Rally",
    "plural": "Rallies",
    "type": "Rallies",
    "segment": "rallies",
    "api": "/api/rallies",
    "search_fields": ["title"],
    "icon": "Campaign"
  },
  {
    "singular": "Action Plan",
    "plural": "Action Plans",
    "type": "ActionPlans",
    "segment": "action-plans",
    "api": "/api/action-plans",
    "search_fields": ["title"],
    "icon": "Checklist"
  },
  {
    "singular": "Meeting",
    "plural": "Meetings",
    "type": "Meetings",
    "segment": "meetings",
    "api": "/api/meetings",
    "search_fields": ["title"],
    "icon": "VideoCall"
  },
  {
    "singular": "Invite",
    "plural": "Invites",
    "type": "Invites",
    "segment": "invites",
    "api": "/api/invites",
    "search_fields": ["meeting__title"],
    "icon": "MailOutline"
  },
  {
    "singular": "Subscription",
    "plural": "Subscriptions",
    "type": "Subscriptions",
    "segment": "subscriptions",
    "api": "/api/subscriptions",
    "search_fields": ["rally__title", "meeting__title"],
    "icon": "Subscriptions"
  },
  {
    "singular": "Room",
    "plural": "Rooms",
    "type": "Rooms",
    "segment": "rooms",
    "api": "/api/rooms",
    "search_fields": ["rally__title", "meeting__title"],
    "icon": "MeetingRoom"
  },
  {
    "singular": "Attendee",
    "plural": "Attendees",
    "type": "Attendees",
    "segment": "attendees",
    "api": "/api/attendees",
    "search_fields": [],
    "icon": "People"
  }
];

//---OBJECT-ACTIONS-NAV-ITEMS-ENDS---//
