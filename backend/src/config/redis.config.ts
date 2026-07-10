import type { ConnectionOptions } from 'bullmq';

/**
 * Parses REDIS_URL into a plain options object rather than constructing our
 * own ioredis client instance. BullMQ bundles its own internal copy of
 * ioredis, and passing an instance created from the top-level `ioredis`
 * dependency trips a structural type mismatch between the two copies —
 * a plain options object satisfies BullMQ's ConnectionOptions without that
 * conflict, and BullMQ manages the underlying client lifecycle itself.
 */
export function parseRedisConnection(url: string): ConnectionOptions {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    tls: parsed.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
  };
}
