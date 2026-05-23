import { Module } from '@nestjs/common';

import { ReportDefinitionsRepository } from './repositories/report-definitions.repository';
import { ReportDefinitionsAdminController } from './report-definitions.admin.controller';
import { ReportDefinitionsService } from './report-definitions.service';
import { ReportsController } from './reports.controller';

@Module({
  controllers: [ReportDefinitionsAdminController, ReportsController],
  providers: [ReportDefinitionsRepository, ReportDefinitionsService],
  exports: [ReportDefinitionsRepository, ReportDefinitionsService],
})
export class ReportsModule {}
