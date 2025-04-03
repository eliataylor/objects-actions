import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { WorldBuilder } from '../src/WorldBuilder';
import ApiClient from '../src/ApiClient';
import { Faker, en } from '@faker-js/faker';
import { fakeFieldData } from './builder-utils';

dotenv.config();

const faker = new Faker({
    locale: [en],
});

// Load the geo-lookups.json for tax codes
const geoLookupsPath = path.resolve(__dirname, '../data/geo-lookups.json');
const geoLookups = JSON.parse(fs.readFileSync(geoLookupsPath, 'utf8'));

// Define necessary interfaces
interface ResourceData {
    ein: string;
    name: string;
    city: string;
    state: string;
    country: string;
    type: string;
    description?: string;
    postal_address?: string;
    price_ccoin?: number;
    city_id?: number;
    resource_type_id?: number;
}

interface ResourceType {
    id: number;
    name: string;
}

interface City {
    id: number;
    name: string;
    state_id?: number;
}

interface State {
    id: number;
    name: string;
}

/**
 * Gets or creates a resource type for a specific tax code
 * @param apiClient The API client
 * @param taxCode The tax code to create a resource type for
 * @returns The resource type ID
 */
async function getOrCreateResourceType(apiClient: ApiClient, taxCode: string): Promise<number | null> {
    // Get the description for the tax code from the lookups
    const irsTaxExemptCodes = geoLookups.irsTaxExemptCodes || {};

    // Default description if not found
    let taxCodeDescription = irsTaxExemptCodes[taxCode] || `Tax Code ${taxCode}`;

    // Format the resource type name with "IRS: " prefix
    const resourceTypeName = `IRS: ${taxCodeDescription}`;

    // Check if this resource type already exists
    const queryResponse = await apiClient.get(`/api/resource-types?name=${encodeURIComponent(resourceTypeName)}`);

    if (queryResponse.success && queryResponse.data.results && queryResponse.data.results.length > 0) {
        // Resource type already exists, return its ID
        return queryResponse.data.results[0].id;
    }

    // Create a new resource type
    const createResponse = await apiClient.post('/api/resource-types', { name: resourceTypeName });

    if (createResponse.success && createResponse.data && createResponse.data.id) {
        console.log(`Created resource type: ${resourceTypeName} with ID: ${createResponse.data.id}`);
        return createResponse.data.id;
    } else {
        console.error(`Failed to create resource type for ${taxCode}:`, createResponse.error);
        return null;
    }
}

/**
 * Gets or creates a city
 * @param apiClient The API client
 * @param cityName The city name
 * @param stateName The state name
 * @returns The city ID
 */
async function getOrCreateCity(apiClient: ApiClient, cityName: string, stateName: string): Promise<number | null> {
    // First check if the city already exists
    const cityQuery = `/api/cities?name=${encodeURIComponent(cityName)}`;
    const cityResponse = await apiClient.get(cityQuery);

    if (cityResponse.success && cityResponse.data.results && cityResponse.data.results.length > 0) {
        // Filter cities by state if multiple cities with the same name exist
        if (cityResponse.data.results.length > 1 && stateName) {
            const matchingCity = cityResponse.data.results.find((city: any) => {
                if (city.state_id && typeof city.state_id === 'object') {
                    return city.state_id.name === stateName;
                }
                return false;
            });

            if (matchingCity) {
                return matchingCity.id;
            }
        }

        // Return the first city if no specific state match found
        return cityResponse.data.results[0].id;
    }

    // City doesn't exist, find the state ID
    let stateId = null;
    if (stateName) {
        const stateQuery = `/api/states?name=${encodeURIComponent(stateName)}`;
        const stateResponse = await apiClient.get(stateQuery);

        if (stateResponse.success && stateResponse.data.results && stateResponse.data.results.length > 0) {
            stateId = stateResponse.data.results[0].id;
        } else {
            // Create the state if it doesn't exist
            const createStateResponse = await apiClient.post('/api/states', {
                name: stateName,
                website: `https://${stateName.toLowerCase().replace(/\s+/g, '')}.gov`
            });

            if (createStateResponse.success && createStateResponse.data) {
                stateId = createStateResponse.data.id;
                console.log(`Created state: ${stateName} with ID: ${stateId}`);
            }
        }
    }

    // Create the city
    const cityData = {
        name: cityName,
        description: `${cityName} is a city located in ${stateName || 'the United States'}.`,
        postal_address: `${cityName}, ${stateName || 'USA'}`,
        state_id: stateId,
        population: faker.number.int({ min: 5000, max: 1000000 }),
        website: `https://www.${cityName.toLowerCase().replace(/\s+/g, '')}.gov`,
        hasImage: true,
        picture: {
            stream: `https://picsum.photos/seed/${cityName.replace(/\s+/g, '')}/800/600`,
            filename: `${cityName.toLowerCase().replace(/\s+/g, '-')}.jpg`
        },
        cover_photo: {
            stream: `https://picsum.photos/seed/${cityName.replace(/\s+/g, '')}-cover/1200/400`,
            filename: `${cityName.toLowerCase().replace(/\s+/g, '-')}-cover.jpg`
        }
    };

    // Use the WorldBuilder to prepare form data with proper headers
    const builder = new WorldBuilder();
    const { formData, headers } = await builder.serializePayload(cityData);

    // Create the city
    const createCityResponse = await apiClient.post('/api/cities', formData, headers);

    if (createCityResponse.success && createCityResponse.data) {
        console.log(`Created city: ${cityName}, ${stateName} with ID: ${createCityResponse.data.id}`);
        return createCityResponse.data.id;
    } else {
        console.error(`Failed to create city ${cityName}:`, createCityResponse.error);
        return null;
    }
}

