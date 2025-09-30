import { test } from '@fixtures';
import { expect } from '@utils/custom-expect';
import { invalidUser } from '@utils/data-generator';

let userData = invalidUser();
test.describe(
    'Feature: Login User API',
    {
        annotation: {
            type: 'api-user-login',
            description: 'Tests for the User Login API endpoint',
        },
        tag: ['@user', '@login'],
    },
    () => {
        test('Invalid Login', async ({
            api,
            endpoints,
            httpStatus: { Status403_Forbidden },
        }) => {
            const login = await api
                .path(endpoints.login)
                .body({ ...userData })
                .clearAuth()
                .postRequest(Status403_Forbidden);
            await expect(login).shouldMatchSchema(
                'users',
                'POST_users_invalid_login',
            );
            expect(login).toHaveProperty('errors');
            expect(login.errors['email or password'][0]).shouldBeEqual('is invalid');
        });

        test('Blank Email', async ({
            api,
            endpoints,
            httpStatus: { Status422_Unprocessable_Content },
        }) => {
            userData.user.email = '';
            userData.user.password = process.env.PASSWORD_API as string;
            const login = await api
                .path(endpoints.login)
                .body({ ...userData })
                .clearAuth()
                .postRequest(Status422_Unprocessable_Content);
            await expect(login).shouldMatchSchema('users', 'POST_users_blank_email_login');
            console.log(login);
            expect(login.errors).toHaveProperty('email');
        });

        test('Blank Password', async ({
            api,
            endpoints,
            httpStatus: { Status422_Unprocessable_Content },
        }) => {
            userData.user.email = process.env.EMAIL_API as string;
            userData.user.password = '';
            const login = await api
                .path(endpoints.login)
                .body({ ...userData })
                .clearAuth()
                .postRequest(Status422_Unprocessable_Content);
            await expect(login).shouldMatchSchema(
                'users',
                'POST_users_blank_password_login',
                true,
            );
            expect(login.errors).toHaveProperty('password');
        });

        test('Valid Login', async ({
            api,
            endpoints,
            httpStatus: { Status200_Ok },
        }) => {
            userData.user.email = process.env.EMAIL_API as string;
            userData.user.password = process.env.PASSWORD_API as string;

            const login = await api
                .path(endpoints.login)
                .body({ ...userData })
                .clearAuth()
                .postRequest(Status200_Ok);
            await expect(login).shouldMatchSchema('users', 'POST_users_login');
            expect(login.user).toHaveProperty('token');
            expect(login.user.token.length).toBeGreaterThan(0);
        });
    },
);
