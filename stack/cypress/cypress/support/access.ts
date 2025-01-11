import { EntityTypes } from "./types";

export interface MySession {
  id: number;
  display: string;
  has_usable_password?: boolean;
  email: string;
  username: string;
  picture: string;
  groups?: string[];
}

//---OBJECT-ACTIONS-PERMS-VERBS-STARTS---//

export type CRUDVerb =
  | "view_list"
  | "view_profile"
  | "add"
  | "edit"
  | "delete"
  | "block"
  | "view"
  | "subscribe"
  | "meeting"
  | "comment"
  | "sponsor"
  | "apply-to-speak"
  | "approve"
  | "reject"
  | "user"
  | "rooms";
//---OBJECT-ACTIONS-PERMS-VERBS-ENDS---//

//---OBJECT-ACTIONS-PERMS-ROLES-STARTS---//

export type PermRoles =
  | "anonymous"
  | "authenticated"
  | "verified"
  | "paid user"
  | "admin"
  | "rally attendee"
  | "city sponsor"
  | "city official"
  | "rally speaker"
  | "rally moderator";

//---OBJECT-ACTIONS-PERMS-ROLES-ENDS---//

interface AccessPoint {
  verb: CRUDVerb;
  context: string[]; // a string of EntityType names
  ownership: string; // "own" / "any"
  id_index?: number;
  roles: string[];
  endpoint: string;
  alias?: string;
}

function getPermsByTypeAndVerb(type: string, verb: string) {
  const matches = (permissions as unknown as AccessPoint[]).filter(
    (perms: AccessPoint) => {
      return perms.context.join("-") === type && perms.verb === verb; // TODO: permissions.json needs built differently
    }
  );
  return matches;
}


// returns error string or true if passes
export function canDo(
  verb: CRUDVerb,
  obj: EntityTypes,
  me?: MySession | null
): boolean | string {
  const perms = getPermsByTypeAndVerb(obj._type, verb);

  if (!perms || !perms.length) {
    console.warn(`NO PERM MATCHES FOR ${verb} - ${obj._type}`);
    if (!me || !me.id) {
      return 'Default permission Is Authenticated or Read Only';
    }
    return true;
  }

  let isMine = verb === "add";
  if (!isMine && me) {
    if (obj._type === "Users") {
      isMine = obj.id === me.id;
    } else {
      isMine = "author" in obj && me.id === obj?.author?.id;
    }
  }

  let perm = perms.find(p => p.ownership === "others" && !isMine);
  if (!perm) {
    perms.find(p => p.ownership === "own" && isMine);
    if (!perm) {
      perm = perms[0];
      console.warn(`MISMATCHED OWNERSHIP isMine: ${isMine}`, perms);
    }
  }

  const myGroups = new Set(
    me?.groups && me?.groups.length > 0 ? me.groups : ["anonymous"]
  );

  if (!me || !me.id) {
    const hasRole = perm.roles.indexOf("anonymous") > -1;
    if (hasRole) {
      return true;
    }
  } else {
    myGroups.add("authenticated");
  }

  let errstr = `You have ${Array.from(myGroups).join(", ")}, but must `;
  if (perm.roles.length === 1) {
    errstr += ` be ${perm.roles[0]}`;
  } else {
    errstr += ` have one of these roles - ${perm.roles.join(", ")} - `;
  }
  errstr += ` to ${verb}`;


  if (isMine && perm.ownership === "own") {
    if (perm.roles.some((role) => {
      return myGroups.has(role) || (role === "authenticated" && me.id) || (role === "anonymous" && !me.id);
    })) {
      return true;
    }
    return `${errstr} your own ${obj._type}`;
  } else if (!isMine && perm.ownership === "others") {
    if (perm.roles.some((role) => {
      return myGroups.has(role) || (role === "authenticated" && me.id) || (role === "anonymous" && !me.id);
    })) {
      return true;
    }
    return `${errstr} someone else's ${obj._type}`;
  }

  return `${errstr} ${isMine ? "your own" : "someone else's"} ${obj._type}`;
}


type FormObjectId = `${string}/${number}`;
type NestedObjectIds<T extends string> =
  T extends `${FormObjectId}/${infer Rest}`
    ? `${FormObjectId}/${NestedObjectIds<Rest>}`
    : T;

