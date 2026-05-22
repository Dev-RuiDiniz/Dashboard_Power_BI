import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthUser, SectorCode, UserRole } from '../types/auth.types';

export type CreateUserInput = {
  id: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  sectors: SectorCode[];
  groupIds?: string[];
};

export type UpdateUserInput = Partial<Pick<AuthUser, 'email' | 'roles' | 'sectors' | 'groupIds' | 'isActive' | 'passwordHash'>>;

@Injectable()
export class UsersRepository {
  private readonly users = new Map<string, AuthUser>();

  constructor(private readonly configService: ConfigService) {
    this.seedDevelopmentUsers();
  }

  async findAll(): Promise<AuthUser[]> {
    return Array.from(this.users.values());
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.users.get(email.toLowerCase()) ?? null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    return Array.from(this.users.values()).find((user) => user.id === id) ?? null;
  }

  async create(input: CreateUserInput): Promise<AuthUser> {
    const now = new Date();
    const user: AuthUser = {
      id: input.id,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      roles: input.roles,
      sectors: input.sectors,
      groupIds: input.groupIds ?? [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deactivatedAt: null,
    };

    this.users.set(user.email, user);

    return user;
  }

  async update(id: string, input: UpdateUserInput): Promise<AuthUser | null> {
    const current = await this.findById(id);

    if (!current) {
      return null;
    }

    if (input.email && input.email.toLowerCase() !== current.email) {
      this.users.delete(current.email);
    }

    const next: AuthUser = {
      ...current,
      ...input,
      email: (input.email ?? current.email).toLowerCase(),
      updatedAt: new Date(),
      deactivatedAt: input.isActive === false ? current.deactivatedAt ?? new Date() : input.isActive === true ? null : current.deactivatedAt,
    };

    this.users.set(next.email, next);

    return next;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.update(id, { passwordHash });
  }

  async deactivate(id: string): Promise<AuthUser | null> {
    return this.update(id, { isActive: false });
  }

  private seedDevelopmentUsers(): void {
    const email = this.configService.get<string>('AUTH_DEMO_USER_EMAIL');
    const password = this.configService.get<string>('AUTH_DEMO_USER_PASSWORD');

    if (!email || !password) {
      return;
    }

    this.addUser('demo-admin', email, password, ['admin'], ['diretoria', 'financeiro', 'comercial', 'operacoes']);
    this.addUser('demo-viewer-financeiro', 'viewer.financeiro@example.com', password, ['viewer'], ['financeiro']);
    this.addUser('demo-downloader-financeiro', 'downloader.financeiro@example.com', password, ['downloader'], ['financeiro']);
    this.addUser('demo-viewer-comercial', 'viewer.comercial@example.com', password, ['viewer'], ['comercial']);
  }

  private addUser(id: string, email: string, password: string, roles: UserRole[], sectors: SectorCode[]): void {
    const saltRounds = Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10));
    const passwordHash = bcrypt.hashSync(password, saltRounds);
    const now = new Date();

    this.users.set(email.toLowerCase(), {
      id,
      email: email.toLowerCase(),
      passwordHash,
      roles,
      sectors,
      groupIds: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deactivatedAt: null,
    });
  }
}
