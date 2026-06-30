import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  function createService(overrides?: {
    users?: unknown[];
    groups?: unknown[];
    exports?: unknown[];
    auditLogs?: unknown[];
  }) {
    const adminUsersService = {
      list: jest.fn().mockResolvedValue(overrides?.users ?? []),
    };
    const groupsRepository = {
      findAll: jest.fn().mockResolvedValue(overrides?.groups ?? []),
    };
    const exportsService = {
      listForUser: jest.fn().mockResolvedValue(overrides?.exports ?? []),
    };
    const auditService = {
      list: jest.fn().mockResolvedValue(overrides?.auditLogs ?? []),
    };

    return {
      service: new AdminDashboardService(
        adminUsersService as never,
        groupsRepository as never,
        exportsService as never,
        auditService as never,
      ),
      mocks: { adminUsersService, groupsRepository, exportsService, auditService },
    };
  }

  it('retorna totais corretos quando todos os services têm dados', async () => {
    const { service } = createService({
      users: [
        { id: '1', isActive: true },
        { id: '2', isActive: false },
        { id: '3', isActive: true },
      ],
      groups: [{ id: 'g1' }, { id: 'g2' }],
      exports: [{ id: 'e1' }, { id: 'e2' }, { id: 'e3' }],
      auditLogs: [
        {
          id: 'a1',
          userEmail: 'admin@test.com',
          action: 'CREATE',
          resource: 'user',
          createdAt: new Date(),
        },
        {
          id: 'a2',
          userEmail: 'admin@test.com',
          action: 'UPDATE',
          resource: 'permission',
          createdAt: new Date(),
        },
      ],
    });

    const result = await service.getMetrics();

    expect(result.totalUsers).toBe(3);
    expect(result.activeUsers).toBe(2);
    expect(result.totalGroups).toBe(2);
    expect(result.totalExports).toBe(3);
    expect(result.recentActivity).toHaveLength(2);
  });

  it('retorna zeros quando todos os services retornam vazio', async () => {
    const { service } = createService();

    const result = await service.getMetrics();

    expect(result.totalUsers).toBe(0);
    expect(result.activeUsers).toBe(0);
    expect(result.totalGroups).toBe(0);
    expect(result.totalExports).toBe(0);
    expect(result.recentActivity).toHaveLength(0);
  });

  it('lida com erro de um service retornando fallback para 0', async () => {
    const adminUsersService = {
      list: jest.fn().mockRejectedValue(new Error('DB error')),
    };
    const groupsRepository = {
      findAll: jest.fn().mockResolvedValue([{ id: 'g1' }]),
    };
    const exportsService = {
      listForUser: jest.fn().mockResolvedValue([]),
    };
    const auditService = {
      list: jest.fn().mockResolvedValue([]),
    };

    const service = new AdminDashboardService(
      adminUsersService as never,
      groupsRepository as never,
      exportsService as never,
      auditService as never,
    );

    const result = await service.getMetrics();

    expect(result.totalUsers).toBe(0);
    expect(result.activeUsers).toBe(0);
    expect(result.totalGroups).toBe(1);
    expect(result.totalExports).toBe(0);
    expect(result.recentActivity).toHaveLength(0);
  });

  describe('getTrends', () => {
    it('retorna agregacoes corretas com dados', async () => {
      const now = new Date();
      const { service } = createService({
        users: [
          { id: 'u1', isActive: true, createdAt: now, sectors: ['operacoes'] },
          { id: 'u2', isActive: true, createdAt: now, sectors: ['comercial'] },
        ],
        exports: [
          { id: 'e1', created_at: now.toISOString() },
          { id: 'e2', created_at: now.toISOString() },
        ],
        auditLogs: [
          {
            id: 'a1',
            userId: 'u1',
            action: 'VIEW',
            resource: 'report',
            resourceId: 'r1',
            createdAt: now,
          },
          {
            id: 'a2',
            userId: 'u1',
            action: 'VIEW',
            resource: 'report',
            resourceId: 'r1',
            createdAt: now,
          },
          {
            id: 'a3',
            userId: 'u2',
            action: 'VIEW',
            resource: 'report',
            resourceId: 'r2',
            createdAt: now,
          },
        ],
      });

      const trends = await service.getTrends();

      expect(trends.usersByMonth).toHaveLength(12);
      const currentMonth = trends.usersByMonth[11];
      expect(currentMonth.count).toBe(2);

      expect(trends.activityByWeek).toHaveLength(8);
      const currentWeek = trends.activityByWeek[7];
      expect(currentWeek.count).toBe(3);

      expect(trends.exportsByWeek).toHaveLength(8);
      expect(trends.exportsByWeek[7].count).toBe(2);

      expect(trends.topReports).toHaveLength(2);
      expect(trends.topReports[0]).toEqual({ reportId: 'r1', count: 2 });
      expect(trends.topReports[1]).toEqual({ reportId: 'r2', count: 1 });

      expect(trends.topSectors).toHaveLength(2);
      expect(trends.topSectors[0]).toEqual({ sector: 'operacoes', count: 2 });
      expect(trends.topSectors[1]).toEqual({ sector: 'comercial', count: 1 });
    });

    it('retorna arrays vazios quando sem dados', async () => {
      const { service } = createService();

      const trends = await service.getTrends();

      expect(trends.usersByMonth).toHaveLength(12);
      expect(trends.usersByMonth.every((m) => m.count === 0)).toBe(true);

      expect(trends.activityByWeek).toHaveLength(8);
      expect(trends.activityByWeek.every((w) => w.count === 0)).toBe(true);

      expect(trends.exportsByWeek).toHaveLength(8);
      expect(trends.exportsByWeek.every((w) => w.count === 0)).toBe(true);

      expect(trends.topReports).toHaveLength(0);
      expect(trends.topSectors).toHaveLength(0);
    });

    it('lida com erro de service retornando fallback vazio', async () => {
      const adminUsersService = {
        list: jest.fn().mockRejectedValue(new Error('DB error')),
      };
      const groupsRepository = {
        findAll: jest.fn().mockResolvedValue([]),
      };
      const exportsService = {
        listForUser: jest.fn().mockRejectedValue(new Error('DB error')),
      };
      const auditService = {
        list: jest.fn().mockResolvedValue([]),
      };

      const service = new AdminDashboardService(
        adminUsersService as never,
        groupsRepository as never,
        exportsService as never,
        auditService as never,
      );

      const trends = await service.getTrends();

      expect(trends.usersByMonth).toHaveLength(12);
      expect(trends.usersByMonth.every((m) => m.count === 0)).toBe(true);
      expect(trends.topReports).toHaveLength(0);
      expect(trends.topSectors).toHaveLength(0);
    });

    it('limita top reports e top setores a 5', async () => {
      const now = new Date();
      const users = Array.from({ length: 6 }, (_, i) => ({
        id: `u${i}`,
        isActive: true,
        createdAt: now,
        sectors: [`sector${i}` as never],
      }));
      const auditLogs = Array.from({ length: 6 }, (_, i) => ({
        id: `a${i}`,
        userId: `u${i}`,
        action: 'VIEW',
        resource: 'report',
        resourceId: `r${i}`,
        createdAt: now,
      }));

      const { service } = createService({ users, auditLogs });

      const trends = await service.getTrends();

      expect(trends.topReports).toHaveLength(5);
      expect(trends.topSectors).toHaveLength(5);
    });
  });
});
