//---OBJECT-ACTIONS-API-RESP-STARTS---//
export interface RelEntity {
    id: string | number;
    str: string;
    _type: string;
    img?: string;
    entity?: EntityTypes
}

export interface NewEntity {
    id: number | string
}

export type ObjectTypes = Topics | ResourceTypes | MeetingTypes | States | Parties | Stakeholders | Resources | Cities | Officials | Rallies | ActionPlans | Meetings | Invites | Subscriptions | Rooms | Attendees;
export type EntityTypes = Users | Topics | ResourceTypes | MeetingTypes | States | Parties | Stakeholders | Resources | Cities | Officials | Rallies | ActionPlans | Meetings | Invites | Subscriptions | Rooms | Attendees;

export interface ApiListResponse<T = EntityTypes> {
    count: number;
    offset: number;
    limit: number;
    meta: any;
    error: string | null;
    results: T[]
}

export function getProp<T extends EntityTypes, K extends keyof T>(entity: T, key: K): T[K] | null {
  if (key in entity) return entity[key];
  return null;
}

export function restructureAsAllEntities(modelName: keyof typeof TypeFieldSchema, entity: any): any {
    const schema = TypeFieldSchema[modelName];
    const result: any = {id: entity.id || 0};

    Object.entries(schema).forEach(([key, field]) => {
        const value = entity[key];

        if (field.data_type === 'RelEntity') {
            if (!value) {
                // don't add at all
            } else if (Array.isArray(value)) {
                // Transform an array of RelEntities
                result[key] = value.map((item) => (item.entity ? restructureAsAllEntities(item._type, item.entity) : item));
            } else if (value.entity) {
                // Transform a single RelEntity
                result[key] = value?.entity ? restructureAsAllEntities(value._type, value.entity) : value;
            } else {
                result[key] = {"id": value.id};
            }
        } else if (value) {
            result[key] = value;
        }
    });

    return result;
}
//---OBJECT-ACTIONS-API-RESP-ENDS---//

//---OBJECT-ACTIONS-NAV-ITEMS-STARTS---//
export interface NavItem {
        singular: string;
        plural: string;
        segment: string;
        api: string;
        icon?: string;
        type: string;
        model_type?: string;
        search_fields: string[];

}
export const NAVITEMS: NavItem[] = [
  {
    "singular": "Topic",
    "plural": "Topics",
    "type": "Topics",
    "segment": "topics",
    "api": "/api/topics",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
  },
  {
    "singular": "Resource Type",
    "plural": "Resource Types",
    "type": "ResourceTypes",
    "segment": "resource-types",
    "api": "/api/resource-types",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
  },
  {
    "singular": "Meeting Type",
    "plural": "Meeting Types",
    "type": "MeetingTypes",
    "segment": "meeting-types",
    "api": "/api/meeting-types",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
  },
  {
    "singular": "State",
    "plural": "States",
    "type": "States",
    "segment": "states",
    "api": "/api/states",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
  },
  {
    "singular": "Party",
    "plural": "Parties",
    "type": "Parties",
    "segment": "parties",
    "api": "/api/parties",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
  },
  {
    "singular": "Stakeholder",
    "plural": "Stakeholders",
    "type": "Stakeholders",
    "segment": "stakeholders",
    "api": "/api/stakeholders",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
  },
  {
    "singular": "Resource",
    "plural": "Resources",
    "type": "Resources",
    "segment": "resources",
    "api": "/api/resources",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "User",
    "plural": "Users",
    "type": "Users",
    "segment": "users",
    "api": "/api/users",
    "search_fields": [
      "first_name",
      "last_name"
    ]
  },
  {
    "singular": "City",
    "plural": "Cities",
    "type": "Cities",
    "segment": "cities",
    "api": "/api/cities",
    "search_fields": [
      "name"
    ]
  },
  {
    "singular": "Official",
    "plural": "Officials",
    "type": "Officials",
    "segment": "officials",
    "api": "/api/officials",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "Rally",
    "plural": "Rallies",
    "type": "Rallies",
    "segment": "rallies",
    "api": "/api/rallies",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "Action Plan",
    "plural": "Action Plans",
    "type": "ActionPlans",
    "segment": "action-plans",
    "api": "/api/action-plans",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "Meeting",
    "plural": "Meetings",
    "type": "Meetings",
    "segment": "meetings",
    "api": "/api/meetings",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "Invite",
    "plural": "Invites",
    "type": "Invites",
    "segment": "invites",
    "api": "/api/invites",
    "search_fields": [
      "meeting__title"
    ]
  },
  {
    "singular": "Subscription",
    "plural": "Subscriptions",
    "type": "Subscriptions",
    "segment": "subscriptions",
    "api": "/api/subscriptions",
    "search_fields": [
      "rally__title",
      "meeting__title"
    ]
  },
  {
    "singular": "Room",
    "plural": "Rooms",
    "type": "Rooms",
    "segment": "rooms",
    "api": "/api/rooms",
    "search_fields": [
      "rally__title",
      "meeting__title"
    ]
  },
  {
    "singular": "Attendee",
    "plural": "Attendees",
    "type": "Attendees",
    "segment": "attendees",
    "api": "/api/attendees",
    "search_fields": []
  }
]
//---OBJECT-ACTIONS-NAV-ITEMS-ENDS---//

