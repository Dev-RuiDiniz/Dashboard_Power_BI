import { ConfigService } from '@nestjs/config';

import { EmailService } from './email.service';

describe('EmailService', () => {
  it('deve enviar e-mail de recuperação usando adapter mockado', async () => {
    const service = new EmailService(new ConfigService({ SMTP_MODE: 'mock' }));

    await service.sendPasswordResetEmail({
      to: 'admin@example.com',
      resetUrl: 'http://localhost:3000/reset-password?token=token-temporario',
      expiresInSeconds: 900,
    });

    expect(service.getSentEmails()).toHaveLength(1);
    expect(service.getSentEmails()[0]).toEqual({
      to: 'admin@example.com',
      resetUrl: http://localhost:3000/reset-password?token=token-temporario',
      expiresInSeconds: 900,
      subject: 'Redefinição de senha - Dashboard Power BI',
    });
  });

  it('deve limpar e-mails enviados do adapter mockado', async () => {
    const service = new EmailService(new ConfigService({ SMTP_MODE: 'mock' }));

    await service.sendPasswordResetEmail({
      to: 'admin@example.com',
      resetUrl: 'http://localhost:3000/reset-password?token=token-temporario',
      expiresInSeconds: 900,
    });

    service.clearSentEmails();

    expect(service.getSentEmails()).toHaveLength(0);
  });
});
