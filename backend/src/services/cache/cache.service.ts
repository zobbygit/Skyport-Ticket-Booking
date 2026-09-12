/**
 * Minimal in-process TTL cache used for cheap, slow-changing reads
 * (airport info, map points). The get/set/del shape mirrors a Redis
 * client on purpose so this can be swapped for real Redis in production
 * without touching call sites.
 */
type Entry = { value: any; expiresAt: number };

class CacheService {
  private store = new Map<string, Entry>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set(key: string, value: any, ttlSeconds = 60): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  delPrefix(prefix: string): void {
    for (const key of this.store.keys()) if (key.startsWith(prefix)) this.store.delete(key);
  }
}

export const cache = new CacheService();
