/**
 * ============================================================
 * VISUAL WORKFLOW E2E TEST
 * Cypress Visual Journey Intelligence
 * ============================================================
 *
 * Executes the full ecommerce journey workflow step-by-step.
 * Each step is tracked, timed, and screenshots are captured.
 * Results are saved to reports/workflow-results.json.
 *
 * Workflow: Visit → Login → Browse → Product → Cart → Checkout → Success
 */

import HomePage     from '../pages/HomePage';
import SearchPage   from '../pages/SearchPage';
import ProductPage  from '../pages/ProductPage';
import CartPage     from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';

// -------------------------------------------------------
// Workflow Definition
// -------------------------------------------------------
const ecommerceWorkflow = [
  {
    id: 'visit',
    icon: '🧑',
    label: 'Visit Site',
    action: 'visitHomePage',
    risk: 'low',
    description: 'Customer visits the e-commerce homepage',
    selector: null,
    value: null
  },
  {
    id: 'login',
    icon: '🔐',
    label: 'Login',
    action: 'loginUser',
    risk: 'medium',
    description: 'Customer logs in with valid credentials',
    selector: '[data-test="username"]',
    value: { username: 'standard_user', password: 'secret_sauce' }
  },
  {
    id: 'browse',
    icon: '🔎',
    label: 'Browse Products',
    action: 'browseProducts',
    risk: 'medium',
    description: 'Customer browses the product catalog',
    selector: '.inventory_list',
    value: null
  },
  {
    id: 'product',
    icon: '📦',
    label: 'Open Product',
    action: 'openFirstProduct',
    risk: 'medium',
    description: 'Customer opens the first available product',
    selector: '.inventory_item_name',
    value: null
  },
  {
    id: 'cart',
    icon: '🛒',
    label: 'Add To Cart',
    action: 'addToCart',
    risk: 'high',
    description: 'Customer adds the selected product to cart',
    selector: '[data-test^="add-to-cart"]',
    value: null
  },
  {
    id: 'viewcart',
    icon: '👜',
    label: 'View Cart',
    action: 'viewCart',
    risk: 'high',
    description: 'Customer views the shopping cart',
    selector: '.shopping_cart_link',
    value: null
  },
  {
    id: 'checkout',
    icon: '💳',
    label: 'Checkout',
    action: 'proceedToCheckout',
    risk: 'critical',
    description: 'Customer proceeds through checkout flow',
    selector: '[data-test="checkout"]',
    value: { firstName: 'John', lastName: 'Doe', zip: '10001' }
  },
  {
    id: 'success',
    icon: '✅',
    label: 'Order Success',
    action: 'verifyOrderSuccess',
    risk: 'critical',
    description: 'Order is confirmed and placed successfully',
    selector: '.complete-header',
    value: null
  }
];

// -------------------------------------------------------
// Step Action Registry
// -------------------------------------------------------
function executeStepAction(step) {
  switch (step.action) {
    case 'visitHomePage':
      HomePage.visit();
      break;

    case 'loginUser':
      HomePage.login(step.value.username, step.value.password);
      break;

    case 'browseProducts':
      SearchPage.verifyInventoryLoaded();
      SearchPage.verifyPageTitle();
      break;

    case 'openFirstProduct':
      ProductPage.openFirstProduct();
      break;

    case 'addToCart':
      ProductPage.addToCart();
      break;

    case 'viewCart':
      CartPage.viewCart();
      break;

    case 'proceedToCheckout':
      CartPage.proceedToCheckout();
      CheckoutPage.fillCheckoutInfo(
        step.value.firstName,
        step.value.lastName,
        step.value.zip
      );
      CheckoutPage.verifyOrderOverview();
      CheckoutPage.finishOrder();
      break;

    case 'verifyOrderSuccess':
      CheckoutPage.verifyOrderSuccess();
      break;

    default:
      throw new Error(`Unknown action: ${step.action}`);
  }
}

// -------------------------------------------------------
// Main Test Suite
// -------------------------------------------------------
describe('Visual Journey Intelligence — E-Commerce Workflow', () => {
  const results = [];
  let stepStartTime = 0;
  let currentStepIndex = 0;

  before(() => {
    cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    cy.log('🚀 CYPRESS VISUAL JOURNEY INTELLIGENCE');
    cy.log(`📋 Workflow: ${ecommerceWorkflow.length} steps`);
    cy.log(`🌐 Base URL: ${Cypress.config('baseUrl')}`);
    cy.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  after(() => {
    // Save all results after the suite completes
    cy.task('saveResults', results).then(() => {
      cy.log('📊 Results saved → reports/workflow-results.json');
    });
  });

  // Generate one test per workflow step
  ecommerceWorkflow.forEach((step, index) => {
    it(`${step.icon} Step ${index + 1}/${ecommerceWorkflow.length}: ${step.label} [Risk: ${step.risk.toUpperCase()}]`, () => {

      cy.log(`▶️  Executing: ${step.icon} ${step.label}`);

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
        selector: step.selector,
        domSnapshot: null,
        executedAt: new Date().toISOString()
      };

      const startAt = Date.now();

      // Execute the step action
      cy.wrap(null).then(() => {
        executeStepAction(step);
      });

      // Capture URL after step
      cy.url().then((url) => {
        stepResult.url = url;
      });

      // Take screenshot
      cy.screenshot(`step_${step.id}`, { capture: 'viewport' });

      // Finalize result
      cy.then(() => {
        stepResult.status = 'passed';
        stepResult.duration = Date.now() - startAt;
        stepResult.screenshot = `cypress/screenshots/visualWorkflow.cy.js/step_${step.id}.png`;
        results[index] = stepResult;
        cy.log(`✅ Passed: ${step.icon} ${step.label} (${stepResult.duration}ms)`);
      });
    });
  });

  // Standalone story report test
  it('📖 Generate Story Mode Report', () => {
    cy.task('log', '📖 Generating Story Mode Report...');

    // Print workflow summary to Cypress log
    cy.wrap(ecommerceWorkflow).each((step) => {
      cy.log(`${step.icon} ${step.label} → Risk: ${step.risk}`);
    });

    cy.log(
      `Journey: ${ecommerceWorkflow.map(s => s.icon + ' ' + s.label).join(' → ')}`
    );
  });
});
