type CRUDVerb = 'add' | 'edit' | 'delete';
type FormObjectId = `${string}/${number}`;
type NestedObjectIds<T extends string> =
  T extends `${FormObjectId}/${infer Rest}` ?
  `${FormObjectId}/${NestedObjectIds<Rest>}` :
  T;

// Type for the full URL pattern with optional nested pairs
export type FormURL<T extends string> = `/forms/${NestedObjectIds<T>}/${CRUDVerb}`;

// type ExampleUpdateURL = FormURL<'user/123/profile/456/settings/789', 'update'>;  // "/forms/user/123/profile/456/settings/789/update"
// type ExampleCreateURL = FormURL<'product/0', 'create'>;  // "/forms/product/1/create"

interface ParsedURL {
    object: string;
    id: number;
    verb: CRUDVerb;
}

export function parseFormURL(url: string): ParsedURL | null {
    // Regular expression to capture object/id pairs and the verb
    const pattern = /^\/forms(\/[a-zA-Z0-9_-]+\/\d+)+(\/(add|edit|delete))$/;
    const match = url.match(pattern);

    if (!match) {
        return null; // URL does not match the expected pattern
    }

    // Extract the object/id pairs and verb from the URL
    const segments = url.split('/');
    const verb = segments.pop() as CRUDVerb; // The last segment is the verb
    segments.shift(); // Remove the empty initial segment (before 'forms')
    segments.shift(); // Remove the 'forms' segment

    // Extract the last object/id pair
    const id = parseInt(segments.pop() as string, 10); // The second last segment is the ID
    const object = segments.pop() as string; // The third last segment is the object

    return { object, id, verb };
}


//---OBJECT-ACTIONS-TYPE-SCHEMA-STARTS---//
export interface Users {
	_type: string
	is_active?: boolean
	is_staff?: boolean
	last_login?: string
	date_joined?: string
	username?: string
	first_name?: string
	last_name?: string
	readonly id: number;
	phone?: string | null;
	email?: string | null;
	profile_picture?: string | null;
	birthday?: string | null;
	gender?: string | null;
	last_known_location?: string | null;
	link_ig?: string | null;
	link_spotify?: string | null;
	link_apple?: string | null;
}
export interface Songs {
	_type: string
	created_at: number
	modified_at: number
	author?: number
	readonly id: number;
	spotify_id?: string | null;
	apple_id?: string | null;
	name: string;
	artist?: string | null;
	cover?: string | null;
}
export interface Playlists {
	_type: string
	created_at: number
	modified_at: number
	readonly id: number;
	social_source?: string | null;
	author: RelEntity;
	name: string;
	image?: string | null;
	event: RelEntity;
	playing_now?: boolean | null;
}
export interface Events {
	_type: string
	created_at: number
	modified_at: number
	readonly id: number;
	author: RelEntity;
	cohosts?: RelEntity | null;
	url_alias?: string | null;
	name: string;
	starts: string;
	ends: string;
	cover?: string[] | null;
	description: string;
	address: string;
	coordinates?: string | null;
}
export interface Friendships {
	readonly id: number
	_type: string
	created_at: number
	modified_at: number
	author: RelEntity;
	recipient: RelEntity;
	status: string;
}
export interface Invites {
	readonly id: number
	_type: string
	created_at: number
	modified_at: number
	author: RelEntity;
	recipient: RelEntity;
	event?: RelEntity | null;
	status: string;
}
export interface SongRequests {
	readonly id: number
	_type: string
	created_at: number
	modified_at: number
	author: RelEntity;
	song: RelEntity;
	event: RelEntity;
	playlist: RelEntity;
	status: string;
}
export interface EventCheckins {
	readonly id: number
	_type: string
	created_at: number
	modified_at: number
	author: RelEntity;
	event: RelEntity;
	coordinate: string;
	status: string;
}
export interface Likes {
	readonly id: number
	_type: string
	created_at: number
	modified_at: number
	author: RelEntity;
	type: string;
	song?: RelEntity | null;
	event?: RelEntity | null;
	playlist?: RelEntity | null;
}
//---OBJECT-ACTIONS-TYPE-SCHEMA-ENDS---//



