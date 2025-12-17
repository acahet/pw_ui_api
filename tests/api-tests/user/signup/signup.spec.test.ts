import { test } from "@fixtures";
import { expect } from "@utils/custom-expect";
import { getNewUser } from "@utils/data-generator";

type UsernameError =
	| "" // no error
	| "is too short (minimum is 3 characters)"
	| "is too long (maximum is 20 characters)";

type PasswordError =
	| "" // no error
	| "is too short (minimum is 8 characters)"
	| "is too long (maximum is 20 characters)";

interface UsernameTestCase {
	title: string;
	username: string;
	expectedError?: UsernameError;
}

interface PasswordTestCase {
	title: string;
	password: string;
	expectedError?: PasswordError;
}

const usernameTest: UsernameTestCase[] = [
	{
		title: "too short with 2 characters",
		username: "dd",
		expectedError: "is too short (minimum is 3 characters)",
	},
	{ title: "minimum with 3 characters", username: "ddd" }, // no error, expectedError is undefined
	{ title: "maximum with 20 characters", username: "d".repeat(20) }, // no error, expectedError is undefined
	{
		title: "too long with 21 characters",
		username: "d".repeat(21),
		expectedError: "is too long (maximum is 20 characters)",
	},
];

const passwordTest: PasswordTestCase[] = [
	{
		title: "too short with 7 characters",
		password: "d".repeat(7),
		expectedError: "is too short (minimum is 8 characters)",
	},
	// { title: 'minimum with 8 characters', password: 'd'.repeat(8) }, // no error, expectedError is undefined
	// { title: 'maximum with 20 characters', password: 'd'.repeat(20) }, // no error, expectedError is undefined
	{
		title: "too long with 21 characters",
		password: "d".repeat(21),
		expectedError: "is too long (maximum is 20 characters)",
	},
];
const runTestFor = (
	section: "username" | "password",
	title: string,
	value: string,
	expectedError: string | undefined,
) => {
	const { user } = getNewUser();
	user.email = "invalid_email";
	test(`${title}`, async ({
		api,
		endpoints,
		httpStatus: { Status422_Unprocessable_Content },
	}) => {
		const newUserResponse = await api
			.path(endpoints.users)
			.body({
				user: {
					username: section === "username" ? value : user.username,
					email: user.email,
					password: section === "password" ? value : user.password,
				},
			})
			.withoutAuth()
			.postRequest(Status422_Unprocessable_Content);
		const abs = newUserResponse.errors[section];
		if (expectedError) {
			expect(abs[0]).shouldBeEqual(expectedError);
		} else {
			expect(newUserResponse.errors).not.toHaveProperty(section);
		}
	});
};

test.describe("Feature: Registration API", { tag: ["@registration"] }, () => {
	test.describe("Negative tests: Username ", () => {
		usernameTest.forEach(({ title, username, expectedError }) => {
			runTestFor("username", title, username, expectedError);
		});
	});
	test.describe("Negative tests: Password ", () => {
		passwordTest.forEach(({ title, password, expectedError }) => {
			runTestFor("password", title, password, expectedError);
		});
	});
});
