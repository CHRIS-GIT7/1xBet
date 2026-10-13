// Lightweight in-memory rate limiter — adequate for a single-instance sample build.
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  if (buckets.size > 5000) buckets.clear();
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

/** Extract a best-effort client IP from forwarded headers. */
export function clientKey(forwardedFor: string | null): string {
  return forwardedFor?.split(",")[0]?.trim() || "local";
}
