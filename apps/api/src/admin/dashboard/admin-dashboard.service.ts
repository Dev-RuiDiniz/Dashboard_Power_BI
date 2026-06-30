import { Injectable } from '@nestjs/common';

import { AuditService } from '../../audit/audit.service';
import { SectorCode } from '../../auth/types/auth.types';
import { ExportsService, ExportJobRecord } from '../../platform/exports/exports.service';
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

export type AdminDashboardTrends = {
  usersByMonth: Array<{ month: string; count: number }>;
  activityByWeek: Array<{ week: string; count: number }>;
  exportsByWeek: Array<{ week: string; count: number }>;
  topReports: Array<{ reportId: string; count: number }>;
  topSectors: Array<{ sector: string; count: number }>;
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

  async getTrends(): Promise<AdminDashboardTrends> {
    const [users, exports, auditLogs] = await Promise.all([
      this.getUsers(),
      this.getExports(),
      this.auditService.list(undefined, 500),
    ]);

    return {
      usersByMonth: this.aggregateUsersByMonth(users),
      activityByWeek: this.aggregateByWeek(auditLogs.map((l) => l.createdAt)),
      exportsByWeek: this.aggregateByWeek(exports.map((e) => new Date(e.created_at))),
      topReports: this.aggregateTopReports(auditLogs),
      topSectors: this.aggregateTopSectors(auditLogs, users),
    };
  }

  private async getUsers(): Promise<
    Array<{ id: string; isActive: boolean; createdAt: Date; sectors: SectorCode[] }>
  > {
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

  private async getExports(): Promise<ExportJobRecord[]> {
    try {
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

  private aggregateUsersByMonth(
    users: Array<{ createdAt: Date }>,
  ): Array<{ month: string; count: number }> {
    const now = new Date();
    const months: Array<{ month: string; count: number }> = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ month: key, count: 0 });
    }

    for (const user of users) {
      const d = user.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = months.find((m) => m.month === key);
      if (entry) {
        entry.count++;
      }
    }

    return months;
  }

  private aggregateByWeek(dates: Date[]): Array<{ week: string; count: number }> {
    const now = new Date();
    const weeks: Array<{ week: string; count: number }> = [];

    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const weekNum = this.getWeekNumber(d);
      const key = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
      weeks.push({ week: key, count: 0 });
    }

    for (const date of dates) {
      const weekNum = this.getWeekNumber(date);
      const key = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
      const entry = weeks.find((w) => w.week === key);
      if (entry) {
        entry.count++;
      }
    }

    return weeks;
  }

  private aggregateTopReports(
    logs: Array<{ resource: string; resourceId?: string }>,
  ): Array<{ reportId: string; count: number }> {
    const counts = new Map<string, number>();

    for (const log of logs) {
      if (log.resource === 'report' && log.resourceId) {
        counts.set(log.resourceId, (counts.get(log.resourceId) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map(([reportId, count]) => ({ reportId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private aggregateTopSectors(
    logs: Array<{ userId: string }>,
    users: Array<{ id: string; sectors: SectorCode[] }>,
  ): Array<{ sector: string; count: number }> {
    const userSectors = new Map<string, SectorCode[]>();
    for (const user of users) {
      userSectors.set(user.id, user.sectors);
    }

    const counts = new Map<string, number>();

    for (const log of logs) {
      const sectors = userSectors.get(log.userId);
      if (sectors) {
        for (const sector of sectors) {
          counts.set(sector, (counts.get(sector) ?? 0) + 1);
        }
      }
    }

    return Array.from(counts.entries())
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getWeekNumber(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
