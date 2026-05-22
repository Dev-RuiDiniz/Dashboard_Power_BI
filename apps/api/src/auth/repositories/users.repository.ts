import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthUser } from '../types/auth.types';

@Injectable()
export class UsersRepository {
  private readonly users = new Map<string, AuthUser>();

  constructor(private readonly configService: ConfigService) {
    this.seedDevelopmentUser();
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.users.get(email.toLowerCase()) ?? null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    return Array.from(this.users.values()).find((user) => user.id === id) ?? null;
  }

  private seedDevelopmentUser(): void {
    const email = this.configService.get<string>('AUTH_DEMO_USER_EMAIL');
    const password = this.configService.get<string>('AUTH_DEMO_USER_PASSWORD');

    if (!email || !password) {
      return;
    }

    const saltRounds = Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10));
    const passwordHash = bcrypt.hashSync(password, saltRounds);

    this.users.set(email.toLowerCase(), {
      id: 'demo-admin',
      email: email.toLowerCase(),
      passwordHash,
      roles: ['admin'],
      isActive: true,
    });
  }
}
