import { GroupsRepository } from '../repositories/groups.repository';
import { AdminGroupsService } from './admin-groups.service';

describe('AdminGroupsService', () => {
  let service: AdminGroupsService;

  beforeEach(() => {
    service = new AdminGroupsService(new GroupsRepository());
  });

  it('deve criar grupo', async () => {
    const group = await service.create({
      name: 'Financeiro',
      roles: ['viewer'],
      sectors: ['financeiro'],
    });

    expect(group.id).toEqual(expect.any(String));
    expect(group.name).toBe('Financeiro');
  });

  it('deve rejeitar nome duplicado', async () => {
    await service.create({
      name: 'Financeiro',
      roles: ['viewer'],
      sectors: ['financeiro'],
    });

    await expect(
      service.create({
        name: 'Financeiro',
        roles: ['viewer'],
        sectors: ['financeiro'],
      }),
    ).rejects.toThrow();
  });

  it('deve editar grupo', async () => {
    const group = await service.create({
      name: 'Financeiro',
      roles: ['viewer'],
      sectors: ['financeiro'],
    });

    const updated = await service.update(group.id, {
      name: 'Financeiro Admin',
      roles: ['admin'],
      sectors: ['financeiro', 'diretoria'],
    });

    expect(updated.name).toBe('Financeiro Admin');
    expect(updated.roles).toEqual(['admin']);
  });

  it('deve remover grupo', async () => {
    const group = await service.create({
      name: 'Financeiro',
      roles: ['viewer'],
      sectors: ['financeiro'],
    });

    await expect(service.delete(group.id)).resolves.toEqual({ success: true });
  });

  it('deve criar grupo com permissionIds', async () => {
    const group = await service.create({
      name: 'Financeiro Readers',
      roles: ['viewer'],
      sectors: ['financeiro'],
      permissionIds: ['perm-1', 'perm-2'],
    });

    expect(group.permissionIds).toEqual(['perm-1', 'perm-2']);
  });

  it('deve atualizar permissionIds do grupo', async () => {
    const group = await service.create({
      name: 'Financeiro',
      roles: ['viewer'],
      sectors: ['financeiro'],
    });

    expect(group.permissionIds).toEqual([]);

    const updated = await service.update(group.id, {
      permissionIds: ['perm-1'],
    });

    expect(updated.permissionIds).toEqual(['perm-1']);
  });
});
