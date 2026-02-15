/**
 * Seeded Random Number Generator
 *
 * Uses mulberry32 algorithm for deterministic randomness.
 * This allows instructors to replay scenarios and compare teams.
 */

export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  /**
   * Generate a random number between 0 and 1
   */
  next(): number {
    // mulberry32 algorithm
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate a random integer between min and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate a random number with normal distribution
   * Uses Box-Muller transform
   */
  nextGaussian(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  /**
   * Return true with given probability
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /**
   * Pick a random element from an array
   */
  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  /**
   * Shuffle an array (returns new array)
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Get current state (for serialization)
   */
  getState(): number {
    return this.state;
  }

  /**
   * Reset to a new seed
   */
  reset(seed: number): void {
    this.state = seed;
  }
}

/**
 * Create a seeded RNG from a game state seed
 * Optionally offset by round for different randomness each round
 */
export function createRNG(seed: number, roundOffset: number = 0): SeededRNG {
  // Combine seed with round to get different sequences per round
  // but still deterministic
  return new SeededRNG(seed + roundOffset * 1000000);
}

/**
 * Generate a random seed for new games
 */
export function generateSeed(): number {
  return Math.floor(Math.random() * 2147483647);
}
