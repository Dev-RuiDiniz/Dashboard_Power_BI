import { Module } from '@nestjs/common';

import { DatabaseProviderService } from './database-provider.service';
import { OracleService } from './oracle.service';
import { SqlQueryService } from './sql-query.service';
import { SqlServerService } from './sql-server.service';

@Module({
  providers: [SqlServerService, OracleService, DatabaseProviderService, SqlQueryService],
  exports: [SqlServerService, OracleService, DatabaseProviderService, SqlQueryService],
})
export class SqlServerModule {}
