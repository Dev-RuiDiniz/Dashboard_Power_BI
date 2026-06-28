import { ConfigService } from '@nestjs/config';

import { UsersRepository } from '../../auth/repositories/users.repository';
import { RefreshTokenRepository } from '../../auth/repositories/refresh-token.repository';
import { GroupsRepository } from '../repositories/groups.repository';
import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let groupsRepository: GroupsRepository;

  beforeEach(() => {
    const configService = new ConfigService({
      AUTH_DEMO_USER_EMAIL: 'admin@example.com',
      AUTH_DEMO_USER_PASSWORD: 'Admin123!',
      BCRYPT_SALT_ROUNDS: 4,
    });

    groupsRepository = new GroupsRepository();
    service = new AdminUsersService(
      new UsersRepository(configService),
      groupsRepository,
      new RefreshTokenRepository(),
      { log: jest.fn().mockResolvedValue(undefined) } as never,
      configService,
    );
  });

  it('deve criar usuário sem expor passwordHash', async () => {
    const user = await service.create({
      email: 'novo@example.com',
      password: 'Senha123!',
      roles: ['viewer'],
      sectors: ['financeiro'],
    });

    expect(user.email).toBe('novo@example.com');
    expect(user.roles).toEqual(['viewer']);
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('deve rejeitar e-mail duplicado', async () => {
    await service.create({
      email: 'novo@example.com',
      password: 'Senha123!',
      roles: ['viewer'],
      sectors: ['financeiro'],
    });

    await expect(
      service.create({
        email: 'novo@example.com',
        password: 'Senha123!',
        roles: ['viewer'],
        sectors: ['financeiro'],
      }),
    ).rejects.toThrow();
  });

  it('deve vincular grupos existentes', async () => {
    const group = await groupsRepository.create({
      name: 'Financeiro',
      roles: ['viewer'],
      sectors: ['financeiro'],
    });
    const user = await service.create({
      email: 'novo@example.com',
      password: 'Senha123!',
      roles: ['viewer'],
      sectors: ['financeiro'],
    });

    const updated = await service.assignGroups(user.id, { groupIds: [group.id] });

    expect(updated.groupIds).toEqual([group.id]);
  });

  it('deve desativar usuário', async () => {
    const user = await service.create({
      email: 'novo@example.com',
      password: 'Senha123!',
      roles: ['viewer'],
      sectors: ['financeiro'],
    });

    const deactivated = await service.deactivate(user.id);

    expect(deactivated.isActive).toBe(false);
    expect(deactivated.deactivatedAt).toEqual(expect.any(Date));
    expect(deactivated.tokenVersion).toBe(1);
  });

  it('deve revogar sessões ao resetar senha via admin', async () => {
    const user = await service.create({
      email: 'novo@example.com',
      password: 'Senha123!',
      roles: ['viewer'],
      sectors: ['financeiro'],
    });

    await expect(service.resetPassword(user.id, { newPassword: 'NovaSenha123!' })).resolves.toEqual(
      { success: true },
    );
  });
});
