import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditLogsRepository } from './repositories/audit-logs.repository';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [AuditController],
  providers: [AuditService, AuditLogsRepository],
  exports: [AuditService, AuditLogsRepository],
})
export class AuditModule {}
