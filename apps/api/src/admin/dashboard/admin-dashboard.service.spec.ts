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
});
