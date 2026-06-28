import { t, CURRENT_ENV } from '@data';

async function globalSetup(): Promise<void> {
  console.log(`> Environment: ${CURRENT_ENV.environment}`);
  console.log(`> Locale: ${t.meta.locale}`);
  console.log(`> Seed: ${process.env.TEST_SEED}`);
}

export default globalSetup;
