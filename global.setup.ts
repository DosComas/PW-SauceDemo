import { t } from '@data';
import { runSeed, runEnv } from './runtime';

async function globalSetup(): Promise<void> {
  console.log(`> Environment: ${runEnv.name}`);
  console.log(`> Locale: ${t.meta.locale}`);
  console.log(`> Seed: ${runSeed}`);
}

export default globalSetup;
