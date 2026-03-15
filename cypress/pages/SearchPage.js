/**
 * ============================================================
 * SEARCH / INVENTORY PAGE OBJECT
 * Cypress Visual Journey Intelligence
 * ============================================================
 */

class SearchPage {
  /**
   * Selectors
   */
  get inventoryContainer() { return cy.get('.inventory_container'); }
  get inventoryItems()     { return cy.get('.inventory_item'); }
  get sortDropdown()       { return cy.get('[data-test="product_sort_container"]'); }
  get inventoryList()      { return cy.get('.inventory_list'); }
  get pageTitle()          { return cy.get('[data-test="title"]'); }

  /**
   * Verify inventory page is loaded
   */
  verifyInventoryLoaded() {
    this.inventoryContainer.should('be.visible');
    this.inventoryList.should('be.visible');
    this.inventoryItems.should('have.length.greaterThan', 0);
    cy.log('✅ [SearchPage] Inventory page loaded successfully');
    return this;
  }

  /**
   * Sort products by given option
   * @param {string} sortOption - 'az', 'za', 'lohi', 'hilo'
   */
  sortProducts(sortOption = 'az') {
    this.sortDropdown.select(sortOption);
    cy.log(`✅ [SearchPage] Products sorted by: ${sortOption}`);
    return this;
  }

  /**
   * Get count of visible products
   */
  getProductCount() {
    return this.inventoryItems.its('length');
  }

  /**
   * Get product by index
   * @param {number} index
   */
  getProductByIndex(index = 0) {
    return this.inventoryItems.eq(index);
  }

  /**
   * Get product names as array
   */
  getProductNames() {
    return cy.get('.inventory_item_name').then(($els) => {
      return [...$els].map(el => el.innerText);
    });
  }

  /**
   * Verify page title
   */
  verifyPageTitle() {
    this.pageTitle.should('contain.text', 'Products');
    return this;
  }
}

module.exports = new SearchPage();
