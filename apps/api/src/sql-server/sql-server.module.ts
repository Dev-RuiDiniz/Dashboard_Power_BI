import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from '../auth/auth.module';
import { DatabaseProviderService } from './database-provider.service';
import { OracleService } from './oracle.service';
import { QueryCacheController } from './query-cache.controller';
import { QueryCacheService } from './query-cache.service';
import { SqlQueryService } from './sql-query.service';
import { SqlServerService } from './sql-server.service';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [QueryCacheController],
  providers: [
    SqlServerService,
    OracleService,
    DatabaseProviderService,
    SqlQueryService,
    {
      provide: QueryCacheService,
      useFactory: (configService: ConfigService) => {
        const enabled = configService.get<string>('QUERY_CACHE_ENABLED') !== 'false';
        const ttlMs = Number(configService.get<string>('QUERY_CACHE_TTL_MS') ?? '60000');
        const maxEntries = Number(configService.get<string>('QUERY_CACHE_MAX_ENTRIES') ?? '100');
        return new QueryCacheService({ ttlMs, maxEntries, enabled });
      },
      inject: [ConfigService],
    },
  ],
  exports: [
    SqlServerService,
    OracleService,
    DatabaseProviderService,
    SqlQueryService,
    QueryCacheService,
  ],
})
export class SqlServerModule {}
