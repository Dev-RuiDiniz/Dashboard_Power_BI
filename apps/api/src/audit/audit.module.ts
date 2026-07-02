import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PlatformModule } from '../platform/platform.module';
import { AuditController } from './audit.controller';
import { RetentionController } from './retention.controller';
import { AuditService } from './audit.service';
import { RetentionService } from './services/retention.service';
import { AuditLogsRepository } from './repositories/audit-logs.repository';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [AuthModule, SupabaseModule, forwardRef(() => PlatformModule)],
  controllers: [AuditController, RetentionController],
  providers: [AuditService, AuditLogsRepository, RetentionService],
  exports: [AuditService, AuditLogsRepository, RetentionService],
})
export class AuditModule {}
