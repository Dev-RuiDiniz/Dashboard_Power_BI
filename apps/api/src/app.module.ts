import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ReportsModule } from './reports/reports.module';
import { ValidationTestModule } from './validation-test/validation-test.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    AdminModule,
    AuthModule,
    HealthModule,
    ReportsModule,
    ValidationTestModule,
  ],
})
export class AppModule {}
