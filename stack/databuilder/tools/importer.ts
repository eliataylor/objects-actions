#!/usr/bin/env node

import * as dotenv from "dotenv";
import { existsSync } from "fs";
import { importCharitiesByCsv } from "./charity-importer";
import { importCities } from "./import-cities";

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2);
const options: { [key: string]: string | boolean } = {};

// Define allowed targets
const ALLOWED_TARGETS = [
  "charities",
  "cities"
];

// Validate arguments - only allow --file=/path/to/file.txt and --target=[allowed targets]
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith("--")) {
    const [key, value] = arg.slice(2).split("=");

    if (key === "file" || key === "target") {
      options[key] = value || true;
    } else {
      console.error(`Error: Invalid argument '${key}'. Only --file and --target are allowed.`);
      console.error(`Example: --file=data/sub-est2019_all.csv --target=cities`);
      process.exit(1);
    }
  }
}

// Validate target if provided
if (!options.target || !ALLOWED_TARGETS.includes(options.target)) {
  console.error(`Error: Invalid target '${options.target}'.`);
  console.error(`Allowed targets: ${ALLOWED_TARGETS.join(", ")}`);
  process.exit(1);
}

// Check for required environment variables
if (!process.env.REACT_APP_LOGIN_EMAIL || !process.env.REACT_APP_LOGIN_PASS) {
  console.error("Error: Missing required environment variables. Please set REACT_APP_LOGIN_EMAIL and REACT_APP_LOGIN_PASS.");
  process.exit(1);
}

// Check if data file exists
const dataPath: string = (typeof options.file === 'string') ? `${options.file}` : '';
if (typeof dataPath !== 'string' || !existsSync(dataPath)) {
  console.error(`Error: Data file not found at ${dataPath}`);
  console.error("Please provide a valid file path using --file=/path/to/file.txt or place the file in the default location.");
  process.exit(1);
}

// Import and run the appropriate importer based on target
console.log("CLI Importer");
console.log("====================");
console.log(`Using data file: ${dataPath}`);
console.log(`target type: ${options.target}`);

// Import data based on the target parameter
async function importData() {

  switch (options.target) {
    case "charities":
      await importCharitiesByCsv(dataPath as string);
      break;
    case "cities":
      await importCities(dataPath as string);
      break;
    default:
      console.error(`No implementation for target: ${options.target}`);
      process.exit(1);
  }
}

// Run the import
importData().catch(error => {
  console.error("Import failed:", error);
  process.exit(1);
});
