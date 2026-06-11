import { ApiProperty } from '@nestjs/swagger';

export class TotpVerifyDto {
  @ApiProperty({ example: '123456' })
  code!: string;
}

export class TotpLoginDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  tempToken!: string;

  @ApiProperty({ example: '123456' })
  code!: string;
}
