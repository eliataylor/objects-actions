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
interface Users {
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
	locale?: string | null;
	last_known_location?: string | null;
	spotify_access_token?: string | null;
	spotify_refresh_token?: string | null;
	spotify_token_expires_at?: string | null;
	apple_token_data?: object | null;
}
interface Songs {
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
interface Playlists {
	_type: string
	created_at: number
	modified_at: number
	readonly id: number;
	author?: RelEntity | null;
	name: string;
	bio?: string | null;
	image?: string | null;
}
interface PlaylistSongs {
	_type: string
	created_at: number
	modified_at: number
	playlist: RelEntity;
	song: RelEntity;
	order: number;
	likes_count?: number | null;
	author: RelEntity;
	match_score?: number | null;
}
interface EventPlaylists {
	_type: string
	created_at: number
	modified_at: number
	author?: number
	playlist: RelEntity;
	event: RelEntity;
	order: number;
}
interface Venues {
	_type: string
	created_at: number
	modified_at: number
	url_alias: string;
	author: RelEntity;
	managers?: RelEntity[] | null;
	name: string;
	description: string;
	cover?: string[] | null;
	bounding_box: string;
	address?: string | null;
	privacy: string;
}
interface Events {
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
	venue: RelEntity;
}
interface Friendships {
	_type: string
	created_at: number
	modified_at: number
	author: RelEntity;
	recipient: RelEntity;
	status: string;
}
interface Invites {
	_type: string
	created_at: number
	modified_at: number
	author?: number
	sender: RelEntity;
	recipient: RelEntity;
	event?: RelEntity | null;
	status: string;
}
interface ActivityLogs {
	_type: string
	created_at: number
	modified_at: number
	readonly id: number;
	activity: string;
	last_notified: string;
	author: RelEntity;
	location?: string | null;
	target_user?: RelEntity | null;
	target_song?: RelEntity | null;
	target_playlist?: RelEntity | null;
	target_event?: RelEntity | null;
	target_venue?: RelEntity | null;
}
interface SongRequests {
	_type: string
	created_at: number
	modified_at: number
	author: RelEntity;
	song: RelEntity;
	event: RelEntity;
	playlist: RelEntity;
	status: string;
}
interface EventCheckins {
	_type: string
	created_at: number
	modified_at: number
	author: RelEntity;
	venue: RelEntity;
	event: RelEntity;
	coordinate: string;
	status: string;
}
interface Likes {
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

export interface ListView {
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<Users | Songs | Playlists | PlaylistSongs | EventPlaylists | Venues | Events | Friendships | Invites | ActivityLogs | SongRequests | EventCheckins | Likes>
}

export type EntityView = Users | Songs | Playlists | PlaylistSongs | EventPlaylists | Venues | Events | Friendships | Invites | ActivityLogs | SongRequests | EventCheckins | Likes; 

export function getProp<T extends EntityView, K extends keyof T>(entity: EntityView, key: string): T[K] | null {
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
        type: string;
}
export const NAVITEMS: NavItem[] = [
  {
    "name": "Users",
    "type": "Users",
    "api": "/api/users",
    "screen": "/users"
  },
  {
    "name": "Songs",
    "type": "Songs",
    "api": "/api/songs",
    "screen": "/songs"
  },
  {
    "name": "Playlists",
    "type": "Playlists",
    "api": "/api/playlists",
    "screen": "/playlists"
  },
  {
    "name": "Playlist Songs",
    "type": "PlaylistSongs",
    "api": "/api/playlist_songs",
    "screen": "/playlist_songs"
  },
  {
    "name": "Event Playlists",
    "type": "EventPlaylists",
    "api": "/api/event_playlists",
    "screen": "/event_playlists"
  },
  {
    "name": "Venues",
    "type": "Venues",
    "api": "/api/venues",
    "screen": "/venues"
  },
  {
    "name": "Events",
    "type": "Events",
    "api": "/api/events",
    "screen": "/events"
  },
  {
    "name": "Friendships",
    "type": "Friendships",
    "api": "/api/friendships",
    "screen": "/friendships"
  },
  {
    "name": "Invites",
    "type": "Invites",
    "api": "/api/invites",
    "screen": "/invites"
  },
  {
    "name": "Activity Logs",
    "type": "ActivityLogs",
    "api": "/api/activity_logs",
    "screen": "/activity_logs"
  },
  {
    "name": "Song Requests",
    "type": "SongRequests",
    "api": "/api/song_requests",
    "screen": "/song_requests"
  },
  {
    "name": "Event Checkins",
    "type": "EventCheckins",
    "api": "/api/event_checkins",
    "screen": "/event_checkins"
  },
  {
    "name": "Likes",
    "type": "Likes",
    "api": "/api/likes",
    "screen": "/likes"
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
    options?: object;
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
    "locale": {
      "machine": "locale",
      "singular": "Locale",
      "plural": "Locales",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
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
    "spotify_access_token": {
      "machine": "spotify_access_token",
      "singular": "Spotify Token",
      "plural": "Spotify Tokens",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "spotify_refresh_token": {
      "machine": "spotify_refresh_token",
      "singular": "Spotify Refresh Token",
      "plural": "Spotify Refresh Tokens",
      "field_type": "text",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "spotify_token_expires_at": {
      "machine": "spotify_token_expires_at",
      "singular": "Spotify Expiry",
      "plural": "Spotify Expirys",
      "field_type": "date_time",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "apple_token_data": {
      "machine": "apple_token_data",
      "singular": "Apple Token",
      "plural": "Apple Tokens",
      "field_type": "json",
      "data_type": "object",
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
    "author": {
      "machine": "author",
      "singular": "DJ",
      "plural": "DJs",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "users",
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
    "bio": {
      "machine": "bio",
      "singular": "Bio",
      "plural": "Bios",
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
  "PlaylistSongs": {
    "playlist": {
      "machine": "playlist",
      "singular": "Playlist",
      "plural": "Playlists",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "playlists",
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
      "relationship": "songs",
      "default": "",
      "required": true,
      "example": ""
    },
    "order": {
      "machine": "order",
      "singular": "Order",
      "plural": "Orders",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "likes_count": {
      "machine": "likes_count",
      "singular": "Like",
      "plural": "Likes",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "0",
      "required": false,
      "example": ""
    },
    "author": {
      "machine": "author",
      "singular": "Added By",
      "plural": "Added Bys",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "users",
      "default": "",
      "required": true,
      "example": ""
    },
    "match_score": {
      "machine": "match_score",
      "singular": "Match Score",
      "plural": "Match Scores",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "EventPlaylists": {
    "playlist": {
      "machine": "playlist",
      "singular": "Playlist",
      "plural": "Playlists",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "playlists",
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
      "relationship": "events",
      "default": "",
      "required": true,
      "example": ""
    },
    "order": {
      "machine": "order",
      "singular": "Order",
      "plural": "Orders",
      "field_type": "integer",
      "data_type": "number",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    }
  },
  "Venues": {
    "url_alias": {
      "machine": "url_alias",
      "singular": "URL Alias",
      "plural": "URL Alias",
      "field_type": "slug",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "name",
      "required": true,
      "example": ""
    },
    "author": {
      "machine": "author",
      "singular": "Owner",
      "plural": "Owners",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "users",
      "default": "",
      "required": true,
      "example": ""
    },
    "managers": {
      "machine": "managers",
      "singular": "Manager",
      "plural": "Managers",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 3,
      "relationship": "users",
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
    "bounding_box": {
      "machine": "bounding_box",
      "singular": "Bounding Box",
      "plural": "Bounding Boxes",
      "field_type": "bounding_box",
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
      "default": "unlisted",
      "required": true,
      "example": "['public', 'unlisted', 'invite-only']",
      "options": [
        {
          "label": "Public",
          "id": "public"
        },
        {
          "label": "Unlisted",
          "id": "unlisted"
        },
        {
          "label": "Invite-only",
          "id": "inviteonly"
        }
      ]
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
      "relationship": "users",
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
      "relationship": "users",
      "default": "",
      "required": false,
      "example": ""
    },
    "url_alias": {
      "machine": "url_alias",
      "singular": "URL Alia",
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
    "venue": {
      "machine": "venue",
      "singular": "Venue",
      "plural": "Venues",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "venues",
      "default": "",
      "required": true,
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
      "relationship": "users",
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
      "relationship": "users",
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
    "sender": {
      "machine": "sender",
      "singular": "Sender",
      "plural": "Senders",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "users",
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
      "relationship": "users",
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
      "relationship": "events",
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
  "ActivityLogs": {
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
    "activity": {
      "machine": "activity",
      "singular": "Activity",
      "plural": "Activitys",
      "field_type": "enum",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": "[\"request-song\", \"like-song-request\", \"checkin\", \"leave\"]",
      "options": [
        {
          "label": "Request-song",
          "id": "requestsong"
        },
        {
          "label": "Like-song-request",
          "id": "likesongrequest"
        },
        {
          "label": "Checkin",
          "id": "checkin"
        },
        {
          "label": "Leave",
          "id": "leave"
        }
      ]
    },
    "last_notified": {
      "machine": "last_notified",
      "singular": "Last Notified",
      "plural": "Last Notifieds",
      "field_type": "date_time",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    },
    "author": {
      "machine": "author",
      "singular": "User",
      "plural": "Users",
      "field_type": "user_account",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "users",
      "default": "",
      "required": true,
      "example": ""
    },
    "location": {
      "machine": "location",
      "singular": "Location",
      "plural": "Locations",
      "field_type": "coordinates",
      "data_type": "string",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "target_user": {
      "machine": "target_user",
      "singular": "Target User",
      "plural": "Target Users",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "users",
      "default": "",
      "required": false,
      "example": ""
    },
    "target_song": {
      "machine": "target_song",
      "singular": "Target Song",
      "plural": "Target Songs",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "songs",
      "default": "",
      "required": false,
      "example": ""
    },
    "target_playlist": {
      "machine": "target_playlist",
      "singular": "Target Playlist",
      "plural": "Target Playlists",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "playlists",
      "default": "",
      "required": false,
      "example": ""
    },
    "target_event": {
      "machine": "target_event",
      "singular": "Target Event",
      "plural": "Target Events",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "events",
      "default": "",
      "required": false,
      "example": ""
    },
    "target_venue": {
      "machine": "target_venue",
      "singular": "Target Venue",
      "plural": "Target Venues",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "venues",
      "default": "",
      "required": false,
      "example": ""
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
      "relationship": "users",
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
      "relationship": "songs",
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
      "relationship": "events",
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
      "relationship": "playlist_songs",
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
      "relationship": "users",
      "default": "",
      "required": true,
      "example": ""
    },
    "venue": {
      "machine": "venue",
      "singular": "Venue",
      "plural": "Venues",
      "field_type": "type_reference",
      "data_type": "RelEntity",
      "cardinality": 1,
      "relationship": "venues",
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
      "relationship": "events",
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
      "relationship": "users",
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
      "example": "[\"song\", \"event\", \"playlist\", \"request\"]",
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
      "relationship": "songs",
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
      "relationship": "events",
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
      "relationship": "playlist_songs",
      "default": "",
      "required": false,
      "example": ""
    }
  }
}
//---OBJECT-ACTIONS-TYPE-CONSTANTS-ENDS---//



































































































































































































































































