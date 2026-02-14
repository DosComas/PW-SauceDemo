export type ProductTextFields = {
  name: string;
  desc: string;
  price: string;
};

export const VISUAL_MOCK: { product: ProductTextFields } = {
  product: {
    name: 'Standardized Product',
    price: '$99.99',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
};
