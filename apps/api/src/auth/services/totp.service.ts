import { Injectable } from '@nestjs/common';
import { createHmac, randomBytes } from 'node:crypto';

@Injectable()
export class TotpService {
  generateSecret(userId: string, email: string): { secret: string; otpauthUrl: string } {
    const rawSecret = randomBytes(20);
    const secret = this.toBase32(rawSecret);
    const issuer = 'Dashboard Power BI';
    const label = encodeURIComponent(`${issuer}:${email}`);
    const issuerParam = encodeURIComponent(issuer);
    const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=${issuerParam}&algorithm=SHA1&digits=6&period=30`;

    return { secret, otpauthUrl };
  }

  verifyToken(secret: string, token: string): boolean {
    if (!/^\d{6}$/.test(token)) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const timeStep = 30;

    for (const offset of [-1, 0, 1]) {
      const counter = Math.floor((now + offset * timeStep) / timeStep);
      const expected = this.generateTokenAtCounter(secret, counter);

      if (expected === token) {
        return true;
      }
    }

    return false;
  }

  generateTokenAtCounter(secret: string, counter: number): string {
    const secretBytes = this.fromBase32(secret);
    const counterBuffer = Buffer.alloc(8);
    const high = Math.floor(counter / 0x100000000);
    const low = counter % 0x100000000;

    counterBuffer.writeUInt32BE(high, 0);
    counterBuffer.writeUInt32BE(low, 4);

    const hmac = createHmac('sha1', secretBytes);
    hmac.update(counterBuffer);
    const digest = hmac.digest();

    const offset = digest.at(-1)! & 0x0f;
    const code =
      ((digest.at(offset)! & 0x7f) << 24) |
      ((digest.at(offset + 1)! & 0xff) << 16) |
      ((digest.at(offset + 2)! & 0xff) << 8) |
      (digest.at(offset + 3)! & 0xff);

    const token = (code % 1_000_000).toString().padStart(6, '0');

    return token;
  }

  private toBase32(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer.at(i)!;
      bits += 8;

      while (bits >= 5) {
        output += alphabet.charAt((value >>> (bits - 5)) & 31);
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += alphabet.charAt((value << (5 - bits)) & 31);
    }

    return output;
  }

  private fromBase32(encoded: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const map = new Map<string, number>();

    for (let i = 0; i < alphabet.length; i++) {
      map.set(alphabet.charAt(i), i);
    }

    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (const char of encoded.toUpperCase()) {
      const val = map.get(char);

      if (val === undefined) {
        continue;
      }

      value = (value << 5) | val;
      bits += 5;

      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }

    return Buffer.from(output);
  }
}
