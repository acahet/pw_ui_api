import { test } from "@fixtures";
import { httpStatus } from "@utils/constants";
import { expect } from "@utils/custom-expect";
import { invalidUser } from "@utils/data-generator";

const userData = invalidUser();

const runTestFor = (title: string, status: number, body: object, schema) => {
	test(`${title}`, async ({ api, endpoints }) => {
		const login = await api
			.path(endpoints.login)
			.body(body)
			.withoutAuth()
			.postRequest(status);
		await expect(login).shouldMatchSchema("users", schema);
	});
};

test.describe(
	"Feature: Login User API",
	{
		annotation: {
			type: "api-user-login",
			description: "Tests for the User Login API endpoint",
		},
		tag: ["@user", "@login"],
	},
	() => {
		test.describe("Negavtive Tests", () => {
			runTestFor(
				"Invalid Login",
				httpStatus.Status403_Forbidden,
				{ ...userData },
				"POST_users_invalid_login",
			);
			runTestFor(
				"Blank Email",
				httpStatus.Status422_Unprocessable_Content,
				{ user: { email: "", password: userData.user.password } },
				"POST_users_blank_email_login",
			);
			runTestFor(
				"Blank Password",
				httpStatus.Status422_Unprocessable_Content,
				{ user: { email: userData.user.email, password: "" } },
				"POST_users_blank_password_login",
			);
		});

		test.describe("Happy Path Test", () => {
			test("Login user", async ({
				api,
				endpoints,
				httpStatus: { Status200_Ok },
			}) => {
				userData.user.email = process.env.EMAIL_API as string;
				userData.user.password = process.env.PASSWORD_API as string;

				const login = await api
					.path(endpoints.login)
					.body({ ...userData })
					.withoutAuth()
					.postRequest(Status200_Ok);
				await expect(login).shouldMatchSchema("users", "POST_users_login");
				expect(login.user).toHaveProperty("token");
				expect(login.user.token.length).toBeGreaterThan(0);
			});
		});
	},
);
