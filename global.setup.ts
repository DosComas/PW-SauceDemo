import { t } from '@data';

async function globalSetup(): Promise<void> {
  console.log(`> Environment: ${process.env.ENVIRONMENT}`);
  console.log(`> Locale: ${t.meta.locale}`);
  console.log(`> Seed: ${process.env.TEST_SEED}`);
}

export default globalSetup;
