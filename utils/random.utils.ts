import { faker } from '@faker-js/faker';

// ==========================================
// 🏛️ CORE UTILS
// ==========================================

export const createRandom = () => {
  const currentSeed = _getEnvSeed() || _generateSeed();

  process.env.TEST_SEED = currentSeed;

  const rng = _initSeededRNG(currentSeed);

  const seedNum = currentSeed.split('').reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);

  faker.seed(seedNum);

  return {
    seed: currentSeed,

    /** Generates random basket of N items from pool of max */
    basket: (count: number = 3, max: number = 5): number[] => {
      const pool = Array.from({ length: max + 1 }, (_, i) => i);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [pool[j], pool[i]] = [pool[i], pool[j]];
      }
      return pool.slice(0, count);
    },

    /** Picks random item from array or generates target from max */
    target: (input: number | number[] = 5): number => {
      if (Array.isArray(input)) {
        const randomIndex = Math.floor(rng() * input.length);
        return input[randomIndex];
      }
      return Math.floor(rng() * (input + 1));
    },
  };
};

// ==========================================
// 🏛️ PRIVATE HELPERS
// ==========================================

function _getEnvSeed(): string | null {
  return process.env.TEST_SEED?.trim().toUpperCase().slice(0, 4) || null;
}

function _generateSeed(): string {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function _initSeededRNG(seedStr: string): () => number {
  let seedNum = seedStr.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);

  return () => {
    let t = (seedNum += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
