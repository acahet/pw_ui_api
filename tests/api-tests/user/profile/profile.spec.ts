import { test } from '@fixtures';
import { expect } from '@utils/custom-expect';

test.describe(
	'Feature: User Profile API',
	{
		annotation: {
			type: 'api-user-profile',
			description: 'Tests for the User Profile API endpoint',
		},
		tag: ['@user', '@profile'],
	},
	() => {
		test('Get User Profile', async ({
			api,
			endpoints,
			httpStatus: { Status200_Ok },
		}) => {
			const currentUser = await api
				.path(endpoints.user)
				.getRequest(Status200_Ok);

			await expect(currentUser).shouldMatchSchema('users', 'GET_user');
			const profileResponse = await api
				.path(endpoints.profiles(currentUser.user.username as string))
				.getRequest(Status200_Ok);
			await expect(profileResponse).shouldMatchSchema(
				'profiles',
				'GET_profile'
			);
			expect.soft(profileResponse).toHaveProperty('profile');
		});
	}
);
