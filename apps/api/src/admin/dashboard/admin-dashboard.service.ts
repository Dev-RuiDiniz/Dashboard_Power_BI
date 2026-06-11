import { Injectable } from '@nestjs/common';

import { AuditService } from '../../audit/audit.service';
import { ExportsService } from '../../platform/exports/exports.service';
import { GroupsRepository } from '../repositories/groups.repository';
import { AdminUsersService } from '../users/admin-users.service';

export type AdminDashboardMetrics = {
  totalUsers: number;
  activeUsers: number;
  totalGroups: number;
  totalExports: number;
  recentActivity: Array<{
    id: string;
    userEmail: string;
    action: string;
    resource: string;
    createdAt: Date;
  }>;
};

@Injectable()
export class AdminDashboardService {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly groupsRepository: GroupsRepository,
    private readonly exportsService: ExportsService,
    private readonly auditService: AuditService,
  ) {}

  async getMetrics(): Promise<AdminDashboardMetrics> {
    const [users, groups, exports, auditLogs] = await Promise.all([
      this.getUsers(),
      this.getGroups(),
      this.getExports(),
      this.getAuditLogs(),
    ]);

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.isActive).length,
      totalGroups: groups.length,
      totalExports: exports.length,
      recentActivity: auditLogs.map((log) => ({
        id: log.id,
        userEmail: log.userEmail ?? '',
        action: log.action,
        resource: log.resource,
        createdAt: log.createdAt,
      })),
    };
  }

  private async getUsers(): Promise<Array<{ isActive: boolean }>> {
    try {
      return await this.adminUsersService.list();
    } catch {
      return [];
    }
  }

  private async getGroups(): Promise<unknown[]> {
    try {
      return await this.groupsRepository.findAll();
    } catch {
      return [];
    }
  }

  private async getExports(): Promise<unknown[]> {
    try {
      // Passa um userId vazio/genérico; o service em memória retorna todos
      return await this.exportsService.listForUser('');
    } catch {
      return [];
    }
  }

  private async getAuditLogs(): Promise<
    Array<{
      id: string;
      userEmail: string | null;
      action: string;
      resource: string;
      createdAt: Date;
    }>
  > {
    try {
      return await this.auditService.list(undefined, 5);
    } catch {
      return [];
    }
  }
}
