import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { WorldBuilder } from '../src/WorldBuilder';
import ApiClient from '../src/ApiClient';
import { Faker, en } from '@faker-js/faker';

dotenv.config();

const faker = new Faker({
    locale: [en],
});

interface MeetingData {
    title: string;
    rally_id?: number;
    meeting_type_id?: number;
    address: string;
    start: Date;
    end: Date;
    agenda_json?: any;
    duration?: number;
    privacy?: number;
    speakers?: number[];
    moderators?: number[];
    sponsors?: number[];
}

interface MeetingType {
    id: number;
    name: string;
}

// A list of common meeting types to create if they don't exist
const DEFAULT_MEETING_TYPES = [
    'In Person',
    'Virtual',
    'Conference',
    'Town Hall',
    'Committee Meeting',
    'Workshop',
    'Public Hearing',
    'Council Meeting',
    'Board Meeting',
    'Community Forum'
];

// Common agenda templates for different meeting types
const AGENDA_TEMPLATES = {
    'In Person': [
        { time: '00:00', duration: 15, title: 'Welcome and Introductions', description: 'Opening remarks and introductions of key attendees' },
        { time: '00:15', duration: 30, title: 'Main Topic Discussion', description: 'Discussion of the primary meeting topic' },
        { time: '00:45', duration: 20, title: 'Q&A Session', description: 'Audience questions and answers' },
        { time: '01:05', duration: 10, title: 'Break', description: 'Short refreshment break' },
        { time: '01:15', duration: 30, title: 'Action Items', description: 'Review of action items and assignments' },
        { time: '01:45', duration: 15, title: 'Closing Remarks', description: 'Summary and closing statements' }
    ],
    'Virtual': [
        { time: '00:00', duration: 10, title: 'Technical Check & Welcome', description: 'Ensure all participants are connected properly' },
        { time: '00:10', duration: 20, title: 'Presentation', description: 'Main presentation of the meeting topic' },
        { time: '00:30', duration: 20, title: 'Discussion', description: 'Group discussion on the presentation' },
        { time: '00:50', duration: 25, title: 'Q&A', description: 'Participant questions via chat or voice' },
        { time: '01:15', duration: 15, title: 'Next Steps', description: 'Plan for follow-up actions and subsequent meetings' }
    ],
    'Conference': [
        { time: '00:00', duration: 25, title: 'Keynote Address', description: 'Opening keynote by the main speaker' },
        { time: '00:25', duration: 40, title: 'Panel Discussion', description: 'Expert panel discussion on the conference theme' },
        { time: '01:05', duration: 20, title: 'Break', description: 'Networking break with refreshments' },
        { time: '01:25', duration: 45, title: 'Breakout Sessions', description: 'Parallel sessions on specific topics' },
        { time: '02:10', duration: 20, title: 'Plenary Session', description: 'Summary of breakout sessions and closing remarks' }
    ],
    'Town Hall': [
        { time: '00:00', duration: 15, title: 'Welcome Address', description: 'Opening remarks by the mayor or council member' },
        { time: '00:15', duration: 30, title: 'Community Updates', description: 'Updates on ongoing community projects and initiatives' },
        { time: '00:45', duration: 60, title: 'Public Comment Period', description: 'Community members voice concerns and questions' },
        { time: '01:45', duration: 15, title: 'Response & Action Items', description: 'Officials respond to concerns and outline next steps' }
    ],
    'default': [
        { time: '00:00', duration: 10, title: 'Opening', description: 'Opening remarks' },
        { time: '00:10', duration: 30, title: 'Main Discussion', description: 'Primary topic discussion' },
        { time: '00:40', duration: 15, title: 'Q&A', description: 'Questions and answers' },
        { time: '00:55', duration: 5, title: 'Closing', description: 'Closing remarks and next steps' }
    ]
};

// Privacy levels
enum PrivacyLevel {
    Public = 0,
    Private = 1,
    Invite_Only = 2
}

/**
 * Gets or creates a meeting type
 * @param apiClient The API client
 * @param typeName The meeting type name
 * @returns The meeting type ID
 */
async function getOrCreateMeetingType(apiClient: ApiClient, typeName: string): Promise<number | null> {
    // Check if this meeting type already exists
    const queryResponse = await apiClient.get(`/api/meeting-types?name=${encodeURIComponent(typeName)}`);

    if (queryResponse.success && queryResponse.data.results && queryResponse.data.results.length > 0) {
        // Meeting type already exists, return its ID
        return queryResponse.data.results[0].id;
    }

    // Create a new meeting type
    const createResponse = await apiClient.post('/api/meeting-types', { name: typeName });

    if (createResponse.success && createResponse.data && createResponse.data.id) {
        console.log(`Created meeting type: ${typeName} with ID: ${createResponse.data.id}`);
        return createResponse.data.id;
    } else {
        console.error(`Failed to create meeting type for ${typeName}:`, createResponse.error);
        return null;
    }
}

