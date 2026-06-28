import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';

export type QueryCacheStats = {
  hits: number;
  misses: number;
  entries: number;
  evictions: number;
};

type CacheEntry = {
  data: unknown;
  expiresAt: number;
  accessOrder: number;
};

type QueryCacheOptions = {
  ttlMs: number;
  maxEntries: number;
  enabled?: boolean;
};

@Injectable()
export class QueryCacheService {
  private readonly logger = new Logger(QueryCacheService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private accessCounter = 0;

  constructor(private readonly options: QueryCacheOptions) {
    this.enabled = options.enabled ?? true;
  }

  private readonly enabled: boolean;

  get<T>(key: string): T | undefined {
    if (!this.enabled) {
      this.misses++;
      return undefined;
    }

    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    entry.accessOrder = ++this.accessCounter;
    this.hits++;
    return entry.data as T;
  }

  set(key: string, data: unknown, ttlMs?: number): void {
    if (!this.enabled) {
      return;
    }

    if (this.cache.size >= this.options.maxEntries && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs ?? this.options.ttlMs),
      accessOrder: ++this.accessCounter,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  getStats(): QueryCacheStats {
    this.purgeExpired();
    return {
      hits: this.hits,
      misses: this.misses,
      entries: this.cache.size,
      evictions: this.evictions,
    };
  }

  static buildKey(query: string, params: Record<string, unknown>, provider: string): string {
    const payload = `${provider}:${query}:${JSON.stringify(params)}`;
    return createHash('sha256').update(payload).digest('hex');
  }

  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestOrder = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.accessOrder < oldestOrder) {
        oldestOrder = entry.accessOrder;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.evictions++;
    }
  }

  private purgeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}
