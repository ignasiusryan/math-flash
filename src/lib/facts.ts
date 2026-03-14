export interface Fact {
  factKey: string;
  a: number;
  b: number;
  answer: number;
}

// Generate all 55 unique multiplication facts (1x1 through 10x10)
// factKey uses canonical form: smaller number first, e.g. "2x7"
export function getAllFacts(): Fact[] {
  const facts: Fact[] = [];
  for (let a = 1; a <= 10; a++) {
    for (let b = a; b <= 10; b++) {
      facts.push({
        factKey: `${a}x${b}`,
        a,
        b,
        answer: a * b,
      });
    }
  }
  return facts;
}

// Get canonical factKey for any pair
export function getFactKey(a: number, b: number): string {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return `${min}x${max}`;
}

// Parse factKey back to numbers
export function parseFactKey(factKey: string): { a: number; b: number; answer: number } {
  const [a, b] = factKey.split("x").map(Number);
  return { a, b, answer: a * b };
}
