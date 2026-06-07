import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { ExportsController } from './exports/exports.controller';
import { ExportsProcessor } from './exports/exports.processor';
import { ExportsService } from './exports/exports.service';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [
    DashboardController,
    ExportsController,
    NotificationsController,
    SettingsController,
  ],
  providers: [
    DashboardService,
    ExportsService,
    ExportsProcessor,
    NotificationsService,
    SettingsService,
  ],
  exports: [ExportsService, NotificationsService],
})
export class PlatformModule {}