// Type for the full URL pattern with optional nested pairs
export type FormURL<T extends string> =
  `/forms/${NestedObjectIds<T>}/${CRUDVerb}`;

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
  const segments = url.split("/");
  const verb = segments.pop() as CRUDVerb; // The last segment is the verb
  segments.shift(); // Remove the empty initial segment (before 'forms')
  segments.shift(); // Remove the 'forms' segment

  // Extract the last object/id pair
  const id = parseInt(segments.pop() as string, 10); // The second last segment is the ID
  const object = segments.pop() as string; // The third last segment is the object

  return { object, id, verb };
}


const permissions = [
  {
    "context": ["Users"],
    "endpoint": "users",
    "verb": "view_list",
    "ownership": "own",
    "roles": ["authenticated"]
  },
  {
    "context": ["Users"],
    "endpoint": "users",
    "verb": "view_list",
    "ownership": "others",
    "roles": ["authenticated"]
  },
  {
    "context": ["Users"],
    "endpoint": "user/:id",
    "id_index": 1,
    "verb": "view_profile",
    "ownership": "own",
    "roles": ["authenticated"]
  },
  {
    "context": ["Users"],
    "endpoint": "user/:id",
    "id_index": 1,
    "verb": "view_profile",
    "ownership": "others",
    "roles": ["verified"]
  },
  {
    "context": ["Users"],
    "endpoint": "user/add",
    "verb": "add",
    "ownership": "own",
    "roles": ["anonymous"],
    "alias": "/register"
  },
  {
    "context": ["Users"],
    "endpoint": "user/:id/edit",
    "verb": "edit",
    "id_index": 1,
    "ownership": "own",
    "roles": ["authenticated"]
  },
  {
    "context": ["Users"],
    "endpoint": "user/:id/delete",
    "verb": "delete",
    "id_index": 1,
    "ownership": "own",
    "roles": ["authenticated"]
  },
  {
    "context": ["Users"],
    "endpoint": "user/:id/block",
    "verb": "block",
    "id_index": 1,
    "ownership": "others",
    "roles": ["verified"]
  },
  {
    "context": ["Cities"],
    "endpoint": "city/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "own",
    "roles": ["anonymous", "authenticated"]
  },
  {
    "context": ["Cities"],
    "endpoint": "city/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "others",
    "roles": ["anonymous", "authenticated"]
  },
  {
    "context": ["Cities"],
    "endpoint": "city/add",
    "verb": "add",
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Cities"],
    "endpoint": "city/add",
    "verb": "add",
    "ownership": "others",
    "roles": ["verified"]
  },
  {
    "context": ["Cities"],
    "endpoint": "city/:id/edit",
    "verb": "edit",
    "id_index": 1,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Cities"],
    "endpoint": "city/:id/edit",
    "verb": "edit",
    "id_index": 1,
    "ownership": "others",
    "roles": ["admin"]
  },
  {
    "context": ["Cities"],
    "endpoint": "city/:id/delete",
    "verb": "delete",
    "id_index": 1,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Cities"],
    "endpoint": "city/:id/delete",
    "verb": "delete",
    "id_index": 1,
    "ownership": "others",
    "roles": ["admin"]
  },
  {
    "context": ["Cities"],
    "endpoint": "city/:id/comment/add",
    "verb": "add",
    "id_index": 1,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Cities"],
    "endpoint": "city/:id/comment/:id/edit",
    "verb": "edit",
    "id_index": 3,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Cities"],
    "endpoint": "city/:id/comment/:id/delete",
    "verb": "delete",
    "id_index": 3,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Cities"],
    "endpoint": "city/:id/sponsor/add",
    "verb": "add",
    "id_index": 1,
    "ownership": "own",
    "roles": ["authenticated"]
  },
  {
    "context": ["Cities"],
    "endpoint": "city/:id/sponsor/delete",
    "verb": "delete",
    "id_index": 1,
    "ownership": "others",
    "roles": ["authenticated"]
  },
  {
    "context": ["Rallies"],
    "endpoint": "rally/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "own",
    "roles": ["anonymous", "authenticated"]
  },
  {
    "context": ["Rallies"],
    "endpoint": "rally/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "others",
    "roles": ["anonymous", "authenticated"]
  },
  {
    "context": ["Rallies"],
    "endpoint": "rally/add",
    "verb": "add",
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies"],
    "endpoint": "rally/:id/edit",
    "verb": "edit",
    "id_index": 1,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies"],
    "endpoint": "rally/:id/edit",
    "verb": "edit",
    "id_index": 1,
    "ownership": "others",
    "roles": ["admin", "rally moderator"]
  },
  {
    "context": ["Rallies"],
    "endpoint": "rally/:id/delete",
    "verb": "delete",
    "id_index": 1,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies"],
    "endpoint": "rally/:id/delete",
    "verb": "delete",
    "id_index": 1,
    "ownership": "others",
    "roles": ["admin"]
  },
  {
    "context": ["Rallies"],
    "endpoint": "rally/:id/subscribe",
    "verb": "subscribe",
    "id_index": 1,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies", "Subscriptions"],
    "endpoint": "rally/:id/subscription/:id/edit",
    "verb": "edit",
    "id_index": 3,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies", "Subscriptions"],
    "endpoint": "rally/:id/subscription/:id/delete",
    "verb": "delete",
    "id_index": 3,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies", "Comment"],
    "endpoint": "rally/:id/comment/:id/add",
    "verb": "add",
    "id_index": 3,
    "ownership": "own",
    "roles": ["rally attendee"]
  },
  {
    "context": ["Rallies"],
    "endpoint": "rally/:id/comment/:id/edit",
    "verb": "edit",
    "id_index": 3,
    "ownership": "own",
    "roles": ["rally attendee"]
  },
  {
    "context": ["Rallies", "Comment"],
    "endpoint": "rally/:id/comment/:id/delete",
    "verb": "delete",
    "id_index": 3,
    "ownership": "own",
    "roles": ["rally attendee"]
  },
  {
    "context": ["Rallies", "Comment"],
    "endpoint": "rally/:id/comment/:id/delete",
    "verb": "delete",
    "id_index": 3,
    "ownership": "others",
    "roles": ["admin", "rally moderator"]
  },
  {
    "context": ["Officials"],
    "endpoint": "official/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "own",
    "roles": ["anonymous", "authenticated"]
  },
  {
    "context": ["Officials"],
    "endpoint": "official/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "others",
    "roles": ["anonymous", "authenticated"]
  },
  {
    "context": ["Officials"],
    "endpoint": "official/add",
    "verb": "add",
    "ownership": "own",
    "roles": ["admin", "city sponsor"]
  },
  {
    "context": ["Officials"],
    "endpoint": "official/add",
    "verb": "add",
    "ownership": "others",
    "roles": ["admin", "city sponsor"]
  },
  {
    "context": ["Officials"],
    "endpoint": "official/:id/edit",
    "verb": "edit",
    "id_index": 1,
    "ownership": "own",
    "roles": ["admin", "city sponsor"]
  },
  {
    "context": ["Officials"],
    "endpoint": "official/:id/edit",
    "verb": "edit",
    "id_index": 1,
    "ownership": "others",
    "roles": ["admin", "city sponsor"]
  },
  {
    "context": ["Officials"],
    "endpoint": "official/:id/delete",
    "verb": "delete",
    "id_index": 1,
    "ownership": "own",
    "roles": ["admin", "city sponsor"]
  },
  {
    "context": ["Officials"],
    "endpoint": "official/:id/delete",
    "verb": "delete",
    "id_index": 1,
    "ownership": "others",
    "roles": ["admin", "city sponsor"]
  },
  {
    "context": ["ActionPlans"],
    "endpoint": "action-plan/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "own",
    "roles": ["anonymous", "authenticated"]
  },
  {
    "context": ["ActionPlans"],
    "endpoint": "action-plan/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "others",
    "roles": ["anonymous", "authenticated"]
  },
  {
    "context": ["ActionPlans"],
    "endpoint": "action-plan/add",
    "verb": "add",
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["ActionPlans"],
    "endpoint": "action-plan/:id/edit",
    "verb": "edit",
    "id_index": 1,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["ActionPlans"],
    "endpoint": "action-plan/:id/edit",
    "verb": "edit",
    "id_index": 1,
    "ownership": "others",
    "roles": ["admin"]
  },
  {
    "context": ["ActionPlans"],
    "endpoint": "action-plan/:id/delete",
    "verb": "delete",
    "id_index": 1,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["ActionPlans"],
    "endpoint": "action-plan/:id/delete",
    "verb": "delete",
    "id_index": 1,
    "ownership": "others",
    "roles": []
  },
  {
    "context": ["ActionPlans"],
    "endpoint": "action-plan/:id/comment/:id/add",
    "verb": "add",
    "id_index": 3,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["ActionPlans"],
    "endpoint": "action-plan/:id/comment/:id/edit",
    "verb": "edit",
    "id_index": 3,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["ActionPlans"],
    "endpoint": "action-plan/:id/comment/:id/delete",
    "verb": "delete",
    "id_index": 3,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["ActionPlans"],
    "endpoint": "action-plan/:id/comment/:id/delete",
    "verb": "delete",
    "id_index": 3,
    "ownership": "others",
    "roles": ["admin"]
  },
  {
    "context": ["Rallies"],
    "endpoint": "rally/:id/meeting/:id",
    "id_index": 3,
    "verb": "meeting",
    "ownership": "own",
    "roles": ["anonymous", "authenticated"]
  },
  {
    "context": ["Rallies"],
    "endpoint": "rally/:id/meeting/:id",
    "id_index": 3,
    "verb": "meeting",
    "ownership": "others",
    "roles": ["anonymous", "authenticated"]
  },
  {
    "context": ["Rallies"],
    "endpoint": "rally/:id/meeting",
    "verb": "meeting",
    "id_index": 1,
    "ownership": "own",
    "roles": ["rally attendee", "rally speaker", "rally moderator"]
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/edit",
    "verb": "edit",
    "id_index": 3,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/edit",
    "verb": "edit",
    "id_index": 3,
    "ownership": "others",
    "roles": []
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/delete",
    "verb": "delete",
    "id_index": 3,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/delete",
    "verb": "delete",
    "id_index": 3,
    "ownership": "others",
    "roles": ["admin", "rally moderator"]
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/comment",
    "verb": "comment",
    "id_index": 3,
    "ownership": "own",
    "roles": ["rally attendee"]
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/comment/:id/edit",
    "verb": "edit",
    "id_index": 5,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/comment/:id/delete",
    "verb": "delete",
    "id_index": 5,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/comment/:id/delete",
    "verb": "delete",
    "id_index": 5,
    "ownership": "others",
    "roles": ["rally moderator"]
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/sponsor",
    "verb": "sponsor",
    "id_index": 3,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/sponsor/:id/delete",
    "verb": "delete",
    "id_index": 5,
    "ownership": "others",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/apply-to-speak",
    "verb": "apply-to-speak",
    "id_index": 3,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/apply-to-speak/:id/delete",
    "verb": "delete",
    "id_index": 5,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/apply-to-speak/:id/approve",
    "verb": "approve",
    "id_index": 5,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rallies", "Meetings"],
    "endpoint": "rally/:id/meeting/:id/apply-to-speak/:id/reject",
    "verb": "reject",
    "id_index": 5,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Invites"],
    "endpoint": "invites/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Invites"],
    "endpoint": "invites",
    "verb": "add",
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Invites"],
    "endpoint": "invites/:id/edit",
    "verb": "edit",
    "id_index": 1,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Invites"],
    "endpoint": "invites/:id/delete",
    "verb": "delete",
    "id_index": 1,
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Meetings"],
    "endpoint": "meeting/:id/user/:id",
    "id_index": 3,
    "verb": "user",
    "ownership": "own",
    "roles": ["verified", "admin", "rally attendee"]
  },
  {
    "context": ["Meetings"],
    "endpoint": "meeting/:id/user/:id",
    "id_index": 3,
    "verb": "user",
    "ownership": "others",
    "roles": ["admin", "rally attendee"]
  },
  {
    "context": ["Meetings"],
    "endpoint": "meeting/:id/user/:id",
    "id_index": 3,
    "verb": "user",
    "ownership": "own",
    "roles": ["verified", "rally attendee"]
  },
  {
    "context": ["Meetings"],
    "endpoint": "meeting/:id/user/:id",
    "id_index": 3,
    "verb": "user",
    "ownership": "own",
    "roles": ["verified", "rally attendee"]
  },
  {
    "context": ["Meetings"],
    "endpoint": "meeting/:id/user/:id",
    "id_index": 3,
    "verb": "user",
    "ownership": "own",
    "roles": ["verified", "rally attendee"]
  },
  {
    "context": ["Invites"],
    "endpoint": "invites/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "own",
    "roles": ["anonymous", "authenticated"]
  },
  {
    "context": ["Invites"],
    "endpoint": "invites",
    "verb": "add",
    "ownership": "own",
    "roles": ["admin"]
  },
  {
    "context": ["Invites"],
    "endpoint": "invites/:id/edit",
    "verb": "edit",
    "id_index": 1,
    "ownership": "own",
    "roles": ["admin"]
  },
  {
    "context": ["Invites"],
    "endpoint": "invites/:id/delete",
    "verb": "delete",
    "id_index": 1,
    "ownership": "own",
    "roles": ["admin"]
  },
  {
    "context": ["Meetings"],
    "endpoint": "meeting/:id/rooms",
    "verb": "rooms",
    "id_index": 1,
    "ownership": "",
    "roles": [
      "admin",
      "rally attendee",
      "city sponsor",
      "city official",
      "rally speaker",
      "rally moderator"
    ]
  },
  {
    "context": ["Rooms"],
    "endpoint": "rooms/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rooms"],
    "endpoint": "rooms/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "others",
    "roles": [
      "admin",
      "rally attendee",
      "city sponsor",
      "city official",
      "rally speaker",
      "rally moderator"
    ]
  },
  {
    "context": ["Rooms"],
    "endpoint": "rooms/:id",
    "id_index": 1,
    "verb": "add",
    "ownership": "own",
    "roles": [
      "admin",
      "rally attendee",
      "city sponsor",
      "city official",
      "rally speaker",
      "rally moderator"
    ]
  },
  {
    "context": ["Rooms"],
    "endpoint": "rooms/:id",
    "id_index": 1,
    "verb": "edit",
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Rooms"],
    "endpoint": "rooms/:id",
    "id_index": 1,
    "verb": "delete",
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Subscriptions"],
    "endpoint": "subscriptions/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "own",
    "roles": ["verified", "admin", "rally attendee", "rally moderator"]
  },
  {
    "context": ["Subscriptions"],
    "endpoint": "subscriptions/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "others",
    "roles": ["admin", "rally attendee", "rally moderator"]
  },
  {
    "context": ["Subscriptions"],
    "endpoint": "subscriptions/:id",
    "id_index": 1,
    "verb": "add",
    "ownership": "own",
    "roles": ["verified", "rally attendee"]
  },
  {
    "context": ["Subscriptions"],
    "endpoint": "subscriptions/:id",
    "id_index": 1,
    "verb": "edit",
    "ownership": "own",
    "roles": ["verified", "rally attendee"]
  },
  {
    "context": ["Subscriptions"],
    "endpoint": "subscriptions/:id",
    "id_index": 1,
    "verb": "delete",
    "ownership": "own",
    "roles": ["verified", "rally attendee"]
  },
  {
    "context": ["Resources"],
    "endpoint": "resources/:id",
    "id_index": 1,
    "verb": "view_list",
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Resources"],
    "endpoint": "resources/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "own",
    "roles": ["verified"]
  },
  {
    "context": ["Resources"],
    "endpoint": "resources/:id",
    "id_index": 1,
    "verb": "view",
    "ownership": "others",
    "roles": ["verified"]
  },
  {
    "context": ["Resources"],
    "endpoint": "resources/:id",
    "id_index": 1,
    "verb": "add",
    "ownership": "own",
    "roles": [
      "paid user",
      "rally attendee",
      "city sponsor",
      "city official",
      "rally speaker",
      "rally moderator"
    ]
  },
  {
    "context": ["Resources"],
    "endpoint": "resources/:id",
    "id_index": 1,
    "verb": "edit",
    "ownership": "own",
    "roles": [
      "paid user",
      "rally attendee",
      "city sponsor",
      "city official",
      "rally speaker",
      "rally moderator"
    ]
  },
  {
    "context": ["Resources"],
    "endpoint": "resources/:id",
    "id_index": 1,
    "verb": "delete",
    "ownership": "own",
    "roles": [
      "paid user",
      "rally attendee",
      "city sponsor",
      "city official",
      "rally speaker",
      "rally moderator"
    ]
  }
];