//---OBJECT-ACTIONS-API-RESP-STARTS---//
export interface RelEntity {
    id: string | number;
    str: string;
    _type: string;
}

export interface NewEntity {
    id: number | string
}

export type EntityTypes = Users | Songs | Playlists | Events | Friendships | Invites | SongRequests | EventCheckins | Likes; 

export interface ApiListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: EntityTypes[]
}

export function getProp<T extends EntityTypes, K extends keyof T>(entity: EntityTypes, key: string): T[K] | null {
    // @ts-ignore
    if (key in entity) return entity[key]
	return null;
}
//---OBJECT-ACTIONS-API-RESP-ENDS---//



//---OBJECT-ACTIONS-NAV-ITEMS-STARTS---//
export interface NavItem {
        name: string;
        screen: string;
        api: string;
        icon?: string;
        type: string;
        search_fields: string[];

}
export const NAVITEMS: NavItem[] = [
  {
    "name": "Users",
    "type": "Users",
    "api": "/api/users",
    "screen": "/users",
    "search_fields": [
      "first_name",
      "last_name"
    ]
  },
  {
    "name": "Songs",
    "type": "Songs",
    "api": "/api/songs",
    "screen": "/songs",
    "search_fields": [
      "name"
    ]
  },
  {
    "name": "Playlists",
    "type": "Playlists",
    "api": "/api/playlists",
    "screen": "/playlists",
    "search_fields": [
      "name"
    ]
  },
  {
    "name": "Events",
    "type": "Events",
    "api": "/api/events",
    "screen": "/events",
    "search_fields": [
      "name"
    ]
  },
  {
    "name": "Friendships",
    "type": "Friendships",
    "api": "/api/friendships",
    "screen": "/friendships",
    "search_fields": []
  },
  {
    "name": "Invites",
    "type": "Invites",
    "api": "/api/invites",
    "screen": "/invites",
    "search_fields": [
      "event__name"
    ]
  },
  {
    "name": "Song Requests",
    "type": "SongRequests",
    "api": "/api/song_requests",
    "screen": "/song_requests",
    "search_fields": [
      "song__name",
      "event__name",
      "playlist__name"
    ]
  },
  {
    "name": "Event Checkins",
    "type": "EventCheckins",
    "api": "/api/event_checkins",
    "screen": "/event_checkins",
    "search_fields": [
      "event__name"
    ]
  },
  {
    "name": "Likes",
    "type": "Likes",
    "api": "/api/likes",
    "screen": "/likes",
    "search_fields": [
      "song__name",
      "event__name",
      "playlist__name"
    ]
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
  "Users": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "field_type": "id_auto_increment",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "phone": {
      "machine": "phone",
      "singular": "Phone",
      "plural": "Phones",
      "field_type": "phone",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
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
    "profile_picture": {
      "machine": "profile_picture",
      "singular": "Profile Picture",
      "plural": "Profile Pictures",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "birthday": {
      "machine": "birthday",
      "singular": "Birthday",
      "plural": "Birthdays",
      "field_type": "date",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "gender": {
      "machine": "gender",
      "singular": "Gender",
      "plural": "Genders",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": "[\"male\", \"female\", \"other\"]",
      "options": [
        {
          "label": "Male",
          "id": "male"
        },
        {
          "label": "Female",
          "id": "female"
        },
        {
          "label": "Other",
          "id": "other"
        }
      ]
    },
    "last_known_location": {
      "machine": "last_known_location",
      "singular": "Last Known Location",
      "plural": "Last Known Locations",
      "field_type": "coordinates",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "link_ig": {
      "machine": "link_ig",
      "singular": "Instagram",
      "plural": "Instagrams",
      "field_type": "url",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "link_spotify": {
      "machine": "link_spotify",
      "singular": "Spotify",
      "plural": "Spotifys",
      "field_type": "url",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "link_apple": {
      "machine": "link_apple",
      "singular": "Apple Music",
      "plural": "Apple Musics",
      "field_type": "url",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Songs": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "field_type": "id_auto_increment",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "spotify_id": {
      "machine": "spotify_id",
      "singular": "Spotify ID",
      "plural": "Spotify IDs",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "apple_id": {
      "machine": "apple_id",
      "singular": "Apple ID",
      "plural": "Apple IDs",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
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
    "artist": {
      "machine": "artist",
      "singular": "Artist",
      "plural": "Artists",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "cover": {
      "machine": "cover",
      "singular": "Cover",
      "plural": "Covers",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Playlists": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "field_type": "id_auto_increment",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "social_source": {
      "machine": "social_source",
      "singular": "Social Source",
      "plural": "Social Sources",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": "[\"spotify\", \"apple\"]",
      "options": [
        {
          "label": "Spotify",
          "id": "spotify"
        },
        {
          "label": "Apple",
          "id": "apple"
        }
      ]
    },
    "author": {
      "machine": "author",
      "singular": "DJ",
      "plural": "DJs",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Users",
      "default": "",
      "required": true,
      "example": ""
    },
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
    },
    "event": {
      "machine": "event",
      "singular": "Event",
      "plural": "Events",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Events",
      "default": "",
      "required": true,
      "example": ""
    },
    "playing_now": {
      "machine": "playing_now",
      "singular": "Playing Now",
      "plural": "Playing Nows",
      "field_type": "boolean",
      "data_type": "boolean",
      "cardinality": 1,
      "relationship": "",
      "default": "FALSE",
      "required": false,
      "example": ""
    }
  },
  "Events": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "field_type": "id_auto_increment",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "author": {
      "machine": "author",
      "singular": "Host",
      "plural": "Hosts",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Users",
      "default": "",
      "required": true,
      "example": ""
    },
    "cohosts": {
      "machine": "cohosts",
      "singular": "Co-Host",
      "plural": "Co-Hosts",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": Infinity,
      "relationship": "Users",
      "default": "",
      "required": false,
      "example": ""
    },
    "url_alias": {
      "machine": "url_alias",
      "singular": "URL Alias",
      "plural": "URL Alias",
      "field_type": "slug",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "name",
      "required": false,
      "example": ""
    },
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
    "starts": {
      "machine": "starts",
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
    "ends": {
      "machine": "ends",
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
    "cover": {
      "machine": "cover",
      "singular": "Cover",
      "plural": "Covers",
      "field_type": "image",
      "data_type": "string",
      "cardinality": 10,
      "relationship": "",
      "default": "",
      "required": false,
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
    "address": {
      "machine": "address",
      "singular": "Addres",
      "plural": "Address",
      "field_type": "address",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "coordinates": {
      "machine": "coordinates",
      "singular": "Coordinate",
      "plural": "Coordinates",
      "field_type": "coordinates",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "Friendships": {
    "author": {
      "machine": "author",
      "singular": "Sender",
      "plural": "Senders",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Users",
      "default": "",
      "required": true,
      "example": ""
    },
    "recipient": {
      "machine": "recipient",
      "singular": "Recipient",
      "plural": "Recipients",
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
      "plural": "Status",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "pending",
      "required": true,
      "example": "['pending', 'accepted', 'declined', 'withdrawn']",
      "options": [
        {
          "label": "Pending",
          "id": "pending"
        },
        {
          "label": "Accepted",
          "id": "accepted"
        },
        {
          "label": "Declined",
          "id": "declined"
        },
        {
          "label": "Withdrawn",
          "id": "withdrawn"
        }
      ]
    }
  },
  "Invites": {
    "author": {
      "machine": "author",
      "singular": "Sender",
      "plural": "Senders",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Users",
      "default": "",
      "required": true,
      "example": ""
    },
    "recipient": {
      "machine": "recipient",
      "singular": "Recipient",
      "plural": "Recipients",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Users",
      "default": "",
      "required": true,
      "example": ""
    },
    "event": {
      "machine": "event",
      "singular": "Event",
      "plural": "Events",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Events",
      "default": "",
      "required": false,
      "example": ""
    },
    "status": {
      "machine": "status",
      "singular": "Status",
      "plural": "Status",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "invited",
      "required": true,
      "example": "['invited', 'accepted', 'declined', 'withdrawn']",
      "options": [
        {
          "label": "Invited",
          "id": "invited"
        },
        {
          "label": "Accepted",
          "id": "accepted"
        },
        {
          "label": "Declined",
          "id": "declined"
        },
        {
          "label": "Withdrawn",
          "id": "withdrawn"
        }
      ]
    }
  },
  "SongRequests": {
    "author": {
      "machine": "author",
      "singular": "Requester",
      "plural": "Requesters",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Users",
      "default": "",
      "required": true,
      "example": ""
    },
    "song": {
      "machine": "song",
      "singular": "Song",
      "plural": "Songs",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Songs",
      "default": "",
      "required": true,
      "example": ""
    },
    "event": {
      "machine": "event",
      "singular": "Event",
      "plural": "Events",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Events",
      "default": "",
      "required": true,
      "example": ""
    },
    "playlist": {
      "machine": "playlist",
      "singular": "Playlist",
      "plural": "Playlists",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Playlists",
      "default": "",
      "required": true,
      "example": ""
    },
    "status": {
      "machine": "status",
      "singular": "Status",
      "plural": "Status",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "requested",
      "required": true,
      "example": "['requested', 'accepted', 'declined', 'withdrawn']",
      "options": [
        {
          "label": "Requested",
          "id": "requested"
        },
        {
          "label": "Accepted",
          "id": "accepted"
        },
        {
          "label": "Declined",
          "id": "declined"
        },
        {
          "label": "Withdrawn",
          "id": "withdrawn"
        }
      ]
    }
  },
  "EventCheckins": {
    "author": {
      "machine": "author",
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
    "event": {
      "machine": "event",
      "singular": "Event",
      "plural": "Events",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Events",
      "default": "",
      "required": true,
      "example": ""
    },
    "coordinate": {
      "machine": "coordinate",
      "singular": "Coordinate",
      "plural": "Coordinates",
      "field_type": "coordinates",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "status": {
      "machine": "status",
      "singular": "Status",
      "plural": "Status",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "entered",
      "required": true,
      "example": "['entered', 'left']",
      "options": [
        {
          "label": "Entered",
          "id": "entered"
        },
        {
          "label": "Left",
          "id": "left"
        }
      ]
    }
  },
  "Likes": {
    "author": {
      "machine": "author",
      "singular": "Requester",
      "plural": "Requesters",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Users",
      "default": "",
      "required": true,
      "example": ""
    },
    "type": {
      "machine": "type",
      "singular": "Type",
      "plural": "Types",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": "[\"song\", \"event\", \"playlist\", \"request\", \"checkin\", \"friendship\"]",
      "options": [
        {
          "label": "Song",
          "id": "song"
        },
        {
          "label": "Event",
          "id": "event"
        },
        {
          "label": "Playlist",
          "id": "playlist"
        },
        {
          "label": "Request",
          "id": "request"
        },
        {
          "label": "Checkin",
          "id": "checkin"
        },
        {
          "label": "Friendship",
          "id": "friendship"
        }
      ]
    },
    "song": {
      "machine": "song",
      "singular": "Song",
      "plural": "Songs",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Songs",
      "default": "",
      "required": false,
      "example": ""
    },
    "event": {
      "machine": "event",
      "singular": "Event",
      "plural": "Events",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Events",
      "default": "",
      "required": false,
      "example": ""
    },
    "playlist": {
      "machine": "playlist",
      "singular": "Playlist",
      "plural": "Playlists",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "Playlists",
      "default": "",
      "required": false,
      "example": ""
    }
  }
}
//---OBJECT-ACTIONS-TYPE-CONSTANTS-ENDS---//
















































































































































































































































































































































