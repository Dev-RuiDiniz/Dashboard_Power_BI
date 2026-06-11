import { ApiProperty } from '@nestjs/swagger';

export class ValidateReportSourceDto {
  @ApiProperty({ enum: ['view', 'stored_procedure'], example: 'view' })
  sourceType!: 'view' | 'stored_procedure';

  @ApiProperty({ example: 'reports.vw_financeiro' })
  sourceName!: string;
}
