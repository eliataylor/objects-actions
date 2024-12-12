import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {NAVITEMS} from "./object-actions/types/types";
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const formatDateRange2 = (start: string, end: string) => {
    const startDate = dayjs(start);
    const endDate = dayjs(end);

    let formatted = '';

    // Format start date
    formatted += startDate.format('MMMM D, YYYY');

    // Check if month, day, year or hour need to be added to avoid repetition
    if (!startDate.isSame(endDate, 'month')) {
        formatted += ` - ${endDate.format('MMMM D')}`;
    }
    if (!startDate.isSame(endDate, 'year')) {
        formatted += ` ${endDate.format('YYYY')}`;
    } else if (!startDate.isSame(endDate, 'day')) {
        formatted += ` - ${endDate.format('D')}`;
    }
    if (!startDate.isSame(endDate, 'hour')) {
        formatted += `, ${endDate.format('h:mm A')}`;
    } else {
        formatted += `, ${endDate.format('h:mm A')}`;
    }

    return formatted;
};

export const isDayJs = (val: any) => {
    return val instanceof dayjs
}

export const isCurrent = (start: string, end: string) => {
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    const now = dayjs();

    console.log(startDate.toISOString(), endDate.toISOString())

    return now.isBetween(startDate, endDate, null, '[]'); // '[]' includes the start and end times
};

export const formatDateRange = (start: string, end: string) => {

    const startDate = dayjs(start);
    const endDate = dayjs(end);
    const currentYear = dayjs().year();

    let formatted = '';

    // Format start date
    formatted += startDate.format('MMM D h:mm a');

    // Add year if it's not the current year
    if (startDate.year() !== endDate.year() || endDate.year() !== currentYear) {
        formatted += `, ${endDate.year()}`;
    }

    // Add hour and minute
    if (!startDate.isSame(endDate, 'day')) {
        formatted += ` - ${endDate.format('MMM D')}`;
    }
    formatted += ` ${endDate.format('h:mm a')}`;

    return formatted;
};

export const formatDateTime = (start: string, format: string = 'MMM D h:mm a') => {
    const startDate = dayjs(start);
    const currentYear = dayjs().year();

    let formatted = startDate.format(format);

    // Add year if it's not the current year
    if (startDate.year() !== currentYear) {
        formatted += `, ${startDate.year()}`;
    }

    return formatted;
};


export const makeAbsolute = (uri: string) => {
    return uri.startsWith("http:") || uri.startsWith("https:") || uri.startsWith("//") ? uri : process.env.REACT_APP_API_HOST + uri
}

export function makeRelative(url: string) {
    try {
        const parsedUrl = new URL(url, window.location.origin);
        if (parsedUrl.origin === window.location.origin) {
            return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
        } else {
            return url; // Return the URL unchanged if it's already relative
        }
    } catch (e) {
        console.error("Invalid URL provided:", e);
        return '/'
    }
}

export function makeSocialLink(input: string) {
    const sanitizedInput = input.indexOf('?') > -1 ? input.split('?')[0] : input;
    const parts = sanitizedInput.split('/');

    if (parts.length > 3) {
        return parts.slice(3).join('/');
    }

    return sanitizedInput;
}

export const getModelName = (model: string) => {
    const hasUrl = NAVITEMS.find(nav => {
        return model === nav.type;
    });
    if (hasUrl) return hasUrl.name
    return model

}

export const getUsername = (entity: { [key: string]: any }) => {
    let username = entity.str ? entity.str : getFieldValue(entity, 'username')
    if (username.length > 0) return `@${username.toLowerCase()}`
    return ''
}

export const getFullName = (entity: { [key: string]: any }) => {
    const name = getFieldValue(entity, 'full_name')
    if (name.length > 0) return name
    const first = getFieldValue(entity, 'first_name')
    const last = getFieldValue(entity, 'last_name')
    return `${first} ${last}`.trim()
}

export const getFieldValue = (entity: { [key: string]: any }, field_name: string) => {
    if (entity.username) return entity[field_name]
    if (entity.entity && entity.entity[field_name]) return entity.entity[field_name]
    return ''
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
        mo: 60 * 60 * 24 * 30,  // months
        w: 60 * 60 * 24 * 7,    // weeks
        d: 60 * 60 * 24,        // days
        h: 60 * 60,             // hours
        m: 60,                  // minutes
        s: 1,                   // seconds
    };

    for (const [key, value] of Object.entries(intervals)) {
        const count = Math.floor(seconds / value);
        if (count >= 1) {
            return `${count}${key}`;
        }
    }

    return "0s"; // fallback for less than a second
}

export function isValidUserName(username: string | null) {
    if (!username || username === '') return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{10,15}$/;
    const startsWithUser = /^user/i;

    if (emailRegex.test(username)) {
        return false;
    }

    if (phoneRegex.test(username)) {
        return false;
    }

    if (startsWithUser.test(username)) {
        return false;
    }

    return true;
}
