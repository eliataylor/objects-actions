import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { NAVITEMS } from "./object-actions/types/types";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const isDayJs = (val: any) => {
  return val instanceof dayjs;
};

export const getModelName = (model: string) => {
  const hasUrl = NAVITEMS.find((nav) => {
    return model === nav.type;
  });
  if (hasUrl) return hasUrl.singular;
  return model;
};

export const getUsername = (entity: { [key: string]: any }) => {
  const username = entity.str ? entity.str : getFieldValue(entity, "username");
  if (username.length > 0) return `@${username.toLowerCase()}`;
  return "";
};

export const getFullName = (entity: { [key: string]: any }) => {
  const name = getFieldValue(entity, "full_name");
  if (name.length > 0) return name;
  const first = getFieldValue(entity, "first_name");
  const last = getFieldValue(entity, "last_name");
  return `${first} ${last}`.trim();
};

export const getFieldValue = (
  entity: { [key: string]: any },
  field_name: string
) => {
  if (entity.username) return entity[field_name];
  if (entity.entity && entity.entity[field_name])
    return entity.entity[field_name];
  return "";
};

export function humanize(str: string) {
  if (str === "modified_at") return "Last Modified";
  str = str.replaceAll("_", " ");
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function makeRelative(url: string) {
  try {
    // Use the URL constructor for parsing
    const parsedUrl = new URL(url);
    return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
  } catch (error) {
    // If the URL is invalid, return as-is or handle the error
    console.error("Invalid URL provided:", url);
    return url;
  }
}

export function timeAgo(timestamp: Date | string | number): string {
  let date: Date;

  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === "string" || typeof timestamp === "number") {
    date = new Date(timestamp);
  } else {
    throw new Error("Invalid timestamp format");
  }

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    y: 60 * 60 * 24 * 365, // years
    mo: 60 * 60 * 24 * 30, // months
    w: 60 * 60 * 24 * 7, // weeks
    d: 60 * 60 * 24, // days
    h: 60 * 60, // hours
    m: 60, // minutes
    s: 1 // seconds
  };

  for (const [key, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      return `${count}${key}`;
    }
  }

  return "0s"; // fallback for less than a second
}
