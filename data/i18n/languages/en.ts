export const en = {
  /** Global Configuration: Locale and Branding */
  meta: {
    locale: 'en-US',
    storeName: 'Swag Labs',
  },

  /** App Shell: Navigation and Global Actions visible throughout the session */
  header: {
    logout: 'Logout',
    openMenu: 'Open Menu',
    about: 'About',
  },
  footer: {
    social: {
      twitter: 'Twitter',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
    },
  },

  /** Authentication: User credentials and login-specific validation messages */
  login: {
    username: 'Username',
    password: 'Password',
    button: 'Login',
    errors: {
      unauthorized: 'Epic sadface: Username and password do not match any user in this service',
      lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
      restricted: "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    },
  },

  /** Product Components: Shared actions available on both PLP and PDP */
  item: {
    addToCart: 'Add to cart',
    remove: 'Remove',
  },

  /** Inventory View: Product Listing Page (PLP) layout and sorting options */
  plp: {
    title: 'Products',
    sort: {
      az: 'Name (A to Z)',
      za: 'Name (Z to A)',
      loHi: 'Price (low to high)',
      hiLo: 'Price (high to low)',
    },
  },

  /** Detail View: Single Product Details Page (PDP) specific navigation */
  pdp: {
    back: 'Back to products',
  },

  /** Shopping Experience: Cart overview and entry point to checkout */
  cart: {
    checkout: 'Checkout',
  },

  /** Transaction Flow: Customer information and order completion */
  checkout: {
    firstName: 'First Name',
    lastName: 'Last Name',
    zip: 'Zip/Postal Code',
    finish: 'Finish',
  },
} as const;
