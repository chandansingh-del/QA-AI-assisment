/**
 * Global header / navigation — shared across authenticated and guest sessions.
 */
class AppHeader {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.homeLink = page.getByTestId('nav-home');
    this.signInLink = page.getByTestId('nav-sign-in');
    this.handToolsLink = page.getByTestId('nav-hand-tools');
    this.categoriesButton = page.getByTestId('nav-categories');
    this.accountMenu = page.getByTestId('nav-menu');
    this.myProfileLink = page.getByTestId('nav-my-profile');
    this.myInvoicesLink = page.getByTestId('nav-my-invoices');
    this.signOutLink = page.getByTestId('nav-sign-out');
    this.cartLink = page.getByTestId('nav-cart');
    this.cartQuantityBadge = page.getByTestId('cart-quantity');
  }

  async openAccountMenu() {
    await this.accountMenu.click();
  }

  async goToProfile() {
    await this.openAccountMenu();
    await this.myProfileLink.click();
  }

  async goToInvoices() {
    await this.openAccountMenu();
    await this.myInvoicesLink.click();
  }

  async logout() {
    await this.openAccountMenu();
    await this.signOutLink.click();
  }

  async goToHandTools() {
    await this.handToolsLink.click();
  }

  async goToHome() {
    await this.homeLink.click();
  }

  async goToSignIn() {
    await this.signInLink.click();
  }

  async goToCart() {
    await this.cartLink.click();
  }
}

module.exports = { AppHeader };
