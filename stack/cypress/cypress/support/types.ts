//---OBJECT-ACTIONS-API-RESP-STARTS---//
export type ModelName = "Users" | "Languages" | "Courses" | "Questions" | "Responses" | "Certificates";

export type ModelType<T extends ModelName> = T extends 'Users' ? Users : 
T extends 'Languages' ? Languages :
T extends 'Courses' ? Courses :
T extends 'Questions' ? Questions :
T extends 'Responses' ? Responses :
T extends 'Certificates' ? Certificates : never

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
    "singular": "Language",
    "plural": "Languages",
    "type": "Languages",
    "segment": "languages",
    "api": "/api/languages",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
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
    "singular": "Course",
    "plural": "Courses",
    "type": "Courses",
    "segment": "courses",
    "api": "/api/courses",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "Question",
    "plural": "Questions",
    "type": "Questions",
    "segment": "questions",
    "api": "/api/questions",
    "search_fields": []
  },
  {
    "singular": "Response",
    "plural": "Responses",
    "type": "Responses",
    "segment": "responses",
    "api": "/api/responses",
    "search_fields": []
  },
  {
    "singular": "Certificate",
    "plural": "Certificates",
    "type": "Certificates",
    "segment": "certificates",
    "api": "/api/certificates",
    "search_fields": [
      "title"
    ]
  }
]
//---OBJECT-ACTIONS-NAV-ITEMS-ENDS---//

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
  "Languages": {
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
    },
    "countries": {
      "machine": "countries",
      "singular": "Country",
      "plural": "Countrieses",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": "Jamaica, South Africa, Tanzania, Belize, Guatemala, Honduras, Nicaragua, Mexico, Spain",
      "options": [
        {
          "label": "Jamaica",
          "id": "jamaica"
        },
        {
          "label": " South Africa",
          "id": "south_africa"
        },
        {
          "label": " Tanzania",
          "id": "tanzania"
        },
        {
          "label": " Belize",
          "id": "belize"
        },
        {
          "label": " Guatemala",
          "id": "guatemala"
        },
        {
          "label": " Honduras",
          "id": "honduras"
        },
        {
          "label": " Nicaragua",
          "id": "nicaragua"
        },
        {
          "label": " Mexico",
          "id": "mexico"
        },
        {
          "label": " Spain",
          "id": "spain"
        }
      ]
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
      "required": true,
      "example": ""
    },
    "username": {
      "machine": "username",
      "singular": "Username",
      "plural": "Usernames",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "prefered_language": {
      "machine": "prefered_language",
      "singular": "Prefered Language",
      "plural": "Prefered Languages",
      "relationship": "Languages",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": false,
      "example": ""
    },
    "certificates": {
      "machine": "certificates",
      "singular": "Certificate",
      "plural": "Certificateses",
      "relationship": "Certificates",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Courses": {
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
    "language": {
      "machine": "language",
      "singular": "Language",
      "plural": "Languages",
      "relationship": "Languages",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    }
  },
  "Questions": {
    "course": {
      "machine": "course",
      "singular": "Course",
      "plural": "Courses",
      "relationship": "Courses",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "question_type": {
      "machine": "question_type",
      "singular": "Question Type",
      "plural": "Question Types",
      "relationship": "Languages",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "default": "choose correct option",
      "required": true,
      "example": "audio, fill in the blank, choose correct option",
      "options": [
        {
          "label": "Audio",
          "id": "audio"
        },
        {
          "label": " fill in the blank",
          "id": "fill_in_the_blank"
        },
        {
          "label": " choose correct option",
          "id": "choose_correct_option"
        }
      ]
    },
    "prompt": {
      "machine": "prompt",
      "singular": "Prompt",
      "plural": "Prompts",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "hint": {
      "machine": "hint",
      "singular": "Hint",
      "plural": "Hints",
      "field_type": "text",
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
    "audio": {
      "machine": "audio",
      "singular": "Audio",
      "plural": "Audios",
      "field_type": "audio",
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
    "answer_options": {
      "machine": "answer_options",
      "singular": "Answer Option",
      "plural": "Answer Optionss",
      "field_type": "json",
      "data_type": "object",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "correct_answer": {
      "machine": "correct_answer",
      "singular": "Correct Answer",
      "plural": "Correct Answers",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    }
  },
  "Responses": {
    "question": {
      "machine": "question",
      "singular": "Question",
      "plural": "Questions",
      "relationship": "Questions",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "time_to_respond": {
      "machine": "time_to_respond",
      "singular": "Time to respond",
      "plural": "Times to respond",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "answer": {
      "machine": "answer",
      "singular": "Answer",
      "plural": "Answers",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
    "correct": {
      "machine": "correct",
      "singular": "Correct",
      "plural": "Corrects",
      "field_type": "boolean",
      "data_type": "boolean",
      "cardinality": 1,
      "default": "FALSE",
      "required": true,
      "example": ""
    },
    "score": {
      "machine": "score",
      "singular": "Score",
      "plural": "Scores",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "default": "0",
      "required": true,
      "example": ""
    }
  },
  "Certificates": {
    "language": {
      "machine": "language",
      "singular": "Language",
      "plural": "Languages",
      "relationship": "Languages",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "default": "",
      "required": true,
      "example": ""
    },
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

export interface Languages extends SuperModel {
	name: string;
	icon?: string | null;
	countries?: string | null;
}
export interface Users {
	readonly id: number | string
	_type: string
	is_active?: boolean
	is_staff?: boolean
	last_login?: string
	date_joined?: string
	first_name?: string
	last_name?: string
	groups?: string[]
	email: string;
	username: string;
	prefered_language?: RelEntity<"Languages"> | null;
	certificates?: RelEntity<"Certificates">[] | null;
}
export interface Courses extends SuperModel {
	title: string;
	language: RelEntity<"Languages">;
}
export interface Questions extends SuperModel {
	course: RelEntity<"Courses">;
	question_type: string;
	prompt: string;
	hint?: string | null;
	video?: string | null;
	audio?: string | null;
	picture?: string | null;
	answer_options: object;
	correct_answer: string;
}
export interface Responses extends SuperModel {
	question: RelEntity<"Questions">;
	time_to_respond: number;
	answer: string;
	correct: boolean;
	score: number;
}
export interface Certificates extends SuperModel {
	language: RelEntity<"Languages">;
	title: string;
	description?: string | null;
	icon?: string | null;
}
//---OBJECT-ACTIONS-TYPE-SCHEMA-ENDS---//