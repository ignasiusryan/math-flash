// Bucket intervals in milliseconds
const BUCKET_INTERVALS = [
  0,                    // Bucket 0: immediate
  60 * 1000,            // Bucket 1: 1 minute
  10 * 60 * 1000,       // Bucket 2: 10 minutes
  24 * 60 * 60 * 1000,  // Bucket 3: 1 day
  3 * 24 * 60 * 60 * 1000, // Bucket 4: 3 days
];

const MAX_BUCKET = 4;

// Weights for card selection: lower buckets have higher priority
const BUCKET_WEIGHTS = [5, 4, 3, 2, 1];

export function getNextBucket(currentBucket: number, correct: boolean): number {
  if (!correct) return 0;
  return Math.min(currentBucket + 1, MAX_BUCKET);
}

export function getNextReviewDate(bucket: number): Date {
  return new Date(Date.now() + BUCKET_INTERVALS[bucket]);
}

export interface CardCandidate {
  factKey: string;
  bucket: number;
  lastSeen: Date | null;
}

// Select a card using weighted random from eligible candidates
export function selectCard(
  candidates: CardCandidate[],
  recentlyShown: string[] = []
): CardCandidate | null {
  // Filter out recently shown
  let pool = candidates.filter((c) => !recentlyShown.includes(c.factKey));
  if (pool.length === 0) pool = candidates;
  if (pool.length === 0) return null;

  // Weighted random selection
  const totalWeight = pool.reduce((sum, c) => sum + BUCKET_WEIGHTS[c.bucket], 0);
  let random = Math.random() * totalWeight;

  for (const candidate of pool) {
    random -= BUCKET_WEIGHTS[candidate.bucket];
    if (random <= 0) return candidate;
  }

  return pool[0];
}

// Pick random ordering for display
export function randomOrdering(a: number, b: number): { first: number; second: number } {
  if (a === b) return { first: a, second: b };
  return Math.random() < 0.5 ? { first: a, second: b } : { first: b, second: a };
}
