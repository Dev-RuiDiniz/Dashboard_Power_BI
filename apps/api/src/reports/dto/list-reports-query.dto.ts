import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListReportsQueryDto {
  @ApiPropertyOptional({ example: 'financeiro' })
  sector?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number | string;

  @ApiPropertyOptional({ example: 20, default: 20, maximum: 100 })
  pageSize?: number | string;
}
