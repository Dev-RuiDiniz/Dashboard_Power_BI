import { QueryCacheService } from './query-cache.service';

describe('QueryCacheService', () => {
  let service: QueryCacheService;

  beforeEach(() => {
    service = new QueryCacheService({ ttlMs: 1000, maxEntries: 3 });
  });

  it('deve retornar undefined em cache miss', () => {
    expect(service.get('nonexistent')).toBeUndefined();
  });

  it('deve armazenar e retornar dado em cache hit', () => {
    service.set('key-1', { rows: [{ id: 1 }] });
    expect(service.get('key-1')).toEqual({ rows: [{ id: 1 }] });
  });

  it('deve retornar undefined apos TTL expirar', () => {
    service = new QueryCacheService({ ttlMs: 50, maxEntries: 10 });
    service.set('key-1', 'value');
    expect(service.get('key-1')).toBe('value');

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(service.get('key-1')).toBeUndefined();
        resolve();
      }, 60);
    });
  });

  it('deve invalidar entrada individual', () => {
    service.set('key-1', 'value');
    service.invalidate('key-1');
    expect(service.get('key-1')).toBeUndefined();
  });

  it('deve invalidar todas as entradas com invalidateAll', () => {
    service.set('key-1', 'a');
    service.set('key-2', 'b');
    service.invalidateAll();
    expect(service.get('key-1')).toBeUndefined();
    expect(service.get('key-2')).toBeUndefined();
  });

  it('deve fazer LRU eviction quando exceder maxEntries', () => {
    service.set('a', 1);
    service.set('b', 2);
    service.set('c', 3);
    service.get('a');
    service.set('d', 4);

    expect(service.get('a')).toBe(1);
    expect(service.get('b')).toBeUndefined();
    expect(service.get('c')).toBe(3);
    expect(service.get('d')).toBe(4);
  });

  it('deve retornar stats corretas', () => {
    service.set('key-1', 'value');
    service.get('key-1');
    service.get('miss-1');

    const stats = service.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.entries).toBe(1);
  });

  it('deve contar evictions nas stats', () => {
    service.set('a', 1);
    service.set('b', 2);
    service.set('c', 3);
    service.set('d', 4);

    const stats = service.getStats();
    expect(stats.evictions).toBe(1);
  });

  it('deve gerar chave deterministica com buildKey', () => {
    const key1 = QueryCacheService.buildKey('SELECT * FROM vw', { param: 1 }, 'sqlserver');
    const key2 = QueryCacheService.buildKey('SELECT * FROM vw', { param: 1 }, 'sqlserver');
    const key3 = QueryCacheService.buildKey('SELECT * FROM vw', { param: 2 }, 'sqlserver');

    expect(key1).toBe(key2);
    expect(key1).not.toBe(key3);
  });

  it('deve ignorar get/set quando cache desabilitado', () => {
    const disabled = new QueryCacheService({ ttlMs: 60000, maxEntries: 10, enabled: false });
    disabled.set('key-1', 'value');
    expect(disabled.get('key-1')).toBeUndefined();

    const stats = disabled.getStats();
    expect(stats.entries).toBe(0);
    expect(stats.misses).toBe(1);
  });
});
