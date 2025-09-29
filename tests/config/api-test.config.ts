const processENV = process.env.TEST_ENV;
const env = processENV ?? 'qa';

interface CONFIG {
  apiUrl: string;
  userEmail: string;
  userPassword: string;
}
const apiConfig: CONFIG = {
  apiUrl: process.env.API_URL as string,
  userEmail: process.env.EMAIL_API as string,
  userPassword: process.env.PASSWORD_API as string,
};

if (env === 'qa') {
  const userEmail = process.env.EMAIL_API;
  const userPassword = process.env.PASSWORD_API;

  if (!userEmail || !userPassword) {
    throw new Error('Missing required environment variables');
  }

  apiConfig.userEmail = userEmail;
  apiConfig.userPassword = userPassword;
}
if (env === 'prod') {
  apiConfig.userEmail = '';
  apiConfig.userPassword = '';
}

export { apiConfig };
