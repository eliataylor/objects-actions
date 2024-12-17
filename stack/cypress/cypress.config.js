const { defineConfig } = require("cypress");

module.exports = defineConfig({
  video: true,
  trashAssetsBeforeRuns:false,
  videoCompression: true,
  baseUrl: process.env.REACT_APP_API_HOST,
  e2e: {
    excludeSpecPattern: 'cypress/e2e/examples',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
