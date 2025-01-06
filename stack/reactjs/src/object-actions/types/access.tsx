import { EntityTypes } from './types';
import permissions from './permissions.json';

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
  | 'view_list'
  | 'view_profile'
  | 'add'
  | 'edit'
  | 'delete'
  | 'block'
  | ''
  | 'view'
  | 'subscribe'
  | 'meeting'
  | 'comment'
  | 'sponsor'
  | 'apply-to-speak'
  | 'approve'
  | 'reject'
  | 'user'
  | 'rooms';
//---OBJECT-ACTIONS-PERMS-VERBS-ENDS---//

//---OBJECT-ACTIONS-PERMS-ROLES-STARTS---//

export type PermRoles =
  | 'anonymous'
  | 'authenticated'
  | 'verified'
  | 'paid user'
  | 'admin'
  | 'rally attendee'
  | 'city sponsor'
  | 'city official'
  | 'rally speaker'
  | 'rally moderator';
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

function getPermsByTypeAndVerb(type: String, verb: String) {
  const matches = (permissions as unknown as AccessPoint[]).find(
    (perms: AccessPoint) => {
      return perms.context.join('-') === type && perms.verb === verb; // TODO: permissions.json needs built differently
    },
  );
  return matches;
}

export function getEndpoints(url: string, verb: CRUDVerb): AccessPoint[] {
  url = url.replace('/api', '');
  url = url.replace(/^\/|\/$/g, '');
  const segments = url.split('/');

  const endpoint: any = { context: [] };

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i];
    const previous = i > 0 ? segments[i - 1] : '';

    if (Number.isInteger(previous)) {
      if (!endpoint.verb) {
        endpoint.verb = segment;
      }
    } else {
      endpoint.context.unshift(segment);
    }
  }

  if (!endpoint.verb) endpoint.verb = 'view';

  const targetUrl = endpoint.context.join('/').toLowerCase();

  const matches = (permissions as unknown as AccessPoint[]).filter(
    (perms: AccessPoint) => {
      if (perms.context.join('/').toLowerCase() === targetUrl) {
        if (perms.verb === verb) {
          return true;
        }
      }
      return false;
    },
  );

  return matches;
}

export function can_view(
  verb: CRUDVerb,
  url: string,
  me: MySession | null,
  obj: EntityTypes,
): boolean {
  return true;
}

// returns error string or true if passes
export function canDo(
  verb: CRUDVerb,
  obj: EntityTypes,
  me?: MySession | null,
): boolean | string {
  const perm = getPermsByTypeAndVerb(obj._type, verb);
  console.log(perm);

  if (!perm) {
    // TODO: check store.accessor.default
    return true;
  }

  if (!me) {
    // test what is allowed for anonymous visitors
    if (verb !== 'add') {
      // can anonymous users edit / delete content authored by other users
      const others = perm.ownership === 'others';
      if (!others) return `anonymous cannot ${verb} this ${obj._type}`;
    }
    // can anonymous users add / edit / delete this content type
    const hasRole = perm.roles.indexOf('anonymous') > -1;
    if (hasRole) {
      return true;
    }
    return `Anonymous cannot ${verb} this ${obj._type}`;
  }

  let errstr = `You must `;
  if (perm.roles.length === 1) {
    errstr += ` be ${perm.roles[0]}`;
  } else {
    errstr += ` have one of these roles - ${perm.roles[0]} - `;
  }
  errstr += ` to ${verb}`;

  // @ts-ignore
  const isMine =
    typeof obj['author'] !== 'undefined' && me.id === obj?.author?.id;
  const myGroups = new Set(
    me?.groups && me?.groups.length > 0 ? me.groups : [],
  );

  if (isMine && perm.ownership === 'own') {
    if (perm.roles.some((element) => myGroups.has(element))) {
      return true;
    }
    return `${errstr} your own ${obj._type}`;
  } else if (!isMine && perm.ownership === 'others') {
    if (perm.roles.some((element) => myGroups.has(element))) {
      return true;
    }
    return `${errstr} someone else's ${obj._type}`;
  }

  return `${errstr} ${isMine ? 'your own' : "someone else's"} ${obj._type}`;
}

export function canDoOld(
  verb: CRUDVerb,
  url: string,
  me: MySession | null,
  obj: EntityTypes,
): boolean {
  const byurl = getEndpoints(url, verb);
  console.log(`MATCHING ${url} - ${verb}`, byurl);

  if (!me) {
    const others = byurl.find((endpoint) => endpoint.ownership === 'others');
    if (!others) return false;
    return others.roles.some((element) => myGroups.has(element));
  }

  // @ts-ignore
  const isMine =
    typeof obj['author'] !== 'undefined' && me.id === obj?.author?.id;

  const myGroups = new Set(
    me?.groups && me?.groups.length > 0 ? me.groups : ['anonymous'],
  );

  for (let i = 0; i < byurl.length; i++) {
    if (isMine && byurl[i].ownership === 'own') {
      if (byurl[i].roles.some((element) => myGroups.has(element))) {
        return true;
      }
    } else if (!isMine && byurl[i].ownership === 'others') {
      if (byurl[i].roles.some((element) => myGroups.has(element))) {
        return true;
      }
    }
  }

  return false;
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
  const segments = url.split('/');
  const verb = segments.pop() as CRUDVerb; // The last segment is the verb
  segments.shift(); // Remove the empty initial segment (before 'forms')
  segments.shift(); // Remove the 'forms' segment

  // Extract the last object/id pair
  const id = parseInt(segments.pop() as string, 10); // The second last segment is the ID
  const object = segments.pop() as string; // The third last segment is the object

  return { object, id, verb };
}
