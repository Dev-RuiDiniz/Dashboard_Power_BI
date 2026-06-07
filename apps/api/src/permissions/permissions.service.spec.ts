import { PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
  it('registra auditoria ao criar permissao', async () => {
    const permissionsRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'permission-1',
        code: 'reports:financeiro:read',
        name: 'Ler financeiro',
      }),
    };
    const auditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };
    const service = new PermissionsService(permissionsRepository as never, auditService as never);

    await service.create(
      {
        userId: 'user-1',
        userEmail: 'admin@example.com',
      },
      {
        code: 'reports:financeiro:read',
        name: 'Ler financeiro',
        description: 'Permite leitura',
        resource: 'reports',
        action: 'read',
      },
    );

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        userEmail: 'admin@example.com',
        action: 'permissions.created',
        resource: 'permissions',
        resourceId: 'permission-1',
      }),
    );
  });
});
