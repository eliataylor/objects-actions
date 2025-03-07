//---OBJECT-ACTIONS-API-RESP-STARTS---//
export type ModelName = "Users" | "PostType" | "Denomination" | "Churches" | "Post" | "Events" | "Services" | "RequestedResources" | "Annoucements" | "Messages" | "Groups";

export type ModelType<T extends ModelName> = T extends 'Users' ? Users : 
T extends 'PostType' ? PostType :
T extends 'Denomination' ? Denomination :
T extends 'Churches' ? Churches :
T extends 'Post' ? Post :
T extends 'Events' ? Events :
T extends 'Services' ? Services :
T extends 'RequestedResources' ? RequestedResources :
T extends 'Annoucements' ? Annoucements :
T extends 'Messages' ? Messages :
T extends 'Groups' ? Groups : never

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
    results: Array<ModelType<T>>
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

    if (field.data_type === 'RelEntity') {
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
    data_type: 'string' | 'number' | 'boolean' | 'object' | 'RelEntity';
    field_type: string;
    cardinality: number | typeof Infinity;
    relationship?: ModelName;
    required: boolean;
    default: string;
    example: string;
    options?: Array<{ label: string; id: string; }>;
}

export const TypeFieldSchema: ITypeFieldSchema = {
  "PostType": {
    "name": {
      "machine": "name",
      "singular": "Name",
      "plural": "Names",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": "Events, Services, Annoucements"
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
  "Denomination": {
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
  "Users": {
    "real_name": {
      "machine": "real_name",
      "singular": "Real Name",
      "plural": "Real Names",
      "field_type": "text",
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
    "churches": {
      "machine": "churches",
      "singular": "Church",
      "plural": "Churcheses",
      "relationship": "Churches",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "denominations": {
      "machine": "denominations",
      "singular": "Denomination",
      "plural": "Denominationss",
      "relationship": "Denomination",
      "field_type": "vocabulary_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    }
  },
  "Churches": {
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
    "pastors": {
      "machine": "pastors",
      "singular": "Pastor",
      "plural": "Pastorss",
      "relationship": "Users",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "address": {
      "machine": "address",
      "singular": "Addres",
      "plural": "Addresses",
      "field_type": "address",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Post": {
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
      "required": false,
      "example": ""
    },
    "post_type": {
      "machine": "post_type",
      "singular": "Post Type",
      "plural": "Post Types",
      "relationship": "PostType",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "Annoucements",
      "required": false,
      "example": ""
    },
    "published": {
      "machine": "published",
      "singular": "Published",
      "plural": "Publisheds",
      "field_type": "date_time",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "html_content": {
      "machine": "html_content",
      "singular": "HTML Content",
      "plural": "HTML Contents",
      "field_type": "textarea",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "start_time": {
      "machine": "start_time",
      "singular": "Start Time",
      "plural": "Start Times",
      "field_type": "date_time",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "end_time": {
      "machine": "end_time",
      "singular": "End Time",
      "plural": "End Times",
      "field_type": "date_time",
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
    },
    "video": {
      "machine": "video",
      "singular": "Video",
      "plural": "Videos",
      "field_type": "video",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "promo_link": {
      "machine": "promo_link",
      "singular": "Promo Link",
      "plural": "Promo Links",
      "field_type": "url",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "severity": {
      "machine": "severity",
      "singular": "Severity",
      "plural": "Severitys",
      "field_type": "percent",
      "data_type": "number",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Events": {
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
    "video_link": {
      "machine": "video_link",
      "singular": "Video Link",
      "plural": "Video Links",
      "field_type": "url",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "address": {
      "machine": "address",
      "singular": "Addres",
      "plural": "Addresses",
      "field_type": "address",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "start_time": {
      "machine": "start_time",
      "singular": "Start Time",
      "plural": "Start Times",
      "field_type": "date_time",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "end_time": {
      "machine": "end_time",
      "singular": "End Time",
      "plural": "End Times",
      "field_type": "date_time",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "coordinates": {
      "machine": "coordinates",
      "singular": "Coordinate",
      "plural": "Coordinateses",
      "field_type": "coordinates",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Services": {
    "promo_link": {
      "machine": "promo_link",
      "singular": "Promo Link",
      "plural": "Promo Links",
      "field_type": "url",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    }
  },
  "RequestedResources": {
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
      "required": false,
      "example": ""
    },
    "severity": {
      "machine": "severity",
      "singular": "Severity",
      "plural": "Severitys",
      "field_type": "percent",
      "data_type": "number",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Annoucements": {
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
      "required": false,
      "example": ""
    }
  },
  "Messages": {
    "sender": {
      "machine": "sender",
      "singular": "Sender",
      "plural": "Senders",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "recipeint": {
      "machine": "recipeint",
      "singular": "Recipeint",
      "plural": "Recipeints",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "text": {
      "machine": "text",
      "singular": "Text",
      "plural": "Texts",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    }
  },
  "Groups": {
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
      "required": false,
      "example": ""
    },
    "author": {
      "machine": "author",
      "singular": "Author",
      "plural": "Authors",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    }
  }
}
//---OBJECT-ACTIONS-TYPE-CONSTANTS-ENDS---//

//---OBJECT-ACTIONS-TYPE-SCHEMA-STARTS---//
export interface SuperModel {
    readonly id: number | string; 
    author: RelEntity<'Users'>;
    created_at: string;
    modified_at: string;
    _type: ModelName;
}

export interface PostType extends SuperModel {
	name: string;
	icon?: string | null;
}
export interface Denomination extends SuperModel {
	name: string;
	icon?: string | null;
}
export interface Users {
	readonly id: number | string
	_type: string
	is_active?: boolean
	is_staff?: boolean
	last_login?: string
	date_joined?: string
	email?: string
	username?: string
	first_name?: string
	last_name?: string
	groups?: string[]
	real_name?: string | null;
	bio?: string | null;
	picture?: string | null;
	cover_photo?: string | null;
	churches: RelEntity<"Churches">;
	denominations: RelEntity<"Denomination">;
}
export interface Churches extends SuperModel {
	name?: string | null;
	pastors?: RelEntity<"Users"> | null;
	address?: string | null;
}
export interface Post extends SuperModel {
	title: string;
	description?: string | null;
	post_type?: RelEntity<"PostType"> | null;
	published?: string | null;
	html_content: string;
	start_time?: string | null;
	end_time?: string | null;
	image?: string | null;
	video?: string | null;
	promo_link?: string | null;
	severity?: number | null;
}
export interface Events extends SuperModel {
	title: string;
	video_link?: string | null;
	address?: string | null;
	start_time: string;
	end_time: string;
	coordinates?: string | null;
}
export interface Services extends SuperModel {
	promo_link: string;
}
export interface RequestedResources extends SuperModel {
	title: string;
	description?: string | null;
	severity?: number | null;
}
export interface Annoucements extends SuperModel {
	title: string;
	description?: string | null;
}
export interface Messages extends SuperModel {
	sender: RelEntity<"Users">;
	recipeint: RelEntity<"Users">;
	text: string;
}
export interface Groups extends SuperModel {
	title: string;
	description?: string | null;
	author: RelEntity<"Users">;
}
//---OBJECT-ACTIONS-TYPE-SCHEMA-ENDS---//


//---OBJECT-ACTIONS-NAV-ITEMS-STARTS---//
export interface NavItem<T extends ModelName = ModelName> {
  singular: string;
  plural: string;
  segment: string;
  api: string;
  icon?: string;
  type: T;
  model_type?: 'vocabulary' | string;
  search_fields: string[];
}

export const NAVITEMS: { [K in ModelName]: NavItem<K> }[ModelName][] = [
  {
    "singular": "Post Type",
    "plural": "Post Type",
    "type": "PostType",
    "segment": "post-type",
    "api": "/api/post-type",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
  },
  {
    "singular": "Denomination",
    "plural": "Denomination",
    "type": "Denomination",
    "segment": "denomination",
    "api": "/api/denomination",
    "search_fields": [
      "name"
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
    "singular": "Church",
    "plural": "Churches",
    "type": "Churches",
    "segment": "churches",
    "api": "/api/churches",
    "search_fields": [
      "name"
    ]
  },
  {
    "singular": "Post",
    "plural": "Post",
    "type": "Post",
    "segment": "post",
    "api": "/api/post",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "Event",
    "plural": "Events",
    "type": "Events",
    "segment": "events",
    "api": "/api/events",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "Service",
    "plural": "Services",
    "type": "Services",
    "segment": "services",
    "api": "/api/services",
    "search_fields": []
  },
  {
    "singular": "Requested Resource",
    "plural": "Requested Resources",
    "type": "RequestedResources",
    "segment": "requested-resources",
    "api": "/api/requested-resources",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "Annoucement",
    "plural": "Annoucements",
    "type": "Annoucements",
    "segment": "annoucements",
    "api": "/api/annoucements",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "Message",
    "plural": "Messages",
    "type": "Messages",
    "segment": "messages",
    "api": "/api/messages",
    "search_fields": []
  },
  {
    "singular": "Group",
    "plural": "Groups",
    "type": "Groups",
    "segment": "groups",
    "api": "/api/groups",
    "search_fields": [
      "title"
    ]
  }
]
//---OBJECT-ACTIONS-NAV-ITEMS-ENDS---//