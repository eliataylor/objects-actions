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

export type CRUDVerb = 'view' | 'add' | 'edit' | 'delete';
//---OBJECT-ACTIONS-PERMS-VERBS-ENDS---//

//---OBJECT-ACTIONS-PERMS-ROLES-STARTS---//

export const DEFAULT_PERM: 'AllowAny' | 'IsAuthenticated' | 'IsAuthenticatedOrReadOnly' = 'IsAuthenticatedOrReadOnly';

export type PermRoles = 'anonymous' | 'authenticated' | 'verified';
//---OBJECT-ACTIONS-PERMS-ROLES-ENDS---//


interface AccessPoint {
  verb: CRUDVerb;
  context: string[]; // a string of EntityType names
  ownership: string; // "own" / "any"
  id_index?: number;
  roles: PermRoles[];
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
    console.warn(`[PERMS] NO MATCHES FOR ${verb} - ${obj._type}`);
    if (DEFAULT_PERM === "AllowAny") return true;
    if (me && me?.id > 0) {
      if (DEFAULT_PERM === "IsAuthenticated" || DEFAULT_PERM === "IsAuthenticatedOrReadOnly") return true;
    } else {
      if ((verb.indexOf("view") > -1 || verb.indexOf("read") > -1) && DEFAULT_PERM === "IsAuthenticatedOrReadOnly") return true;
    }

    return `Default permission Is ${DEFAULT_PERM}`;
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
      console.warn(`[PERMS] MISMATCHED OWNERSHIP isMine: ${isMine}`, perms);
    }
  }

  const myGroups = new Set(
    me?.groups && me?.groups.length > 0 ? me.groups : []
  );

  if (!me) {
    myGroups.add("anonymous");
    const hasRole = perm.roles.indexOf("anonymous") > -1;
    if (hasRole) {
      return true;
    }
    return `Anonymous cannot ${verb} ${obj._type}. You need one of these: ${perm.roles.join(", ")}`;
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