import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ReportsModule } from '../reports/reports.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { ExportsController } from './exports/exports.controller';
import { ExportFileBuilderService } from './exports/export-file-builder.service';
import { ExportJobRunnerService } from './exports/export-job-runner.service';
import { ExportsProcessor } from './exports/exports.processor';
import { ExportsService } from './exports/exports.service';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';

@Module({
  imports: [AuthModule, SupabaseModule, ReportsModule, AuditModule],
  controllers: [
    DashboardController,
    ExportsController,
    NotificationsController,
    SettingsController,
  ],
  providers: [
    DashboardService,
    ExportsService,
    ExportFileBuilderService,
    ExportJobRunnerService,
    ExportsProcessor,
    NotificationsService,
    SettingsService,
  ],
  exports: [ExportsService, NotificationsService],
})
export class PlatformModule {}