/**
 * Imports charitable organizations from the IRS "data-download-pub78.txt" file
 * @param filePath Path to the data-download-pub78.txt file
 */
export async function importCharitiesByCsv(filePath: string) {
    console.log(`Starting charity import from ${filePath}`);

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

    // Resource types cache to minimize API calls
    const resourceTypeCache: Map<string, number> = new Map();

    // Cities cache to minimize API calls
    const cityCache: Map<string, number> = new Map();

    // Create a read stream for the file
    const fileStream = createReadStream(path.resolve(filePath));
    const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    let successCount = 0;
    let errorCount = 0;

    // Process each line
    for await (const line of rl) {
        count++;
        if (count % 100 === 0) {
            console.log(`Processed ${count} entries (success: ${successCount}, errors: ${errorCount})`);
        }

        try {
            // Parse the line
            const parts = line.split('|');
            if (parts.length < 6) {
                console.warn(`Skipping invalid line: ${line}`);
                continue;
            }

            const resourceData: ResourceData = {
                ein: parts[0].trim(),
                name: parts[1].trim(),
                city: parts[2].trim(),
                state: parts[3].trim(),
                country: parts[4].trim(),
                type: parts[5].trim(),
                price_ccoin: faker.number.int({ min: 5, max: 100 })
            };

            // Skip if missing crucial data
            if (!resourceData.name || !resourceData.type) {
                console.warn(`Skipping entry with insufficient data: ${line}`);
                continue;
            }

            // Get or create resource type based on tax code
            let resourceTypeId: number | null = null;
            const cacheKey = resourceData.type;

            if (resourceTypeCache.has(cacheKey)) {
                resourceTypeId = resourceTypeCache.get(cacheKey) || null;
            } else {
                resourceTypeId = await getOrCreateResourceType(apiClient, resourceData.type);
                if (resourceTypeId) {
                    resourceTypeCache.set(cacheKey, resourceTypeId);
                }
            }

            // Get or create city
            let cityId: number | null = null;
            if (resourceData.city && resourceData.state) {
                const cityCacheKey = `${resourceData.city}|${resourceData.state}`;

                if (cityCache.has(cityCacheKey)) {
                    cityId = cityCache.get(cityCacheKey) || null;
                } else {
                    cityId = await getOrCreateCity(apiClient, resourceData.city, resourceData.state);
                    if (cityId) {
                        cityCache.set(cityCacheKey, cityId);
                    }
                }
            }

            // Generate description based on tax code meaning
            const taxCodeMeaning = geoLookups.irsTaxExemptCodes[resourceData.type] || resourceData.type;
            resourceData.description = `${resourceData.name} is a ${taxCodeMeaning} organization`;
            if (resourceData.city && resourceData.state) {
                resourceData.description += ` located in ${resourceData.city}, ${resourceData.state}`;
            }
            resourceData.description += `. EIN: ${resourceData.ein}`;

            // Create postal address
            resourceData.postal_address = `${resourceData.city || ''}, ${resourceData.state || ''}, ${resourceData.country || 'USA'}`.replace(/^, /, '').replace(/, $/, '');

            // Prepare the resource data for submission
            const resourceFormData = {
                title: resourceData.name,
                description_html: resourceData.description,
                postal_address: resourceData.postal_address,
                price_ccoin: resourceData.price_ccoin,
                resource_type: resourceTypeId ? [resourceTypeId] : [],
                cities: cityId ? [cityId] : [],
                image: {
                    stream: `https://picsum.photos/seed/${resourceData.ein}/800/600`,
                    filename: `${resourceData.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
                },
                hasImage: true
            };

            // Use the WorldBuilder to prepare form data with proper headers
            const { formData, headers } = await builder.serializePayload(resourceFormData);

            // Create the resource
            const resourceResponse = await apiClient.post('/api/resources', formData, headers);

            if (resourceResponse.success) {
                console.log(`Created resource: ${resourceData.name} with ID: ${resourceResponse.data.id}`);
                successCount++;
            } else {
                console.error(`Failed to create resource ${resourceData.name}:`, resourceResponse.error);
                errorCount++;
            }
        } catch (error) {
            console.error(`Error processing record:`, error);
            errorCount++;
        }
    }

    console.log(`Charity import completed. Total: ${count}, Success: ${successCount}, Errors: ${errorCount}`);
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

    const csvPath = args.file as string || './data/data-download-pub78.txt';

    importCharitiesByCsv(csvPath)
        .then(() => console.log('Import completed successfully'))
        .catch(error => console.error('Import failed:', error));
}
