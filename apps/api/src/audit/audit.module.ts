import { Module } from '@nestjs/common';

import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditLogsRepository } from './repositories/audit-logs.repository';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AuditController],
  providers: [AuditService, AuditLogsRepository],
  exports: [AuditService, AuditLogsRepository],
})
export class AuditModule {}
