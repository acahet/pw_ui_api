import { Page } from '@playwright/test';

export class Homepage {
  constructor(private readonly page: Page) {
    this.page = page;
  }
}
