import { Module } from '@nestjs/common';

import { SqlServerService } from './sql-server.service';

@Module({
  providers: [SqlServerService],
  exports: [SqlServerService],
})
export class SqlServerModule {}
