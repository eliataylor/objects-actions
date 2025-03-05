const fs = require('fs')
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  video: true,
  trashAssetsBeforeRuns: false,
  videoCompression: true,
  e2e: {
    baseUrl: "https://localhost.oaexample.com:3000",
    chromeWebSecurity: false,
    experimentalSessionAndOrigin: true,
    excludeSpecPattern: "cypress/e2e/examples",
    setupNodeEvents (on, config) {
      const envFile = "cypress.env.json";
      const fallbackFile = "cypress.public.json";

      let envConfig = {};

      if (fs.existsSync(envFile)) {
        console.log(`Loading environment variables from ${envFile}`);
        envConfig = JSON.parse(fs.readFileSync(envFile, "utf-8"));
      } else if (fs.existsSync(fallbackFile)) {
        console.log(`Warning: ${envFile} not found! Falling back to ${fallbackFile}`);
        envConfig = JSON.parse(fs.readFileSync(fallbackFile, "utf-8"));
      } else {
        console.warn(`Warning: Neither ${envFile} nor ${fallbackFile} found!`);
      }

      config.env = envConfig;
      return config;
    }
  }
});
