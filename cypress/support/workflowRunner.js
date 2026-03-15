/**
 * ============================================================
 * WORKFLOW RUNNER - Core execution engine
 * Cypress Visual Journey Intelligence
 * ============================================================
 *
 * Reads a workflow definition and executes each step using
 * mapped Cypress commands. Captures step results including:
 *   - status (passed / failed / skipped)
 *   - execution time
 *   - screenshot path
 *   - error message
 *   - DOM snapshot
 *   - current URL
 */

import HomePage    from '../pages/HomePage';
import SearchPage  from '../pages/SearchPage';
import ProductPage from '../pages/ProductPage';
import CartPage    from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';

// -------------------------------------------------------
// Step action map: workflow action name → Cypress function
// -------------------------------------------------------
const stepActions = {

  visitHomePage: (step) => {
    HomePage.visit();
  },

  loginUser: (step) => {
    const creds = step.value || {};
    HomePage.login(creds.username, creds.password);
  },

  browseProducts: (step) => {
    SearchPage.verifyInventoryLoaded();
    SearchPage.verifyPageTitle();
  },

  openFirstProduct: (step) => {
    ProductPage.openFirstProduct();
  },

  addToCart: (step) => {
    ProductPage.addToCart();
    ProductPage.verifyCartCount(1);
  },

  viewCart: (step) => {
    CartPage.viewCart();
  },

  proceedToCheckout: (step) => {
    CartPage.proceedToCheckout();
    const info = step.value || {};
    CheckoutPage.fillCheckoutInfo(info.firstName, info.lastName, info.zip);
    CheckoutPage.verifyOrderOverview();
    CheckoutPage.finishOrder();
  },

  verifyOrderSuccess: (step) => {
    CheckoutPage.verifyOrderSuccess();
  }

};

// -------------------------------------------------------
// Workflow Runner
// -------------------------------------------------------

/**
 * Execute a full workflow definition
 * @param {Array} workflow  - Array of step objects from workflowData
 */
export const runWorkflow = (workflow) => {
  const results = [];
  let workflowAborted = false;

  cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  cy.log('🚀  CYPRESS VISUAL JOURNEY - Workflow Starting');
  cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  workflow.forEach((step) => {
    // If a critical step failed earlier, skip remaining steps
    if (workflowAborted) {
      results.push(buildSkippedResult(step));
      cy.log(`⏭️  [SKIPPED] ${step.icon} ${step.label}`);
      return;
    }

    cy.log(`▶️  [START] ${step.icon} ${step.label} (Risk: ${step.risk.toUpperCase()})`);

    const startTime = Date.now();

    // Execute step inside a try-catch via cy.then
    cy.wrap(null).then(() => {
      const actionFn = stepActions[step.action];
      if (!actionFn) {
        throw new Error(`No action mapped for: "${step.action}"`);
      }

      const stepResult = {
        step: step.id,
        icon: step.icon,
        label: step.label,
        status: 'running',
        duration: 0,
        screenshot: null,
        error: null,
        url: null,
        risk: step.risk,
        description: step.description,
        domSnapshot: null,
        selector: step.selector || null
      };

      try {
        // Run the actual Cypress commands
        actionFn(step);

        // Capture URL after step
        cy.url().then((url) => {
          stepResult.url = url;
        });

        // Take step screenshot
        const screenshotName = `step_${step.id}`;
        cy.screenshot(screenshotName, { capture: 'viewport' });

        cy.then(() => {
          stepResult.status = 'passed';
          stepResult.duration = Date.now() - startTime;
          stepResult.screenshot = `cypress/screenshots/visualWorkflow.cy.js/${screenshotName}.png`;
          results.push(stepResult);
          cy.log(`✅  [PASSED] ${step.icon} ${step.label} — ${stepResult.duration}ms`);
        });

      } catch (err) {
        // Capture DOM snapshot on failure
        cy.document().then((doc) => {
          stepResult.domSnapshot = doc.body ? doc.body.innerHTML.substring(0, 2000) : '';
        });

        cy.url().then((url) => { stepResult.url = url; });

        const failedScreenshot = `step_${step.id}_FAILED`;
        cy.screenshot(failedScreenshot, { capture: 'viewport' });

        cy.then(() => {
          stepResult.status = 'failed';
          stepResult.duration = Date.now() - startTime;
          stepResult.error = err.message || String(err);
          stepResult.screenshot = `cypress/screenshots/visualWorkflow.cy.js/${failedScreenshot}.png`;
          results.push(stepResult);
          cy.log(`❌  [FAILED] ${step.icon} ${step.label} — ${err.message}`);

          // Abort workflow if critical step fails
          if (step.risk === 'critical' || step.risk === 'high') {
            workflowAborted = true;
          }
        });

        // Re-throw to mark Cypress test as failed
        throw err;
      }
    });
  });

  // Save results to file after all steps
  cy.then(() => {
    cy.task('saveResults', results);
    cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    cy.log(`📊  WORKFLOW COMPLETE — ${results.filter(r => r.status === 'passed').length}/${results.length} steps passed`);
    cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });
};

// -------------------------------------------------------
// Helper: build a "skipped" result object
// -------------------------------------------------------
function buildSkippedResult(step) {
  return {
    step: step.id,
    icon: step.icon,
    label: step.label,
    status: 'skipped',
    duration: 0,
    screenshot: null,
    error: null,
    url: null,
    risk: step.risk,
    description: step.description,
    domSnapshot: null,
    selector: step.selector || null
  };
}

export default runWorkflow;
