import { Module } from '@nestjs/common';

import { SqlServerModule } from '../sql-server/sql-server.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [SqlServerModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
