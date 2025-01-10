const { defineConfig } = require("cypress");

module.exports = defineConfig({
  video: true,
  trashAssetsBeforeRuns:false,
  videoCompression: true,
  e2e: {
    baseUrl: 'https://localhost.oaexample.com:3000',
    excludeSpecPattern: 'cypress/e2e/examples',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
