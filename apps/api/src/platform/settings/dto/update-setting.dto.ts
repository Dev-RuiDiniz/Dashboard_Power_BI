import { IsString, IsIn, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const ALLOWED_SETTING_KEYS = [
  'theme.default',
  'theme.primaryColor',
  'dashboard.defaultRefreshInterval',
  'reports.maxRows',
  'exports.retentionDays',
  'notifications.emailEnabled',
  'session.idleTimeoutMinutes',
] as const;

export class UpdateSettingDto {
  @ApiProperty({ example: 'theme.primaryColor', enum: ALLOWED_SETTING_KEYS })
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_SETTING_KEYS)
  key!: string;

  @ApiProperty({ example: '#1a73e8' })
  @IsObject()
  value!: unknown;
}
