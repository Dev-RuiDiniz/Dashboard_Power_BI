import { Injectable } from '@nestjs/common';

import { AuditLogsRepository } from './repositories/audit-logs.repository';
import { CreateAuditLogInput, AuditLogFilter } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  async log(input: CreateAuditLogInput) {
    return this.auditLogsRepository.create(input);
  }

  async list(filter?: AuditLogFilter, limit = 100) {
    return this.auditLogsRepository.findAll(filter, limit);
  }

  async getById(id: string) {
    return this.auditLogsRepository.findById(id);
  }
}
