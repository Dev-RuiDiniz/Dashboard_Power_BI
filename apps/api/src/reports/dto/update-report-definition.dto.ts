import { PartialType } from '@nestjs/swagger';

import { CreateReportDefinitionDto } from './create-report-definition.dto';

export class UpdateReportDefinitionDto extends PartialType(CreateReportDefinitionDto) {}
