import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT = 'dashboard-power-bi-totp-salt';

@Injectable()
export class TotpEncryptionService {
  private readonly logger = new Logger(TotpEncryptionService.name);
  private readonly key: Buffer | null;

  constructor(private readonly configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('TOTP_ENCRYPTION_KEY');

    if (encryptionKey) {
      this.key = scryptSync(encryptionKey, SALT, 32);
    } else {
      this.key = null;
      this.logger.warn(
        'TOTP_ENCRYPTION_KEY não definida — secrets TOTP serão armazenados em plain text.',
      );
    }
  }

  encrypt(plaintext: string): string {
    if (!this.key) {
      return plaintext;
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [iv.toString('base64'), encrypted.toString('base64'), authTag.toString('base64')].join(
      ':',
    );
  }

  decrypt(encryptedValue: string): string {
    if (!this.key) {
      return encryptedValue;
    }

    const parts = encryptedValue.split(':');

    if (parts.length !== 3) {
      throw new Error('Formato de valor criptografado inválido.');
    }

    const iv = Buffer.from(parts[0]!, 'base64');
    const encrypted = Buffer.from(parts[1]!, 'base64');
    const authTag = Buffer.from(parts[2]!, 'base64');

    const decipher = createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }
}
