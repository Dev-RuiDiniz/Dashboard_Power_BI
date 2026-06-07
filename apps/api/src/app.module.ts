import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PlatformModule } from './platform/platform.module';
import { ReportsModule } from './reports/reports.module';
import { ValidationTestModule } from './validation-test/validation-test.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    AdminModule,
    AuditModule,
    AuthModule,
    CommonModule,
    HealthModule,
    PermissionsModule,
    PlatformModule,
    ReportsModule,
    ValidationTestModule,
  ],
})
export class AppModule {}
