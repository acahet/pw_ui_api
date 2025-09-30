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
      const u = await api.path(endpoints.user).getRequest(Status200_Ok);
      console.log(
        u.user.username,
        ' endpoints.profiles(user.username) => ',
        endpoints.profiles(u.user.username),
      );
      await expect(u).shouldMatchSchema('users', 'GET_user', true);
      const profileResponse = await api
        .path(endpoints.profiles(u.user.username))
        .getRequest(Status200_Ok);
      await expect(profileResponse).shouldMatchSchema(
        'profiles',
        'GET_profile',
      );
      expect.soft(profileResponse).toHaveProperty('profile');
    });
  },
);
