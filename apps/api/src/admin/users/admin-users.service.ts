import * as bcrypt from 'bcrypt';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';

import { GroupsRepository } from '../repositories/groups.repository';
import { AuthUser } from '../../auth/types/auth.types';
import { UsersRepository } from '../../auth/repositories/users.repository';
import { RefreshTokenRepository } from '../../auth/repositories/refresh-token.repository';
import { AssignUserGroupsDto } from './dto/assign-user-groups.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { ResetAdminUserPasswordDto } from './dto/reset-admin-user-password.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

export type AdminUserResponse = Omit<AuthUser, 'passwordHash'>;

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly groupsRepository: GroupsRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly configService: ConfigService,
  ) {}

  async list(): Promise<AdminUserResponse[]> {
    return (await this.usersRepository.findAll()).map((user) => this.toResponse(user));
  }

  async getById(id: string): Promise<AdminUserResponse> {
    return this.toResponse(await this.getUserOrThrow(id));
  }

  async create(dto: CreateAdminUserDto): Promise<AdminUserResponse> {
    const email = dto.email.toLowerCase();
    const existing = await this.usersRepository.findByEmail(email);

    if (existing) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }

    await this.assertGroupsExist(dto.groupIds ?? []);

    const user = await this.usersRepository.create({
      id: randomUUID(),
      email,
      passwordHash: await this.hashPassword(dto.password),
      roles: dto.roles,
      sectors: dto.sectors,
      groupIds: dto.groupIds ?? [],
    });

    return this.toResponse(user);
  }

  async update(id: string, dto: UpdateAdminUserDto): Promise<AdminUserResponse> {
    const current = await this.getUserOrThrow(id);

    if (dto.email && dto.email.toLowerCase() !== current.email) {
      const existing = await this.usersRepository.findByEmail(dto.email);

      if (existing && existing.id !== id) {
        throw new ConflictException('Já existe um usuário com este e-mail.');
      }
    }

    if (dto.groupIds) {
      await this.assertGroupsExist(dto.groupIds);
    }

    const updated = await this.usersRepository.update(id, dto);

    if (!updated) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.toResponse(updated);
  }

  async deactivate(id: string): Promise<AdminUserResponse> {
    const user = await this.usersRepository.deactivate(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.usersRepository.incrementTokenVersion(id);
    await this.refreshTokenRepository.revokeActiveByUserId(id);

    const updated = await this.usersRepository.findById(id);
    return this.toResponse(updated ?? user);
  }

  async resetPassword(id: string, dto: ResetAdminUserPasswordDto): Promise<{ success: true }> {
    await this.getUserOrThrow(id);
    await this.usersRepository.updatePasswordHash(id, await this.hashPassword(dto.newPassword));
    await this.usersRepository.incrementTokenVersion(id);
    await this.refreshTokenRepository.revokeActiveByUserId(id);

    return { success: true };
  }

  async assignGroups(id: string, dto: AssignUserGroupsDto): Promise<AdminUserResponse> {
    await this.getUserOrThrow(id);
    await this.assertGroupsExist(dto.groupIds);

    const updated = await this.usersRepository.update(id, { groupIds: dto.groupIds });

    if (!updated) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.toResponse(updated);
  }

  private async assertGroupsExist(groupIds: string[]): Promise<void> {
    for (const groupId of groupIds) {
      const group = await this.groupsRepository.findById(groupId);

      if (!group) {
        throw new NotFoundException(`Grupo não encontrado: ${groupId}`);
      }
    }
  }

  private async getUserOrThrow(id: string): Promise<AuthUser> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10));

    return bcrypt.hash(password, saltRounds);
  }

  private toResponse(user: AuthUser): AdminUserResponse {
    const { passwordHash: _passwordHash, ...response } = user;

    return response;
  }
}
