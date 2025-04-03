import ApiClient from '../src/ApiClient';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import * as dotenv from 'dotenv';

dotenv.config();

interface CharityData {
  taxId: string;
  name: string;
  city: string;
  state: string;
  country: string;
  categories: string[];
}

async function countryCodeLookup(countryName: string): Promise<string> {
  // Simple country code lookup
  const countryMap: {[key: string]: string} = {
    'United States': 'US',
    'Canada': 'CA',
    'Mexico': 'MX',
    // Add more country mappings as needed
  };

  return countryMap[countryName] || 'US'; // Default to US if unknown
}

async function importCharities(DATA_FILE_PATH) {
  const apiClient = new ApiClient();

  // First login to get authorization
  console.log('Logging in...');
  const loginResponse = await apiClient.login(
    process.env.REACT_APP_LOGIN_EMAIL || '',
    process.env.REACT_APP_LOGIN_PASS || ''
  );

  if (!loginResponse.success || !loginResponse.data?.data?.user) {
    console.error('Failed to login as admin');
    return;
  }

  const admin = loginResponse.data.data.user;
  console.log(`Logged in as ${admin.username}`);

  console.log(`Processing text file: ${DATA_FILE_PATH}`);

  // Verify the file exists
  if (!fs.existsSync(DATA_FILE_PATH)) {
    console.error(`File not found: ${DATA_FILE_PATH}`);
    return;
  }

  // Create a reading interface for the text file
  const rl = createInterface({
    input: createReadStream(DATA_FILE_PATH),
    crlfDelay: Infinity
  });

  // Create maps to store unique entities for bulk creation
  const uniqueCities = new Map<string, {
    name: string,
    state: string,
    country: string,
    postalAddress: string,
    stateId?: string
  }>();

  // Get or create required resource types
  const resourceTypeIds = await createOrGetResourceTypes(apiClient, admin);

  // Get or create required states
  const statesMap = await fetchStates(apiClient);

  // Process each line in the text file
  let lineCount = 0;
  let processedCount = 0;

  console.log('Beginning to process charity data...');

  for await (const line of rl) {
    lineCount++;

    // Show progress periodically
    if (lineCount % 1000 === 0) {
      console.log(`Processed ${lineCount} lines...`);
    }

    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const columns = trimmedLine.split('|');
    if (columns.length !== 6) {
      console.warn(`INVALID CHARITY LINE (${columns.length} columns): ${trimmedLine}`);
      continue;
    }

    const [taxId, name, city, state, country, categoriesStr] = columns;

    // Skip lines with empty required fields
    if (!taxId || !name || !city || !state) {
      console.warn(`Skipping record with missing required fields: ${trimmedLine}`);
      continue;
    }

    processedCount++;

    // Add to unique cities map - we'll create them in bulk later
    const cityKey = `${city}|${state}|${country}`;
    if (!uniqueCities.has(cityKey)) {
      const countryCode = country !== 'United States'
        ? await countryCodeLookup(country)
        : 'US';

      const postalAddress = `${city}, ${state}, ${countryCode}`;

      // Try to match with a state from our states collection
      const stateId = statesMap.get(state);

      uniqueCities.set(cityKey, {
        name: city,
        state,
        country,
        postalAddress,
        stateId
      });
    }

    // Create the categories array
    const categories = categoriesStr.split(',').map(code => code.trim()).filter(Boolean);

    // Create the charity as a Resource
    await createCharityResource({
      taxId,
      name,
      city,
      state,
      country,
      categories
    }, resourceTypeIds, apiClient, admin.id);
  }

  // Now create all the unique cities
  await createAllCities(uniqueCities, apiClient, admin.id);

  console.log(`Import completed! Processed ${lineCount} lines, created ${processedCount} charity resources.`);
}

async function fetchStates(apiClient: ApiClient): Promise<Map<string, string>> {
  const statesMap = new Map<string, string>();

  try {
    console.log('Fetching states...');
    const statesResponse = await apiClient.get('/api/states/');

    if (statesResponse?.data?.results && statesResponse.data.results.length > 0) {
      for (const state of statesResponse.data.results) {
        if (state.name) {
          statesMap.set(state.name, state.id);
        }
      }
      console.log(`Loaded ${statesMap.size} states`);
    } else {
      console.warn('No states found in the system');
    }
  } catch (error) {
    console.warn('Could not fetch states:', error);
  }

  return statesMap;
}

