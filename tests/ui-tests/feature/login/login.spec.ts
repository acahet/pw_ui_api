import { test } from "@fixtures";
import { expect } from "@playwright/test";

test("login", async ({ page, loginPage, homePage }) => {
	await test.step("GIVEN - I am at the login page", async () => {
		await page.goto("/");
		await expect(page.locator(homePage.selectors.navBar)).toHaveCount(3);
		await homePage.do.goToLoginPage();
	});
	await test.step("WHEN - I add valid credentials", async () => {
		await loginPage.do.compileLoginForm(
			process.env.EMAIL_API!,
			process.env.PASSWORD_API!,
		);
	});

	await test.step("AND - I click signin button", async () => {
		await loginPage.do.signIn();
	});

	await test.step("THEN - I navigate back to home page with signed in nav bar", async () => {
		await expect(page.locator(homePage.selectors.navBar)).toHaveCount(3);
	});
});
