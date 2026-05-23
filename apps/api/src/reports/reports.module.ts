import { Module } from '@nestjs/common';

import { SqlServerModule } from '../sql-server/sql-server.module';
import { ReportDefinitionsRepository } from './repositories/report-definitions.repository';
import { ReportAuthorizationService } from './report-authorization.service';
import { ReportDefinitionsAdminController } from './report-definitions.admin.controller';
import { ReportDefinitionsService } from './report-definitions.service';
import { ReportsApiService } from './reports-api.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [SqlServerModule],
  controllers: [ReportDefinitionsAdminController, ReportsController],
  providers: [ReportDefinitionsRepository, ReportDefinitionsService, ReportAuthorizationService, ReportsApiService],
  exports: [ReportDefinitionsRepository, ReportDefinitionsService, ReportAuthorizationService, ReportsApiService],
})
export class ReportsModule {}