/**
 * Gets a random existing rally from the database
 * @param apiClient The API client
 * @returns A random rally ID or null if none exist
 */
async function getRandomRally(apiClient: ApiClient): Promise<number | null> {
    const response = await apiClient.get('/api/rallies');

    if (response.success && response.data.results && response.data.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * response.data.results.length);
        return response.data.results[randomIndex].id;
    }

    return null;
}

/**
 * Gets a random existing city from the database
 * @param apiClient The API client
 * @returns A random city with its data or null if none exist
 */
async function getRandomCity(apiClient: ApiClient): Promise<any | null> {
    const response = await apiClient.get('/api/cities');

    if (response.success && response.data.results && response.data.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * response.data.results.length);
        return response.data.results[randomIndex];
    }

    return null;
}

/**
 * Gets a list of random users from the database to use as speakers, moderators, etc.
 * @param apiClient The API client
 * @param count Number of users to get
 * @returns Array of user IDs
 */
async function getRandomUsers(apiClient: ApiClient, count: number): Promise<number[]> {
    const response = await apiClient.get('/api/users');

    if (response.success && response.data.results && response.data.results.length > 0) {
        // Shuffle the users and take the requested count
        const shuffled = [...response.data.results].sort(() => 0.5 - Math.random());
        const selectedUsers = shuffled.slice(0, Math.min(count, shuffled.length));
        return selectedUsers.map(user => user.id);
    }

    return [];
}

/**
 * Generate a realistic meeting time based on meeting type
 * @param meetingType The type of meeting
 * @returns Object with start and end Date objects
 */
function generateMeetingTime(meetingType: string): { start: Date, end: Date, duration: number } {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + faker.number.int({ min: 3, max: 90 }));

    const start = new Date(futureDate);

    // Set realistic hours based on meeting type
    if (meetingType === 'Virtual') {
        // Virtual meetings often during work hours
        start.setHours(faker.number.int({ min: 9, max: 16 }), faker.number.int({ min: 0, max: 59 }), 0, 0);

        // Virtual meetings tend to be shorter (30 min to 2 hours)
        const durationMinutes = faker.number.int({ min: 30, max: 120 });
        const end = new Date(start);
        end.setMinutes(start.getMinutes() + durationMinutes);

        return { start, end, duration: durationMinutes };
    }
    else if (meetingType === 'Conference') {
        // Conferences often start in morning and last longer
        start.setHours(faker.number.int({ min: 8, max: 10 }), faker.number.int({ min: 0, max: 59 }), 0, 0);

        // Conferences can be quite long (3 to 8 hours)
        const durationMinutes = faker.number.int({ min: 180, max: 480 });
        const end = new Date(start);
        end.setMinutes(start.getMinutes() + durationMinutes);

        return { start, end, duration: durationMinutes };
    }
    else if (meetingType === 'Town Hall') {
        // Town halls often in evenings after work
        start.setHours(faker.number.int({ min: 17, max: 19 }), faker.number.int({ min: 0, max: 59 }), 0, 0);

        // Town halls typically 1.5 to 3 hours
        const durationMinutes = faker.number.int({ min: 90, max: 180 });
        const end = new Date(start);
        end.setMinutes(start.getMinutes() + durationMinutes);

        return { start, end, duration: durationMinutes };
    }
    else {
        // Default for 'In Person' and other meeting types
        start.setHours(faker.number.int({ min: 8, max: 17 }), faker.number.int({ min: 0, max: 59 }), 0, 0);

        // Standard meetings typically 1 to 2 hours
        const durationMinutes = faker.number.int({ min: 60, max: 120 });
        const end = new Date(start);
        end.setMinutes(start.getMinutes() + durationMinutes);

        return { start, end, duration: durationMinutes };
    }
}

/**
 * Generate a realistic agenda JSON based on meeting type and duration
 * @param meetingType The type of meeting
 * @param durationMinutes Total meeting duration in minutes
 * @returns Agenda JSON object
 */
function generateAgendaJson(meetingType: string, durationMinutes: number): any {
    // Get the appropriate template or use default
    const template = AGENDA_TEMPLATES[meetingType] || AGENDA_TEMPLATES['default'];

    // Adjust the template based on the actual meeting duration
    const scaleFactor = durationMinutes / (template.reduce((total, item) => total + item.duration, 0));

    // Create a new agenda with adjusted durations
    const agenda = template.map(item => {
        const adjustedDuration = Math.round(item.duration * scaleFactor);
        return {
            ...item,
            duration: adjustedDuration,
            description: item.description + (faker.datatype.boolean() ? ' ' + faker.lorem.sentence() : '')
        };
    });

    // Update the time fields based on adjusted durations
    let currentMinutes = 0;
    for (let i = 0; i < agenda.length; i++) {
        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;
        agenda[i].time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        currentMinutes += agenda[i].duration;
    }

    return {
        items: agenda,
        notes: faker.datatype.boolean() ? faker.lorem.paragraph() : null
    };
}

