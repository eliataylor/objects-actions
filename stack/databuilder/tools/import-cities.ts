import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { WorldBuilder } from '../src/WorldBuilder';
import ApiClient from '../src/ApiClient';
import { Faker, en } from '@faker-js/faker';
import geoLookups from '../data/geo-lookups.json';
import { Users } from "../src/types";

dotenv.config();

const faker = new Faker({
    locale: [en],
});

interface CityCSVData {
    SUMLEV: string;
    STATE: string;
    COUNTY: string;
    PLACE: string;
    COUSUB: string;
    CONCIT: string;
    PRIMGEO_FLAG: string;
    FUNCSTAT: string;
    NAME: string;
    STNAME: string;
    CENSUS2010POP: string;
    ESTIMATESBASE2010: string;
    POPESTIMATE2010: string;
    POPESTIMATE2011: string;
    POPESTIMATE2012: string;
    POPESTIMATE2013: string;
    POPESTIMATE2014: string;
    POPESTIMATE2015: string;
    POPESTIMATE2016: string;
    POPESTIMATE2017: string;
    POPESTIMATE2018: string;
    POPESTIMATE2019: string;
}

interface StateData {
    name: string;
    id?: number;
    website?: string;
}

interface CityData {
    name: string;
    description?: string;
    postal_address: string;
    population?: number;
    county?: string;
    state_id?: number;
    timezone?: string;
}

async function importCities(csvFilePath: string) {
    console.log(`Starting city import from ${csvFilePath}`);

    // Initialize API client and WorldBuilder
    const apiClient = new ApiClient();
    const builder = new WorldBuilder();

    // Login to get authenticated
    const loginResponse = await apiClient.login(process.env.REACT_APP_LOGIN_EMAIL!, process.env.REACT_APP_LOGIN_PASS!)
    if (loginResponse.success) {
        console.log(`Login successful: ${loginResponse.data.data.user.username} with cookie ${loginResponse.cookie}`);
    } else {
        return console.error('Login failed:', loginResponse.error);
    }

    // Read and parse CSV
    const fileContent = fs.readFileSync(path.resolve(csvFilePath), 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    }) as CityCSVData[];

    console.log(`Found ${records.length} records in CSV`);

    // Create a map to track states we've already processed
    const stateMap = new Map<string, StateData>();

    // Process each record
    for (const record of records) {
        try {
            // Check if we've already processed this state, if not create it
            if (!stateMap.has(record.STNAME)) {
                const stateData: StateData = {
                    name: record.STNAME,
                    website: `https://${record.STNAME.toLowerCase().replace(/\s+/g, '')}.gov`
                };

                // Create state in the database
                const stateResponse = await apiClient.post('/api/states', stateData);

                if (stateResponse.success && stateResponse.data && stateResponse.data.id) {
                    stateMap.set(record.STNAME, {
                        ...stateData,
                        id: stateResponse.data.id
                    });

                    console.log(`Created state: ${record.STNAME} with ID: ${stateResponse.data.id}`);
                } else {
                    console.error(`Failed to create state ${record.STNAME}:`, stateResponse.error);
                    continue;
                }
            }

            // Now create the city
            const state = stateMap.get(record.STNAME)!;

            const population = parseInt(record.POPESTIMATE2019, 10) ||
                               parseInt(record.POPESTIMATE2018, 10) ||
                               parseInt(record.CENSUS2010POP, 10);

            // Get descriptions for SUMLEV and FUNCSTAT codes
            const sumlevDescription = getSumlevDescription(record.SUMLEV);
            const funcstatDescription = getFuncstatDescription(record.FUNCSTAT);

            // Generate some reasonable values for fields not in the CSV
            const cityData: CityData = {
                name: record.NAME,
                description: `${record.NAME} is a ${sumlevDescription} located in ${record.COUNTY} County, ${record.STNAME}. It is currently an ${funcstatDescription} (SUMLEV: ${record.SUMLEV}, FUNCSTAT: ${record.FUNCSTAT}).`,
                postal_address: `${record.NAME}, ${record.STNAME}`,
                population: population,
                county: record.COUNTY,
                state_id: state.id,
                timezone: getTimezoneForState(record.STNAME),
            };

            // Create city in the database
            const formData = await prepareFormData(cityData, builder);
            const cityResponse = await apiClient.post('/api/cities', formData.formData, formData.headers);

            if (cityResponse.success) {
                console.log(`Created city: ${record.NAME}, ${record.STNAME} with ID: ${cityResponse.data.id}`);
            } else {
                console.error(`Failed to create city ${record.NAME}:`, cityResponse.error);
            }
        } catch (error) {
            console.error(`Error processing record for ${record.NAME}:`, error);
        }
    }

    console.log('City import completed');
}

async function prepareFormData(cityData: CityData, builder: WorldBuilder) {
    // Add some additional realistic data
    const enhancedCityData = {
        ...cityData,
        picture: {
            stream: `https://picsum.photos/seed/${cityData.name.replace(/\s+/g, '')}/800/600`,
            filename: `${cityData.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
        },
        cover_photo: {
            stream: `https://picsum.photos/seed/${cityData.name.replace(/\s+/g, '')}-cover/1200/400`,
            filename: `${cityData.name.toLowerCase().replace(/\s+/g, '-')}-cover.jpg`
        },
        website: `https://www.${cityData.name.toLowerCase().replace(/\s+/g, '')}.gov`,
        land_area: faker.number.int({ min: 10, max: 500 }),
        water_area: faker.number.int({ min: 0, max: 100 }),
        density: cityData.population ? Math.floor(cityData.population / faker.number.int({ min: 5, max: 50 })) : undefined,
        hasImage: true
    };

    // Use the WorldBuilder to prepare form data with proper headers
    return await builder.serializePayload(enhancedCityData);
}

/**
 * Maps SUMLEV codes to human-readable descriptions
 */
function getSumlevDescription(sumlev: string): string {
    return geoLookups.sumlevCodes[sumlev] || 'Geographic Entity';
}

/**
 * Maps FUNCSTAT codes to human-readable descriptions
 */
function getFuncstatDescription(funcstat: string): string {
    return geoLookups.funcstatCodes[funcstat] || 'Entity of Unknown Status';
}

/**
 * Gets the appropriate timezone for a state
 */
function getTimezoneForState(stateName: string): string {
    // Check special cases first
    if (stateName in geoLookups.timeZonesByRegion.other) {
        return geoLookups.timeZonesByRegion.other[stateName];
    }

    // Check regional groups
    if (geoLookups.timeZonesByRegion.eastCoast.includes(stateName)) {
        return geoLookups.timeZonesByRegion.defaultZones.eastCoast;
    }

    if (geoLookups.timeZonesByRegion.central.includes(stateName)) {
        return geoLookups.timeZonesByRegion.defaultZones.central;
    }

    if (geoLookups.timeZonesByRegion.mountain.includes(stateName)) {
        return geoLookups.timeZonesByRegion.defaultZones.mountain;
    }

    if (geoLookups.timeZonesByRegion.pacific.includes(stateName)) {
        return geoLookups.timeZonesByRegion.defaultZones.pacific;
    }

    // Default fallback
    return geoLookups.timeZonesByRegion.defaultZones.default;
}

// Allow running from command line
// ES Module version - using import.meta.url instead of require.main
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

    const csvPath = args.file as string || './data/cities.csv';

    importCities(csvPath)
        .then(() => console.log('Import completed successfully'))
        .catch(error => console.error('Import failed:', error));
}

export { importCities };
