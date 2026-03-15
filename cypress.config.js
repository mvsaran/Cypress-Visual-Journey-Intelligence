const { defineConfig } = require('cypress');
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/commands.js',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1440,
    viewportHeight: 900,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 1,
      openMode: 0
    },
    env: {
      // AI Provider
      AI_PROVIDER: process.env.AI_PROVIDER || 'openai',
      // OpenAI config
      OPENAI_API_KEY:   process.env.OPENAI_API_KEY,
      AI_MODEL:         process.env.AI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o',
      AI_MAX_TOKENS:    process.env.AI_MAX_TOKENS   || '4096',
      AI_TEMPERATURE:   process.env.AI_TEMPERATURE  || '0.7',
      ENABLE_AI_ANALYSIS: process.env.ENABLE_AI_ANALYSIS || 'true',
      BASE_URL: process.env.BASE_URL || 'https://www.saucedemo.com'
    },
    setupNodeEvents(on, config) {
      // Register tasks for Node.js operations from Cypress
      on('task', {
        saveResults(results) {
          const fs = require('fs');
          const path = require('path');
          const dir = path.join(process.cwd(), 'reports');
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(
            path.join(dir, 'workflow-results.json'),
            JSON.stringify(results, null, 2)
          );
          return null;
        },
        saveAiAnalysis(analysis) {
          const fs = require('fs');
          const path = require('path');
          const dir = path.join(process.cwd(), 'reports');
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(
            path.join(dir, 'ai-analysis.json'),
            JSON.stringify(analysis, null, 2)
          );
          return null;
        },
        readResults() {
          const fs = require('fs');
          const path = require('path');
          const filePath = path.join(process.cwd(), 'reports', 'workflow-results.json');
          if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
          }
          return null;
        },
        log(message) {
          console.log(message);
          return null;
        }
      });

      return config;
    }
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'reports/mochawesome',
    overwrite: false,
    html: false,
    json: true
  }
});
