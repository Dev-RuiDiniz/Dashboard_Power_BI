import { ConfigService } from '@nestjs/config';

const redisConstructor = jest.fn();
const workerConstructor = jest.fn();

jest.mock('ioredis', () => ({
  __esModule: true,
  default: class RedisMock {
    quit = jest.fn().mockResolvedValue('OK');

    constructor(options: unknown) {
      redisConstructor(options);
    }
  },
}));

jest.mock('bullmq', () => ({
  Worker: class WorkerMock {
    on = jest.fn();
    close = jest.fn().mockResolvedValue(undefined);

    constructor(...args: unknown[]) {
      workerConstructor(...args);
    }
  },
}));

import { ExportsProcessor } from './exports.processor';

describe('ExportsProcessor', () => {
  beforeEach(() => {
    redisConstructor.mockClear();
    workerConstructor.mockClear();
  });

  it('deixa o ioredis conectar automaticamente quando o BullMQ inicia o worker', () => {
    const configService = {
      get: jest.fn((key: string, fallback: unknown) => {
        const values: Record<string, unknown> = {
          EXPORT_WORKER_ENABLED: 'true',
          REDIS_HOST: 'redis',
          REDIS_PORT: 6379,
        };
        return values[key] ?? fallback;
      }),
    } as unknown as ConfigService;

    const processor = new ExportsProcessor(
      configService,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    processor.onModuleInit();

    expect(redisConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'redis',
        port: 6379,
        maxRetriesPerRequest: null,
      }),
    );
    expect(redisConstructor.mock.calls[0]?.[0]).not.toHaveProperty('lazyConnect', true);
    expect(workerConstructor).toHaveBeenCalledTimes(1);
  });
});
