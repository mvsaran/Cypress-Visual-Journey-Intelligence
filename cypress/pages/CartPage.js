/**
 * ============================================================
 * CART PAGE OBJECT
 * Cypress Visual Journey Intelligence
 * ============================================================
 */

class CartPage {
  /**
   * Selectors
   */
  get cartIcon()         { return cy.get('.shopping_cart_link'); }
  get cartItems()        { return cy.get('.cart_item'); }
  get cartItemName()     { return cy.get('.inventory_item_name'); }
  get cartItemPrice()    { return cy.get('.inventory_item_price'); }
  get checkoutButton()   { return cy.get('[data-test="checkout"]'); }
  get continueShopBtn()  { return cy.get('[data-test="continue-shopping"]'); }
  get removeItemButton() { return cy.get('[data-test^="remove"]'); }
  get pageTitle()        { return cy.get('[data-test="title"]'); }
  get cartQuantity()     { return cy.get('.cart_quantity'); }

  /**
   * Navigate to cart page
   */
  viewCart() {
    this.cartIcon.click();
    cy.url().should('include', '/cart.html');
    this.pageTitle.should('contain.text', 'Your Cart');
    cy.log('✅ [CartPage] Navigated to cart successfully');
    return this;
  }

  /**
   * Verify item exists in cart
   * @param {string} productName
   */
  verifyItemInCart(productName) {
    this.cartItemName.should('contain.text', productName);
    cy.log(`✅ [CartPage] Item "${productName}" found in cart`);
    return this;
  }

  /**
   * Get cart item count
   */
  getCartItemCount() {
    return this.cartItems.its('length');
  }

  /**
   * Remove item from cart
   */
  removeFirstItem() {
    this.removeItemButton.first().click();
    cy.log('✅ [CartPage] Removed first item from cart');
    return this;
  }

  /**
   * Proceed to checkout
   */
  proceedToCheckout() {
    this.checkoutButton.click();
    cy.url().should('include', '/checkout-step-one.html');
    cy.log('✅ [CartPage] Proceeded to checkout');
    return this;
  }

  /**
   * Continue shopping
   */
  continueShopping() {
    this.continueShopBtn.click();
    cy.url().should('include', '/inventory.html');
    return this;
  }
}

module.exports = new CartPage();
