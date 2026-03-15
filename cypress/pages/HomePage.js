/**
 * ============================================================
 * HOME PAGE OBJECT
 * Cypress Visual Journey Intelligence
 * ============================================================
 */

class HomePage {
  /**
   * Selectors
   */
  get usernameInput() { return cy.get('[data-test="username"]'); }
  get passwordInput() { return cy.get('[data-test="password"]'); }
  get loginButton()   { return cy.get('[data-test="login-button"]'); }
  get loginError()    { return cy.get('[data-test="error"]'); }
  get pageTitle()     { return cy.get('.login_logo'); }

  /**
   * Navigate to the home page
   */
  visit() {
    cy.visit('/');
    cy.url().should('include', 'saucedemo.com');
    this.pageTitle.should('be.visible');
    cy.log('✅ [HomePage] Visited homepage successfully');
    return this;
  }

  /**
   * Login with given credentials
   * @param {string} username
   * @param {string} password
   */
  login(username = 'standard_user', password = 'secret_sauce') {
    this.usernameInput.clear().type(username);
    this.passwordInput.clear().type(password);
    this.loginButton.click();
    cy.url().should('include', '/inventory.html');
    cy.log(`✅ [HomePage] Logged in as ${username}`);
    return this;
  }

  /**
   * Verify error message is displayed
   */
  verifyLoginError() {
    this.loginError.should('be.visible');
    return this;
  }

  /**
   * Get page title text
   */
  getTitle() {
    return this.pageTitle.invoke('text');
  }
}

module.exports = new HomePage();
