import { ConfigService } from '@nestjs/config';

import { GroupsRepository } from '../admin/repositories/groups.repository';
import { UsersRepository } from '../auth/repositories/users.repository';
import { PermissionsRepository } from './repositories/permissions.repository';
import { EffectivePermissionsService } from './effective-permissions.service';

describe('EffectivePermissionsService', () => {
  let groupsRepository: GroupsRepository;
  let usersRepository: UsersRepository;
  let permissionsRepository: PermissionsRepository;
  let service: EffectivePermissionsService;

  beforeEach(() => {
    const configService = new ConfigService({
      AUTH_DEMO_USER_EMAIL: 'admin@example.com',
      AUTH_DEMO_USER_PASSWORD: 'Admin123!',
      APP_MODE: 'demo',
    });

    groupsRepository = new GroupsRepository(configService);
    usersRepository = new UsersRepository(configService);
    permissionsRepository = new PermissionsRepository();
    service = new EffectivePermissionsService(
      groupsRepository,
      usersRepository,
      permissionsRepository,
    );
  });

  it('deve retornar lista vazia para usuário sem grupos', async () => {
    const codes = await service.getEffectivePermissionCodes('demo-admin');
    expect(codes).toEqual([]);
  });

  it('deve herdar permissões de um grupo associado', async () => {
    const perm = await permissionsRepository.create({
      code: 'reports:financeiro:read',
      name: 'Ler relatórios financeiros',
      description: 'Permissão de leitura do setor financeiro',
      resource: 'reports',
      action: 'read',
    });

    const group = await groupsRepository.create({
      name: 'Financeiro Readers',
      roles: ['viewer'],
      sectors: ['financeiro'],
      permissionIds: [perm.id],
    });

    await usersRepository.update('demo-viewer-financeiro', { groupIds: [group.id] });

    const codes = await service.getEffectivePermissionCodes('demo-viewer-financeiro');
    expect(codes).toContain('reports:financeiro:read');
  });

  it('deve unir permissões de múltiplos grupos', async () => {
    const perm1 = await permissionsRepository.create({
      code: 'reports:financeiro:read',
      name: 'Ler relatórios financeiros',
      description: '',
      resource: 'reports',
      action: 'read',
    });
    const perm2 = await permissionsRepository.create({
      code: 'reports:financeiro:export',
      name: 'Exportar relatórios financeiros',
      description: '',
      resource: 'reports',
      action: 'export',
    });

    const group1 = await groupsRepository.create({
      name: 'Group A',
      roles: ['viewer'],
      sectors: ['financeiro'],
      permissionIds: [perm1.id],
    });
    const group2 = await groupsRepository.create({
      name: 'Group B',
      roles: ['viewer'],
      sectors: ['financeiro'],
      permissionIds: [perm2.id],
    });

    await usersRepository.update('demo-viewer-financeiro', {
      groupIds: [group1.id, group2.id],
    });

    const codes = await service.getEffectivePermissionCodes('demo-viewer-financeiro');
    expect(codes).toHaveLength(2);
    expect(codes).toContain('reports:financeiro:read');
    expect(codes).toContain('reports:financeiro:export');
  });

  it('não deve herdar permissões de grupo inativo', async () => {
    const perm = await permissionsRepository.create({
      code: 'reports:financeiro:read',
      name: 'Ler relatórios financeiros',
      description: '',
      resource: 'reports',
      action: 'read',
    });

    const group = await groupsRepository.create({
      name: 'Inactive Group',
      roles: ['viewer'],
      sectors: ['financeiro'],
      permissionIds: [perm.id],
    });

    await groupsRepository.update(group.id, { isActive: false });
    await usersRepository.update('demo-viewer-financeiro', { groupIds: [group.id] });

    const codes = await service.getEffectivePermissionCodes('demo-viewer-financeiro');
    expect(codes).toEqual([]);
  });

  it('não deve contar permissão inativa', async () => {
    const perm = await permissionsRepository.create({
      code: 'reports:financeiro:read',
      name: 'Ler relatórios financeiros',
      description: '',
      resource: 'reports',
      action: 'read',
    });

    await permissionsRepository.update(perm.id, { isActive: false });

    const group = await groupsRepository.create({
      name: 'Group With Inactive Perm',
      roles: ['viewer'],
      sectors: ['financeiro'],
      permissionIds: [perm.id],
    });

    await usersRepository.update('demo-viewer-financeiro', { groupIds: [group.id] });

    const codes = await service.getEffectivePermissionCodes('demo-viewer-financeiro');
    expect(codes).toEqual([]);
  });

  it('deve retornar false em hasPermission quando usuário não tem a permissão', async () => {
    const result = await service.hasPermission('demo-viewer-financeiro', 'reports:any:read');
    expect(result).toBe(false);
  });

  it('deve retornar true em hasPermission quando usuário tem a permissão herdada', async () => {
    const perm = await permissionsRepository.create({
      code: 'reports:financeiro:read',
      name: 'Ler relatórios financeiros',
      description: '',
      resource: 'reports',
      action: 'read',
    });

    const group = await groupsRepository.create({
      name: 'Financeiro Readers',
      roles: ['viewer'],
      sectors: ['financeiro'],
      permissionIds: [perm.id],
    });

    await usersRepository.update('demo-viewer-financeiro', { groupIds: [group.id] });

    const result = await service.hasPermission('demo-viewer-financeiro', 'reports:financeiro:read');
    expect(result).toBe(true);
  });
});