async function createOrGetResourceTypes(
  apiClient: ApiClient,
  admin: any
): Promise<Map<string, string>> {
  const resourceTypeIds = new Map<string, string>();

  // Define the resource types we want to ensure exist
  const desiredTypes = ['Charity', 'Non-Profit', '501(c)(3)'];

  try {
    console.log('Fetching resource types...');
    const resourceTypesResponse = await apiClient.get('/api/resource-types/');

    if (resourceTypesResponse?.data?.results && resourceTypesResponse.data.results.length > 0) {
      // Map existing resource types
      for (const type of resourceTypesResponse.data.results) {
        if (type.name) {
          resourceTypeIds.set(type.name.toLowerCase(), type.id);
        }
      }
    }

    // Create any missing types
    for (const typeName of desiredTypes) {
      if (!resourceTypeIds.has(typeName.toLowerCase())) {
        console.log(`Creating resource type: ${typeName}`);

        const resourceTypeEntity = {
          name: typeName,
          author: admin.id
        };

        try {
          const response = await apiClient.post('/api/resource-types/', resourceTypeEntity);

          if (response?.data?.id) {
            resourceTypeIds.set(typeName.toLowerCase(), response.data.id);
          }
        } catch (error) {
          console.error(`Error creating resource type ${typeName}:`, error);
        }
      }
    }

    console.log(`Using ${resourceTypeIds.size} resource types`);
  } catch (error) {
    console.warn('Could not fetch or create resource types:', error);
  }

  return resourceTypeIds;
}

async function createCharityResource(
  charity: CharityData,
  resourceTypeIds: Map<string, string>,
  apiClient: ApiClient,
  authorId: string
) {
  try {
    const countryCode = charity.country !== 'United States'
      ? await countryCodeLookup(charity.country)
      : 'US';

    // Get appropriate resource type IDs
    const typeIds: string[] = [];

    // For demonstration, we'll use the 501(c)(3) type if available
    if (resourceTypeIds.has('501(c)(3)'.toLowerCase())) {
      typeIds.push(resourceTypeIds.get('501(c)(3)'.toLowerCase())!);
    } else if (resourceTypeIds.has('charity'.toLowerCase())) {
      typeIds.push(resourceTypeIds.get('charity'.toLowerCase())!);
    } else if (resourceTypeIds.size > 0) {
      // Use the first available type if our preferred ones don't exist
      typeIds.push(Array.from(resourceTypeIds.values())[0]);
    }

    // Create the resource entity according to your models.py structure
    const resourceEntity = {
      title: charity.name,
      description_html: `
        <p>This is a 501(c)(3) charitable organization.</p>
        <p>Tax ID: ${charity.taxId}</p>
        <p>Location: ${charity.city}, ${charity.state}, ${charity.country}</p>
        <p>IRS Categories: ${charity.categories.join(', ')}</p>
      `,
      postal_address: `${charity.city}, ${charity.state}, ${countryCode}`,
      price_ccoin: 0, // Free resources
      resource_type: typeIds,
      author: authorId
    };

    const response = await apiClient.post('/api/resources/', resourceEntity);

    if (response?.data?.id) {
      return response.data.id;
    }
  } catch (error) {
    console.error(`Error creating charity resource ${charity.name}:`, error);
  }

  return null;
}

async function createAllCities(
  cities: Map<string, {
    name: string,
    state: string,
    country: string,
    postalAddress: string,
    stateId?: string
  }>,
  apiClient: ApiClient,
  authorId: string
) {
  console.log(`Creating ${cities.size} unique cities...`);

  let count = 0;
  let batchSize = 0;

  for (const [key, city] of cities) {
    try {
      // Create a city entity according to your models.py structure
      const cityEntity: any = {
        name: city.name,
        description: `City in ${city.state}, ${city.country}`,
        postal_address: city.postalAddress,
        author: authorId
      };

      // Add state reference if available
      if (city.stateId) {
        cityEntity.state_id = city.stateId;
      }

      // Add some estimated data for required fields
      // In a real implementation, you might want to fetch this data from a different source
      cityEntity.population = Math.floor(Math.random() * 1000000) + 1000;

      const response = await apiClient.post('/api/cities/', cityEntity);

      if (response?.data?.id) {
        count++;
        batchSize++;

        if (batchSize % 10 === 0) {
          console.log(`Created ${count}/${cities.size} cities...`);
          batchSize = 0;
        }
      }
    } catch (error) {
      console.error(`Error creating city ${city.name}:`, error);
    }
  }

  console.log(`Finished creating ${count} cities`);
}

// Main execution
async function importCharitiesByCsv(dataFilePath?: string) {
  try {
    console.log('Starting charity import process...');

    // Override the default path if one is provided
    if (dataFilePath) {
      // Path to the extracted text file - will be overridden by CLI argument if provided
      dataFilePath = path.resolve(__dirname, 'data', 'data-download-pub78.txt');
    }

    await importCharities(dataFilePath);
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Export for CLI use
export { importCharitiesByCsv };
