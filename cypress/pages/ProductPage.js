/**
 * ============================================================
 * PRODUCT DETAIL PAGE OBJECT
 * Cypress Visual Journey Intelligence
 * ============================================================
 */

class ProductPage {
  /**
   * Selectors
   */
  get firstProductLink()   { return cy.get('.inventory_item_name').first(); }
  get productName()        { return cy.get('[data-test="inventory-item-name"]'); }
  get productDescription() { return cy.get('[data-test="inventory-item-desc"]'); }
  get productPrice()       { return cy.get('[data-test="inventory-item-price"]'); }
  get addToCartButton()    { return cy.get('[data-test^="add-to-cart"]'); }
  get removeButton()       { return cy.get('[data-test^="remove"]'); }
  get backButton()         { return cy.get('[data-test="back-to-products"]'); }
  get cartBadge()          { return cy.get('.shopping_cart_badge'); }

  /**
   * Click on the first product in inventory list
   */
  openFirstProduct() {
    this.firstProductLink.click();
    cy.url().should('include', 'inventory-item');
    this.productName.should('be.visible');
    cy.log('✅ [ProductPage] Opened first product successfully');
    return this;
  }

  /**
   * Open product by name
   * @param {string} productName
   */
  openProductByName(productName) {
    cy.contains('.inventory_item_name', productName).click();
    cy.url().should('include', 'inventory-item');
    cy.log(`✅ [ProductPage] Opened product: ${productName}`);
    return this;
  }

  /**
   * Add product to cart
   */
  addToCart() {
    this.addToCartButton.click();
    this.removeButton.should('be.visible');
    cy.log('✅ [ProductPage] Product added to cart');
    return this;
  }

  /**
   * Get product name text
   */
  getProductName() {
    return this.productName.invoke('text');
  }

  /**
   * Get product price text
   */
  getProductPrice() {
    return this.productPrice.invoke('text');
  }

  /**
   * Verify cart badge count
   * @param {number} count
   */
  verifyCartCount(count = 1) {
    this.cartBadge.should('contain.text', String(count));
    return this;
  }

  /**
   * Go back to products list
   */
  goBackToProducts() {
    this.backButton.click();
    cy.url().should('include', 'inventory.html');
    return this;
  }
}

module.exports = new ProductPage();
