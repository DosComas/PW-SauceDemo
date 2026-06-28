import dotenv from 'dotenv';
import path from 'path';
import { createRandom } from '@utils';
import { getCurrentEnv } from '@data';

dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

export const runSeed = createRandom().seed;
export const runEnv = getCurrentEnv(process.env.ENVIRONMENT);
export const runLanguage = process.env.LANGUAGE;
