import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !serviceRoleKey) {
      this.logger.log('Supabase não configurado — persistência em memória ativa.');
      return;
    }

    this.client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    this.logger.log('Supabase configurado — persistência via banco ativa.');
  }

  isEnabled(): boolean {
    return this.client !== null;
  }

  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase não está configurado.');
    }

    return this.client;
  }
}
