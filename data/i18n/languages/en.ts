export const en = {
  meta: {
    locale: 'en-US',
    storeName: 'Swag Labs',
  },

  /** Identity Domain: Auth flows */
  identity: {
    username: 'Username',
    password: 'Password',
    login: 'Login',
    header: {
      logout: 'Logout',
      openMenu: 'Open Menu',
    },
    errors: {
      unauthorized: 'Epic sadface: Username and password do not match any user in this service',
      lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
      restricted: "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    },
  },

  /** Catalog Domain: Products & Inventory */
  catalog: {
    addToCart: 'Add to cart',
    remove: 'Remove',
    sort: {
      nameAZ: 'Name (A to Z)',
      nameZA: 'Name (Z to A)',
      priceLowHigh: 'Price (low to high)',
      priceHighLow: 'Price (high to low)',
    },
  },

  /** Purchase Domain: Cart & Checkout flow */
  purchase: {
    cart: {
      checkout: 'Checkout',
    },
    checkout: {
      firstName: 'First Name',
      lastName: 'Last Name',
      zipPostalCode: 'Zip/Postal Code',
      finish: 'Finish',
    },
  },
} as const;
