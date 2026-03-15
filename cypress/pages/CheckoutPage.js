/**
 * ============================================================
 * CHECKOUT PAGE OBJECT
 * Cypress Visual Journey Intelligence
 * ============================================================
 */

class CheckoutPage {
  /**
   * Selectors - Step One
   */
  get firstNameInput()   { return cy.get('[data-test="firstName"]'); }
  get lastNameInput()    { return cy.get('[data-test="lastName"]'); }
  get zipCodeInput()     { return cy.get('[data-test="postalCode"]'); }
  get continueButton()   { return cy.get('[data-test="continue"]'); }
  get cancelButton()     { return cy.get('[data-test="cancel"]'); }
  get errorMessage()     { return cy.get('[data-test="error"]'); }

  /**
   * Selectors - Step Two (Overview)
   */
  get orderSummaryItems() { return cy.get('.cart_item'); }
  get subtotal()          { return cy.get('.summary_subtotal_label'); }
  get tax()               { return cy.get('.summary_tax_label'); }
  get total()             { return cy.get('.summary_total_label'); }
  get finishButton()      { return cy.get('[data-test="finish"]'); }

  /**
   * Selectors - Complete
   */
  get completeHeader()    { return cy.get('.complete-header'); }
  get completeText()      { return cy.get('.complete-text'); }
  get backHomeButton()    { return cy.get('[data-test="back-to-products"]'); }

  /**
   * Fill in checkout information
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} zip
   */
  fillCheckoutInfo(firstName = 'John', lastName = 'Doe', zip = '10001') {
    cy.url().should('include', '/checkout-step-one.html');
    this.firstNameInput.type(firstName);
    this.lastNameInput.type(lastName);
    this.zipCodeInput.type(zip);
    this.continueButton.click();
    cy.url().should('include', '/checkout-step-two.html');
    cy.log('✅ [CheckoutPage] Checkout information submitted');
    return this;
  }

  /**
   * Verify order overview page
   */
  verifyOrderOverview() {
    this.orderSummaryItems.should('have.length.greaterThan', 0);
    this.total.should('be.visible');
    cy.log('✅ [CheckoutPage] Order overview verified');
    return this;
  }

  /**
   * Complete the order
   */
  finishOrder() {
    this.finishButton.click();
    cy.url().should('include', '/checkout-complete.html');
    cy.log('✅ [CheckoutPage] Order finished');
    return this;
  }

  /**
   * Verify order success
   */
  verifyOrderSuccess() {
    this.completeHeader
      .should('be.visible')
      .and('contain.text', 'Thank you for your order');
    cy.log('✅ [CheckoutPage] Order completed successfully!');
    return this;
  }

  /**
   * Get total price text
   */
  getTotalPrice() {
    return this.total.invoke('text');
  }

  /**
   * Go back to home
   */
  backToHome() {
    this.backHomeButton.click();
    cy.url().should('include', '/inventory.html');
    return this;
  }
}

module.exports = new CheckoutPage();
