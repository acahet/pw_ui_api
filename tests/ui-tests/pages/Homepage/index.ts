import { Page } from '@playwright/test';

class Selectors {
  navBar = 'ul[class*="navbar-nav"] li';
  loginBtn = 'a[routerlink="/login"]';
}

class Actions {
  constructor(
    private readonly page: Page,
    private selectors: Selectors,
  ) {
    this.page = page;
    this.selectors = selectors;
  }

  async goToLoginPage(): Promise<void> {
    await this.page.locator(this.selectors.loginBtn).click();
  }
  async clickLoginBtn(): Promise<void> {
    await this.page.locator(this.selectors.loginBtn).click();
  }
}
export class HomePage {
  readonly selectors = new Selectors();
  readonly do: Actions;
  constructor(private readonly page: Page) {
    this.do = new Actions(this.page, this.selectors);
  }
}
