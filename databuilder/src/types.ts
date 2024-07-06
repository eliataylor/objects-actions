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
    const pattern = /^\/forms(\/[a-zA-Z0-9]+\/\d+)+(\/(add|edit|delete))$/;
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
interface User {
	readonly id: string;
	phone?: string | null;
	email?: string | null;
	profile_picture?: string | null;
	birthday?: string | null;
	gender?: string | null;
	locale?: string | null;
	last_known_location?: string | null;
	status: string;
	spotify_access_token?: string | null;
	spotify_refresh_token?: string | null;
	spotify_token_expires_at?: string | null;
	apple_token_data?: object | null;
}
interface Song {
	readonly id: string;
	spotify_id?: string | null;
	apple_id?: string | null;
	name: string;
	artist?: string | null;
	cover?: string | null;
}
interface Playlist {
	readonly id: string;
	author?: string | null;
	name: string;
	bio?: string | null;
	image?: string | null;
}
interface PlaylistSongs {
	playlist: string;
	song: string;
	order: number;
	likes_count?: number | null;
	author: string;
	match_score?: number | null;
}
interface EventPlaylists {
	playlist: string;
	event: string;
	order: number;
}
interface Venue {
	slug: string;
	author: string;
	managers?: string[] | null;
	name: string;
	description: string;
	cover?: string[] | null;
	bounding_box: string;
	address?: string | null;
	privacy: string;
}
interface Event {
	readonly id: string;
	author: string;
	cohosts?: string | null;
	slug?: string | null;
	name: string;
	starts: string;
	ends: string;
	cover?: string[] | null;
	description: string;
	venue: string;
}
interface Friendship {
	sender: string;
	recipient: string;
	status: string;
}
interface Invites {
	sender: string;
	recipient: string;
	event?: string | null;
	status: string;
}
interface ActivityLog {
	readonly id: string;
	activity: string;
	last_notified: string;
	author: string;
	location?: string | null;
	target_user?: string | null;
	target_song?: string | null;
	target_playlist?: string | null;
	target_event?: string | null;
	target_venue?: string | null;
}
interface SongRequests {
	author: string;
	song: string;
	event: string;
	playlist: string;
	status: string;
}
interface EventCheckins {
	author: string;
	venue: string;
	event: string;
	coordinate: string;
	status: string;
}
interface Likes {
	author: string;
	type: string;
	song?: string | null;
	event?: string | null;
	playlist?: string | null;
}
//---OBJECT-ACTIONS-TYPE-SCHEMA-ENDS---//



//---OBJECT-ACTIONS-API-RESP-STARTS---//
export interface ListView {
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<User | Song | Playlist | PlaylistSongs | EventPlaylists | Venue | Event | Friendship | Invites | ActivityLog | SongRequests | EventCheckins | Likes>
}

export type EntityView = User | Song | Playlist | PlaylistSongs | EventPlaylists | Venue | Event | Friendship | Invites | ActivityLog | SongRequests | EventCheckins | Likes; 
//---OBJECT-ACTIONS-API-RESP-ENDS---//