/**
 * Generates a meeting title based on meeting type and rally (if available)
 * @param meetingType The type of meeting
 * @param rallyTitle Optional rally title to incorporate
 * @returns Generated meeting title
 */
function generateMeetingTitle(meetingType: string, rallyTitle?: string): string {
    const prefixes = {
        'In Person': ['In-Person', 'On-Site', 'Face-to-Face'],
        'Virtual': ['Virtual', 'Online', 'Remote', 'Digital'],
        'Conference': ['Annual', 'Quarterly', 'Regional', 'National'],
        'Town Hall': ['Community', 'Public', 'Neighborhood', 'City-Wide'],
        'Committee Meeting': ['Committee', 'Working Group', 'Task Force'],
        'Workshop': ['Interactive', 'Hands-on', 'Collaborative'],
        'Public Hearing': ['Public', 'Open', 'Community'],
        'Council Meeting': ['Council', 'Board', 'Executive'],
        'Board Meeting': ['Board', 'Directors', 'Trustees'],
        'Community Forum': ['Community', 'Neighborhood', 'Public']
    };

    const topics = [
        'Planning Session', 'Budget Review', 'Strategic Discussion',
        'Project Update', 'Decision Making', 'Information Session',
        'Progress Review', 'Action Planning', 'Coordination Meeting',
        'Working Session', 'Briefing', 'Status Update'
    ];

    const randomPrefix = prefixes[meetingType] ?
        prefixes[meetingType][Math.floor(Math.random() * prefixes[meetingType].length)] :
        meetingType;

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    if (rallyTitle) {
        // 50% chance to incorporate rally title
        if (faker.datatype.boolean()) {
            return `${randomPrefix} ${meetingType}: ${rallyTitle}`;
        }
    }

    return `${randomPrefix} ${meetingType}: ${randomTopic}`;
}

/**
 * Generate a suitable address for the meeting based on meeting type
 * @param meetingType The type of meeting
 * @param cityData Optional city data to use for location
 * @returns A realistic meeting address
 */
function generateMeetingAddress(meetingType: string, cityData?: any): string {
    if (meetingType === 'Virtual') {
        // Return a Zoom/Teams/Meet link for virtual meetings
        const platforms = ['Zoom', 'Microsoft Teams', 'Google Meet', 'Webex'];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];

        if (platform === 'Zoom') {
            return `https://zoom.us/j/${faker.number.int({ min: 10000000000, max: 99999999999 })}`;
        } else if (platform === 'Microsoft Teams') {
            return `https://teams.microsoft.com/l/meetup-join/${faker.string.uuid()}`;
        } else if (platform === 'Google Meet') {
            return `https://meet.google.com/${faker.string.alphanumeric(3)}-${faker.string.alphanumeric(4)}-${faker.string.alphanumeric(3)}`;
        } else {
            return `https://webex.com/meet/${faker.internet.userName().toLowerCase()}`;
        }
    } else {
        // For physical meetings, generate a realistic address
        let cityName = cityData?.name || faker.location.city();
        let stateName = cityData?.state_id?.str || faker.location.state();

        const venueTypes = {
            'Conference': ['Convention Center', 'Hotel', 'Conference Center'],
            'Town Hall': ['City Hall', 'Community Center', 'Public Library'],
            'Committee Meeting': ['Government Building', 'Office Building', 'Municipal Center'],
            'Workshop': ['Training Center', 'Business Center', 'Education Building'],
            'Public Hearing': ['City Hall', 'Courthouse', 'Government Center'],
            'Council Meeting': ['City Hall', 'Council Chambers', 'Municipal Building'],
            'Board Meeting': ['Corporate Office', 'Headquarters', 'Executive Suite'],
            'Community Forum': ['Community Center', 'Public Library', 'School Auditorium']
        };

        let venueOptions = venueTypes[meetingType] || ['Office Building', 'Business Center', 'Meeting Hall'];
        let venue = venueOptions[Math.floor(Math.random() * venueOptions.length)];

        return `${faker.location.streetAddress()}, ${venue}, ${cityName}, ${stateName}`;
    }
}

/**
 * Imports meetings
 * @param count Number of meetings to create
 */
