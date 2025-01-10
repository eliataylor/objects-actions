import { EntityTypes } from "./types";
import permissions from "./permissions.json";

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
  | ""
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
    // TODO: check store.accessor.default
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

  let perm = perms.find(p => p.ownership === 'others' && !isMine)
  if (!perm) {
    perms.find(p => p.ownership === 'own' && isMine)
    if (!perm) {
      perm = perms[0];
      console.warn(`MISMATCHED OWNERSHIP isMine: ${isMine}`, perms)
    }
  }

  if (!me) {
    // test what is allowed for anonymous visitors
    if (verb !== "add") {
      // can anonymous users edit / delete content authored by other users
      const others = perm.ownership === "others";
      if (!others) return `anonymous cannot ${verb} this ${obj._type}`;
    }
    // can anonymous users add / edit / delete this content type
    const hasRole = perm.roles.indexOf("anonymous") > -1;
    if (hasRole) {
      return true;
    }
    return `Anonymous cannot ${verb} this ${obj._type}`;
  }

  let errstr = `You must `;
  if (perm.roles.length === 1) {
    errstr += ` be ${perm.roles[0]}`;
  } else {
    errstr += ` have one of these roles - ${perm.roles.join(', ')} - `;
  }
  errstr += ` to ${verb}`;

  const myGroups = new Set(
    me?.groups && me?.groups.length > 0 ? me.groups : []
  );

  if (isMine && perm.ownership === "own") {
    if (perm.roles.some((role) => {
      return myGroups.has(role) || (role === "authenticated" && me.id) || (role === "anonymous" && !me.id)
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