//---OBJECT-ACTIONS-NAV-ITEMS-STARTS---//
export interface NavItem {
    name: string;
    class: string;
    api: string;
    screen: string;
}
export const NAVITEMS: NavItem[] = [
  {
    "name": "User",
    "class": "user",
    "api": "/api/user",
    "screen": "/user"
  },
  {
    "name": "Song",
    "class": "song",
    "api": "/api/song",
    "screen": "/song"
  },
  {
    "name": "Playlist",
    "class": "playlist",
    "api": "/api/playlist",
    "screen": "/playlist"
  },
  {
    "name": "Playlist Songs",
    "class": "playlist_songs",
    "api": "/api/playlist_songs",
    "screen": "/playlist_songs"
  },
  {
    "name": "Event Playlists",
    "class": "event_playlists",
    "api": "/api/event_playlists",
    "screen": "/event_playlists"
  },
  {
    "name": "Venue",
    "class": "venue",
    "api": "/api/venue",
    "screen": "/venue"
  },
  {
    "name": "Event",
    "class": "event",
    "api": "/api/event",
    "screen": "/event"
  },
  {
    "name": "Friendship",
    "class": "friendship",
    "api": "/api/friendship",
    "screen": "/friendship"
  },
  {
    "name": "Invites",
    "class": "invites",
    "api": "/api/invites",
    "screen": "/invites"
  },
  {
    "name": "Activity Log",
    "class": "activity_log",
    "api": "/api/activity_log",
    "screen": "/activity_log"
  },
  {
    "name": "Song Requests",
    "class": "song_requests",
    "api": "/api/song_requests",
    "screen": "/song_requests"
  },
  {
    "name": "Event Checkins",
    "class": "event_checkins",
    "api": "/api/event_checkins",
    "screen": "/event_checkins"
  },
  {
    "name": "Likes",
    "class": "likes",
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
  "user": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "data_type": "string",
      "field_type": "id_auto_increment",
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
      "data_type": "string",
      "field_type": "phone",
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
      "data_type": "string",
      "field_type": "email",
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
      "data_type": "string",
      "field_type": "image",
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
      "data_type": "string",
      "field_type": "date",
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
      "data_type": "string",
      "field_type": "enum",
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
      "data_type": "string",
      "field_type": "text",
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
      "data_type": "string",
      "field_type": "coordinates",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    },
    "status": {
      "machine": "status",
      "singular": "Status",
      "plural": "Status",
      "data_type": "string",
      "field_type": "enum",
      "cardinality": 1,
      "relationship": "",
      "default": "pending",
      "required": true,
      "example": "[\"invited\", \"pending\", \"verified\", \"deleted\", \"locked\"]",
      "options": [
        {
          "label": "Invited",
          "id": "invited"
        },
        {
          "label": "Pending",
          "id": "pending"
        },
        {
          "label": "Verified",
          "id": "verified"
        },
        {
          "label": "Deleted",
          "id": "deleted"
        },
        {
          "label": "Locked",
          "id": "locked"
        }
      ]
    },
    "spotify_access_token": {
      "machine": "spotify_access_token",
      "singular": "Spotify Token",
      "plural": "Spotify Tokens",
      "data_type": "string",
      "field_type": "text",
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
      "data_type": "string",
      "field_type": "text",
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
      "data_type": "string",
      "field_type": "date_time",
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
      "data_type": "object",
      "field_type": "json",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "song": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "data_type": "string",
      "field_type": "id_auto_increment",
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
      "data_type": "string",
      "field_type": "text",
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
      "data_type": "string",
      "field_type": "text",
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
      "data_type": "string",
      "field_type": "text",
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
      "data_type": "string",
      "field_type": "text",
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
      "data_type": "string",
      "field_type": "image",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "playlist": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "data_type": "string",
      "field_type": "id_auto_increment",
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
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": 1,
      "relationship": "user_account",
      "default": "",
      "required": false,
      "example": ""
    },
    "name": {
      "machine": "name",
      "singular": "Name",
      "plural": "Names",
      "data_type": "string",
      "field_type": "text",
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
      "data_type": "string",
      "field_type": "text",
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
      "data_type": "string",
      "field_type": "image",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "playlist_songs": {
    "playlist": {
      "machine": "playlist",
      "singular": "Playlist",
      "plural": "Playlists",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "playlist",
      "default": "",
      "required": true,
      "example": ""
    },
    "song": {
      "machine": "song",
      "singular": "Song",
      "plural": "Songs",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "song",
      "default": "",
      "required": true,
      "example": ""
    },
    "order": {
      "machine": "order",
      "singular": "Order",
      "plural": "Orders",
      "data_type": "number",
      "field_type": "integer",
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
      "data_type": "number",
      "field_type": "integer",
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
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": 1,
      "relationship": "user_account",
      "default": "",
      "required": true,
      "example": ""
    },
    "match_score": {
      "machine": "match_score",
      "singular": "Match Score",
      "plural": "Match Scores",
      "data_type": "number",
      "field_type": "integer",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "event_playlists": {
    "playlist": {
      "machine": "playlist",
      "singular": "Playlist",
      "plural": "Playlists",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "playlist",
      "default": "",
      "required": true,
      "example": ""
    },
    "event": {
      "machine": "event",
      "singular": "Event",
      "plural": "Events",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "event",
      "default": "",
      "required": true,
      "example": ""
    },
    "order": {
      "machine": "order",
      "singular": "Order",
      "plural": "Orders",
      "data_type": "number",
      "field_type": "integer",
      "cardinality": 1,
      "relationship": "",
      "default": "",
      "required": true,
      "example": ""
    }
  },
  "venue": {
    "slug": {
      "machine": "slug",
      "singular": "URL Alia",
      "plural": "URL Alias",
      "data_type": "string",
      "field_type": "slug",
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
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": 1,
      "relationship": "user_account",
      "default": "",
      "required": true,
      "example": ""
    },
    "managers": {
      "machine": "managers",
      "singular": "Manager",
      "plural": "Managers",
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": 3,
      "relationship": "user_account",
      "default": "",
      "required": false,
      "example": ""
    },
    "name": {
      "machine": "name",
      "singular": "Name",
      "plural": "Names",
      "data_type": "string",
      "field_type": "text",
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
      "data_type": "string",
      "field_type": "textarea",
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
      "data_type": "string",
      "field_type": "image",
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
      "data_type": "string",
      "field_type": "bounding_box",
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
      "data_type": "string",
      "field_type": "address",
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
      "data_type": "string",
      "field_type": "enum",
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
  "event": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "data_type": "string",
      "field_type": "id_auto_increment",
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
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": 1,
      "relationship": "user_account",
      "default": "",
      "required": true,
      "example": ""
    },
    "cohosts": {
      "machine": "cohosts",
      "singular": "Co-Host",
      "plural": "Co-Hosts",
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": Infinity,
      "relationship": "user_account",
      "default": "",
      "required": false,
      "example": ""
    },
    "slug": {
      "machine": "slug",
      "singular": "URL Alia",
      "plural": "URL Alias",
      "data_type": "string",
      "field_type": "slug",
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
      "data_type": "string",
      "field_type": "text",
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
      "data_type": "string",
      "field_type": "date_time",
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
      "data_type": "string",
      "field_type": "date_time",
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
      "data_type": "string",
      "field_type": "image",
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
      "data_type": "string",
      "field_type": "textarea",
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
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "venue",
      "default": "",
      "required": true,
      "example": ""
    }
  },
  "friendship": {
    "sender": {
      "machine": "sender",
      "singular": "Sender",
      "plural": "Senders",
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": 1,
      "relationship": "user_account",
      "default": "",
      "required": true,
      "example": ""
    },
    "recipient": {
      "machine": "recipient",
      "singular": "Recipient",
      "plural": "Recipients",
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": 1,
      "relationship": "user_account",
      "default": "",
      "required": true,
      "example": ""
    },
    "status": {
      "machine": "status",
      "singular": "Status",
      "plural": "Status",
      "data_type": "string",
      "field_type": "enum",
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
  "invites": {
    "sender": {
      "machine": "sender",
      "singular": "Sender",
      "plural": "Senders",
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": 1,
      "relationship": "user_account",
      "default": "",
      "required": true,
      "example": ""
    },
    "recipient": {
      "machine": "recipient",
      "singular": "Recipient",
      "plural": "Recipients",
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": 1,
      "relationship": "user_account",
      "default": "",
      "required": true,
      "example": ""
    },
    "event": {
      "machine": "event",
      "singular": "Event",
      "plural": "Events",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "event",
      "default": "",
      "required": false,
      "example": ""
    },
    "status": {
      "machine": "status",
      "singular": "Status",
      "plural": "Status",
      "data_type": "string",
      "field_type": "enum",
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
  "activity_log": {
    "id": {
      "machine": "id",
      "singular": "ID",
      "plural": "IDs",
      "data_type": "string",
      "field_type": "id_auto_increment",
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
      "data_type": "string",
      "field_type": "enum",
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
      "data_type": "string",
      "field_type": "date_time",
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
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": 1,
      "relationship": "user_account",
      "default": "",
      "required": true,
      "example": ""
    },
    "location": {
      "machine": "location",
      "singular": "Location",
      "plural": "Locations",
      "data_type": "string",
      "field_type": "coordinates",
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
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "user_account",
      "default": "",
      "required": false,
      "example": ""
    },
    "target_song": {
      "machine": "target_song",
      "singular": "Target Song",
      "plural": "Target Songs",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "song",
      "default": "",
      "required": false,
      "example": ""
    },
    "target_playlist": {
      "machine": "target_playlist",
      "singular": "Target Playlist",
      "plural": "Target Playlists",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "playlist",
      "default": "",
      "required": false,
      "example": ""
    },
    "target_event": {
      "machine": "target_event",
      "singular": "Target Event",
      "plural": "Target Events",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "event",
      "default": "",
      "required": false,
      "example": ""
    },
    "target_venue": {
      "machine": "target_venue",
      "singular": "Target Venue",
      "plural": "Target Venues",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "venue",
      "default": "",
      "required": false,
      "example": ""
    }
  },
  "song_requests": {
    "author": {
      "machine": "author",
      "singular": "Requester",
      "plural": "Requesters",
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": 1,
      "relationship": "user_account",
      "default": "",
      "required": true,
      "example": ""
    },
    "song": {
      "machine": "song",
      "singular": "Song",
      "plural": "Songs",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "song",
      "default": "",
      "required": true,
      "example": ""
    },
    "event": {
      "machine": "event",
      "singular": "Event",
      "plural": "Events",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "event",
      "default": "",
      "required": true,
      "example": ""
    },
    "playlist": {
      "machine": "playlist",
      "singular": "Playlist",
      "plural": "Playlists",
      "data_type": "string",
      "field_type": "type_reference",
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
      "data_type": "string",
      "field_type": "enum",
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
  "event_checkins": {
    "author": {
      "machine": "author",
      "singular": "User",
      "plural": "Users",
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": 1,
      "relationship": "user_account",
      "default": "",
      "required": true,
      "example": ""
    },
    "venue": {
      "machine": "venue",
      "singular": "Venue",
      "plural": "Venues",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "venue",
      "default": "",
      "required": true,
      "example": ""
    },
    "event": {
      "machine": "event",
      "singular": "Event",
      "plural": "Events",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "event",
      "default": "",
      "required": true,
      "example": ""
    },
    "coordinate": {
      "machine": "coordinate",
      "singular": "Coordinate",
      "plural": "Coordinates",
      "data_type": "string",
      "field_type": "coordinates",
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
      "data_type": "string",
      "field_type": "enum",
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
  "likes": {
    "author": {
      "machine": "author",
      "singular": "Requester",
      "plural": "Requesters",
      "data_type": "string",
      "field_type": "user_account",
      "cardinality": 1,
      "relationship": "user_account",
      "default": "",
      "required": true,
      "example": ""
    },
    "type": {
      "machine": "type",
      "singular": "Type",
      "plural": "Types",
      "data_type": "string",
      "field_type": "enum",
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
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "song",
      "default": "",
      "required": false,
      "example": ""
    },
    "event": {
      "machine": "event",
      "singular": "Event",
      "plural": "Events",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "event",
      "default": "",
      "required": false,
      "example": ""
    },
    "playlist": {
      "machine": "playlist",
      "singular": "Playlist",
      "plural": "Playlists",
      "data_type": "string",
      "field_type": "type_reference",
      "cardinality": 1,
      "relationship": "playlist_songs",
      "default": "",
      "required": false,
      "example": ""
    }
  }
}
//---OBJECT-ACTIONS-TYPE-CONSTANTS-ENDS---//























































































































































































