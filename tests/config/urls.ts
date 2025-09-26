type hostType = Record<string, string>;
const protocol = 'https://';
const host: hostType = {
  en: 'english url',
  br: 'brazilian url',
};
export const baseURL = `${protocol}${host[process.env.LOCALE ?? 'br']}`;
