import { Module } from '@nestjs/common';

import { SqlQueryService } from './sql-query.service';
import { SqlServerService } from './sql-server.service';

@Module({
  providers: [SqlServerService, SqlQueryService],
  exports: [SqlServerService, SqlQueryService],
})
export class SqlServerModule {}
