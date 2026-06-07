import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SqlServerModule } from '../sql-server/sql-server.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { ReportDefinitionsRepository } from './repositories/report-definitions.repository';
import { ReportAuthorizationService } from './report-authorization.service';
import { ReportDefinitionsAdminController } from './report-definitions.admin.controller';
import { ReportDefinitionsService } from './report-definitions.service';
import { ReportFavoritesService } from './report-favorites.service';
import { ReportsApiService } from './reports-api.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [AuthModule, SqlServerModule, SupabaseModule],
  controllers: [ReportDefinitionsAdminController, ReportsController],
  providers: [
    ReportDefinitionsRepository,
    ReportDefinitionsService,
    ReportAuthorizationService,
    ReportFavoritesService,
    ReportsApiService,
  ],
  exports: [
    ReportDefinitionsRepository,
    ReportDefinitionsService,
    ReportAuthorizationService,
    ReportFavoritesService,
    ReportsApiService,
  ],
})
export class ReportsModule {}
