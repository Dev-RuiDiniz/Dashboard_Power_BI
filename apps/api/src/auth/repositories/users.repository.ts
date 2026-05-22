import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthUser, SectorCode, UserRole } from '../types/auth.types';

@Injectable()
export class UsersRepository {
  private readonly users = new Map<string, AuthUser>();

  constructor(private readonly configService: ConfigService) {
    this.seedDevelopmentUsers();
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.users.get(email.toLowerCase()) ?? null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    return Array.from(this.users.values()).find((user) => user.id === id) ?? null;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    const user = await this.findById(id);

    if (!user) {
      return;
    }

    this.users.set(user.email.toLowerCase(), {
      ...user,
      passwordHash,
    });
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

    this.users.set(email.toLowerCase(), {
      id,
      email: email.toLowerCase(),
      passwordHash,
      roles,
      sectors,
      isActive: true,
    });
  }
}