//---OBJECT-ACTIONS-TYPE-CONSTANTS-STARTS---//
export interface FieldTypeDefinition {
    machine: string;
    singular: string;
    plural: string;
    data_type: string;
    field_type: string;
    cardinality?: number;
    relationship?: string;
    required?: boolean;
    default?: string;
    example?: string;
    options?: { label: string; id: string; }[];
}
interface ObjectOfObjects {
    [key: string]: { [key: string]: FieldTypeDefinition };
}
export const TypeFieldSchema: ObjectOfObjects = {
  "Topics": {
    "name": {
      "machine": "name",
      "singular": "Name",
      "plural": "Names",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "resource_type": {
      "machine": "resource_type",
      "singular": "Resource Type",
      "plural": "Resource Types",
      "field_type": "vocabulary_reference",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "relationship": "ResourceTypes",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "resources": {
      "machine": "resources",
      "singular": "Resource",
      "plural": "Resourceses",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "relationship": "Resources",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "sponsors": {
      "machine": "sponsors",
      "singular": "Sponsor",
      "plural": "Sponsorss",
      "field_type": "user_profile",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "relationship": "Users",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "state_id": {
      "machine": "state_id",
      "singular": "State",
      "plural": "States",
      "field_type": "vocabulary_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "States",
      "default": "",
      "required": false,
      "example": ""
    },
    "officials": {
      "machine": "officials",
      "singular": "Official",
      "plural": "Officialss",
      "field_type": "user_profile",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "relationship": "Users",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "party_affiliation": {
      "machine": "party_affiliation",
      "singular": "Party",
      "plural": "Partys",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Parties",
      "default": "",
      "required": false,
      "example": ""
    },
    "city": {
      "machine": "city",
      "singular": "City",
      "plural": "Citys",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "relationship": "Cities",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "topics": {
      "machine": "topics",
      "singular": "Topic",
      "plural": "Topicss",
      "field_type": "vocabulary_reference",
      "data_type": "RelEntity",
      "cardinality": 3,
      "relationship": "Topics",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "coauthors": {
      "machine": "coauthors",
      "singular": "CoAuthor",
      "plural": "CoAuthorss",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "relationship": "Users",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "rally": {
      "machine": "rally",
      "singular": "Rally",
      "plural": "Rallys",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Rallies",
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
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "rally": {
      "machine": "rally",
      "singular": "Rally",
      "plural": "Rallys",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Rallies",
      "default": "",
      "required": false,
      "example": ""
    },
    "meeting_type": {
      "machine": "meeting_type",
      "singular": "Meeting Type",
      "plural": "Meeting Types",
      "field_type": "vocabulary_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "MeetingTypes",
      "default": "",
      "required": true,
      "example": ""
    },
    "speakers": {
      "machine": "speakers",
      "singular": "Speaker",
      "plural": "Speakerss",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 7,
      "relationship": "Users",
      "default": "",
      "required": true,
      "example": ""
    },
    "moderators": {
      "machine": "moderators",
      "singular": "Moderator",
      "plural": "Moderatorss",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 2,
      "relationship": "Users",
      "default": "",
      "required": true,
      "example": ""
    },
    "sponsors": {
      "machine": "sponsors",
      "singular": "Sponsor",
      "plural": "Sponsorss",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "relationship": "Users",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Meetings",
      "default": "",
      "required": true,
      "example": ""
    },
    "user": {
      "machine": "user",
      "singular": "User",
      "plural": "Users",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Users",
      "default": "",
      "required": true,
      "example": ""
    },
    "invited_by": {
      "machine": "invited_by",
      "singular": "Invited By",
      "plural": "Invited Bys",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Users",
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
      "relationship": "",
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
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Users",
      "default": "",
      "required": true,
      "example": ""
    },
    "rally": {
      "machine": "rally",
      "singular": "Rally",
      "plural": "Rallys",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Rallies",
      "default": "",
      "required": true,
      "example": ""
    },
    "meeting": {
      "machine": "meeting",
      "singular": "Meeting",
      "plural": "Meetings",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Meetings",
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
      "relationship": "",
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
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Users",
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
      "relationship": "",
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
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "rally": {
      "machine": "rally",
      "singular": "Rally",
      "plural": "Rallys",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Rallies",
      "default": "",
      "required": false,
      "example": ""
    },
    "meeting": {
      "machine": "meeting",
      "singular": "Meeting",
      "plural": "Meetings",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Meetings",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Rooms",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
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
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    }
  }
}
//---OBJECT-ACTIONS-TYPE-CONSTANTS-ENDS---//

//---OBJECT-ACTIONS-TYPE-SCHEMA-STARTS---//
export interface SuperModel {
    readonly id: number | string; 
    author: RelEntity;
    created_at: string;
    modified_at: string;
    _type: string;
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
	resource_type: RelEntity[];
}
export interface Users {
	readonly id: number | string
	_type: string
	is_active?: boolean
	is_staff?: boolean
	last_login?: string
	date_joined?: string
	username?: string
	first_name?: string
	last_name?: string
	groups?: string[]
	email?: string | null;
	phone?: string | null;
	website?: string | null;
	bio?: string | null;
	picture?: string | null;
	cover_photo?: string | null;
	resources?: RelEntity[] | null;
}
export interface Cities extends SuperModel {
	name: string;
	description?: string | null;
	postal_address?: string | null;
	picture?: string | null;
	cover_photo?: string | null;
	sponsors?: RelEntity[] | null;
	website?: string[] | null;
	population?: number | null;
	altitude?: number | null;
	county?: string | null;
	state_id?: RelEntity | null;
	officials?: RelEntity[] | null;
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
	party_affiliation?: RelEntity | null;
	city: RelEntity[];
}
export interface Rallies extends SuperModel {
	title: string;
	description: string;
	media?: string[] | null;
	topics: RelEntity[];
	comments?: string[] | null;
}
export interface ActionPlans extends SuperModel {
	title?: string | null;
	recommendation?: string | null;
	exe_summary?: string | null;
	analysis?: string | null;
	background?: string | null;
	coauthors?: RelEntity[] | null;
	pro_argument?: string | null;
	con_argument?: string | null;
	prerequisites: string;
	timeline?: string | null;
	rally?: RelEntity | null;
}
export interface Meetings extends SuperModel {
	title?: string | null;
	rally?: RelEntity | null;
	meeting_type: RelEntity;
	speakers: RelEntity[];
	moderators: RelEntity[];
	sponsors?: RelEntity[] | null;
	address?: string | null;
	start: string;
	end: string;
	agenda_json?: object | null;
	duration?: number | null;
	privacy?: number | null;
}
export interface Invites extends SuperModel {
	meeting: RelEntity;
	user: RelEntity;
	invited_by: RelEntity;
	status: string;
}
export interface Subscriptions extends SuperModel {
	subscriber: RelEntity;
	rally: RelEntity;
	meeting?: RelEntity | null;
	status: string;
}
export interface Rooms extends SuperModel {
	author: RelEntity;
	start: string;
	end: string;
	rally?: RelEntity | null;
	meeting?: RelEntity | null;
	privacy?: string | null;
	status?: string | null;
	chat_thread?: string[] | null;
	recording?: string | null;
}
export interface Attendees extends SuperModel {
	room_id: RelEntity;
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