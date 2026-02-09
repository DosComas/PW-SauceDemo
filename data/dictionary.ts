export type TranslationKey = keyof typeof DICTIONARY;
export type Language = 'en';

type TranslationEntry = Record<Language, string>;
type DictionarySchema = Record<string, TranslationEntry>;

export const DICTIONARY = {
  locale: {
    en: 'en-US',
  },
  storeName: {
    en: 'Swag Labs',
  },
  'auth.username': {
    en: 'Username',
  },
  'auth.password': {
    en: 'Password',
  },
  'auth.login': {
    en: 'Login',
  },
  'auth.logout': {
    en: 'Logout',
  },
  'auth.loginError': {
    en: 'Epic sadface: Username and password do not match any user in this service',
  },
  'auth.lookupError': {
    en: 'Epic sadface: Sorry, this user has been locked out.',
  },
  addToCart: {
    en: 'Add to cart',
  },
  checkout: {
    en: 'Checkout',
  },
  firstName: {
    en: 'First Name',
  },
  lastName: {
    en: 'Last Name',
  },
  zipPostalCode: {
    en: 'Zip/Postal Code',
  },
  finish: {
    en: 'Finish',
  },
  'navBar.openMenu': {
    en: 'Open Menu',
  },
  'auth.logoutInvError': {
    en: "Epic sadface: You can only access '/inventory.html' when you are logged in.",
  },
  'product.sort.nameAZ': {
    en: 'Name (A to Z)',
  },
  'product.sort.nameZA': {
    en: 'Name (Z to A)',
  },
  'product.sort.priceLowHigh': {
    en: 'Price (low to high)',
  },
  'product.sort.priceHighLow': {
    en: 'Price (high to low)',
  },
} satisfies DictionarySchema;
