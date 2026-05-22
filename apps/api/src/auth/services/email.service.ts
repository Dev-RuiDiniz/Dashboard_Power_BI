import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type PasswordResetEmailPayload = {
  to: string;
  resetUrl: string;
  expiresInSeconds: number;
};

export type SentEmail = PasswordResetEmailPayload & {
  subject: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly sentEmails: SentEmail[] = [];

  constructor(private readonly configService: ConfigService) {}

  async sendPasswordResetEmail(payload: PasswordResetEmailPayload): Promise<void> {
    const subject = 'Redefinição de senha - Dashboard Power BI';

    if (this.isMockMode()) {
      this.sentEmails.push({
        ...payload,
        subject,
      });

      this.logger.log(`password_reset_email_mocked to=${this.maskEmail(payload.to)}`);
      return;
    }

    // Adapter SMTP intencionalmente isolado para evolução futura com provedor real.
    // Nesta fase, evita-se adicionar dependência externa e mantém-se o envio mockável em testes.
    this.logger.log(`password_reset_email_prepared to=${this.maskEmail(payload.to)}`);
  }

  getSentEmails(): SentEmail[] {
    return [...this.sentEmails];
  }

  clearSentEmails(): void {
    this.sentEmails.length = 0;
  }

  private isMockMode(): boolean {
    return this.configService.get<string>('SMTP_MODE', 'mock') === 'mock';
  }

  private maskEmail(email: string): string {
    const [name, domain] = email.trim().toLowerCase().split('@');

    if (!name || !domain) {
      return 'invalid-email';
    }

    return `${name.slice(0, 2)}***@${domain}`;
  }
}
