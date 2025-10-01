import { Page } from '@playwright/test';

class Actions {
  constructor(private readonly page: Page) {
    this.page = page;
  }

  async compileLoginForm(email: string, password: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'password' }).fill(password);
  }

  async signIn(): Promise<void> {
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}
export class LoginPage {
  readonly do: Actions;
  constructor(private readonly page: Page) {
    this.do = new Actions(this.page);
  }
}
