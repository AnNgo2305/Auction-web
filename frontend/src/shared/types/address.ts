export const ADDRESS_TYPE = {
  Home: 'Home',
  Work: 'Work',
  Others: 'Others',
} as const;

export type AddressType = (typeof ADDRESS_TYPE)[keyof typeof ADDRESS_TYPE];
