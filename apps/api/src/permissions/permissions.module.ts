import { Module } from '@nestjs/common';

import { AdminModule } from '../admin/admin.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { SupabaseModule } from '../supabase/supabase.module';
import { PermissionsController } from './permissions.controller';
import { EffectivePermissionsService } from './effective-permissions.service';
import { PermissionsService } from './permissions.service';
import { PermissionsRepository } from './repositories/permissions.repository';

@Module({
  imports: [AuthModule, SupabaseModule, AuditModule, AdminModule],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    PermissionsRepository,
    EffectivePermissionsService,
    PermissionsGuard,
  ],
  exports: [
    PermissionsService,
    PermissionsRepository,
    EffectivePermissionsService,
    PermissionsGuard,
  ],
})
export class PermissionsModule {}