export async function importMeetings(count: number = 50) {
    console.log(`Starting meeting import, creating ${count} meetings`);

    // Initialize API client and WorldBuilder
    const apiClient = new ApiClient();
    const builder = new WorldBuilder();

    // Login to get authenticated
    const loginResponse = await apiClient.login(process.env.REACT_APP_LOGIN_EMAIL!, process.env.REACT_APP_LOGIN_PASS!);
    if (loginResponse.success) {
        console.log(`Login successful: ${loginResponse.data.data.user.username} with cookie ${loginResponse.cookie}`);
    } else {
        return console.error('Login failed:', loginResponse.error);
    }

    // Create meeting types if they don't exist
    const meetingTypeMap = new Map<string, number>();

    for (const typeName of DEFAULT_MEETING_TYPES) {
        const typeId = await getOrCreateMeetingType(apiClient, typeName);
        if (typeId) {
            meetingTypeMap.set(typeName, typeId);
        }
    }

    console.log(`Created/verified ${meetingTypeMap.size} meeting types`);

    let successCount = 0;
    let errorCount = 0;

    // Create meetings
    for (let i = 0; i < count; i++) {
        try {
            // Choose a random meeting type
            const meetingTypeNames = Array.from(meetingTypeMap.keys());
            const randomMeetingTypeName = meetingTypeNames[Math.floor(Math.random() * meetingTypeNames.length)];
            const meetingTypeId = meetingTypeMap.get(randomMeetingTypeName);

            // Try to get a rally to associate with this meeting (50% chance)
            let rallyId = null;
            let rallyTitle = null;
            if (faker.datatype.boolean()) {
                const randomRallyResponse = await apiClient.get('/api/rallies');
                if (randomRallyResponse.success && randomRallyResponse.data.results && randomRallyResponse.data.results.length > 0) {
                    const randomRally = randomRallyResponse.data.results[Math.floor(Math.random() * randomRallyResponse.data.results.length)];
                    rallyId = randomRally.id;
                    rallyTitle = randomRally.title;
                }
            }

            // Get a random city for location context
            const randomCity = await getRandomCity(apiClient);

            // Generate realistic meeting times
            const { start, end, duration } = generateMeetingTime(randomMeetingTypeName);

            // Generate meeting title
            const title = generateMeetingTitle(randomMeetingTypeName, rallyTitle);

            // Generate address based on meeting type
            const address = generateMeetingAddress(randomMeetingTypeName, randomCity);

            // Generate appropriate agenda
            const agenda = generateAgendaJson(randomMeetingTypeName, duration);

            // Set privacy level
            let privacyLevel = PrivacyLevel.Public;
            if (randomMeetingTypeName === 'Board Meeting' || faker.datatype.boolean(0.2)) {
                privacyLevel = PrivacyLevel.Private;
            } else if (faker.datatype.boolean(0.3)) {
                privacyLevel = PrivacyLevel.Invite_Only;
            }

            // Get random users for different roles
            const speakers = await getRandomUsers(apiClient, faker.number.int({ min: 1, max: 5 }));
            const moderators = await getRandomUsers(apiClient, faker.number.int({ min: 1, max: 3 }));
            const sponsors = randomMeetingTypeName === 'Conference' || faker.datatype.boolean(0.3) ?
                await getRandomUsers(apiClient, faker.number.int({ min: 0, max: 3 })) : [];

            // Prepare meeting data
            const meetingData: MeetingData = {
                title: title,
                meeting_type_id: meetingTypeId || undefined,
                rally_id: rallyId || undefined,
                address: address,
                start: start,
                end: end,
                duration: duration,
                agenda_json: agenda,
                privacy: privacyLevel,
                speakers: speakers,
                moderators: moderators,
                sponsors: sponsors
            };

            // Create the meeting
            const createResponse = await apiClient.post('/api/meetings', meetingData);

            if (createResponse.success) {
                console.log(`Created meeting: ${title} with ID: ${createResponse.data.id}`);
                successCount++;
            } else {
                console.error(`Failed to create meeting ${title}:`, createResponse.error);
                errorCount++;
            }
        } catch (error) {
            console.error(`Error creating meeting:`, error);
            errorCount++;
        }

        // Log progress
        if ((i + 1) % 10 === 0 || i === count - 1) {
            console.log(`Progress: ${i + 1}/${count} (success: ${successCount}, errors: ${errorCount})`);
        }
    }

    console.log(`Meeting import completed. Total: ${count}, Success: ${successCount}, Errors: ${errorCount}`);
}

// Allow running from command line
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
    const args: { [key: string]: string | number } = {};

    for (let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            args[key] = value || 'true';
        }
    }

    const count = parseInt(args.count as string) || 50;

    importMeetings(count)
        .then(() => console.log('Import completed successfully'))
        .catch(error => console.error('Import failed:', error));
}

export { importMeetings }
